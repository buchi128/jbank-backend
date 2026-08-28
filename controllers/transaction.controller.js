const express = require('express');
const mongoose = require('mongoose');
const { BankAccount, Transaction, userModel } = require('../models/Users.model');

const generateReference = () => `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;


const createTransaction = async (req, res) => {
  const { accountId, type, amount, description, targetAccountNumber } = req.body;
  const userId = req.user && req.user.id;

  if (!accountId || !type || amount === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be positive' });
  }

  const session = await mongoose.startSession();
  try {
    let resultTxn = null;
    await session.withTransaction(async () => {
      
      const accountDoc = await BankAccount.findById(accountId).session(session);
      if (!accountDoc) throw new Error('Source account not found');

      if (String(accountDoc.userId) !== String(userId)) {
        throw new Error('Unauthorized for this account operations');
      }

      const normalizedType = type.toLowerCase();
      const reference = generateReference();

      if (normalizedType === 'deposit') {
        accountDoc.balance = Number(accountDoc.balance) + numericAmount;
        await accountDoc.save({ session });

        const txn = new Transaction({
          accountId: accountDoc._id,
          type: 'deposit',
          amount: numericAmount,
          description: description || 'Cash Deposit',
          reference,
          status: 'completed'
        });
        resultTxn = await txn.save({ session });

      } else if (normalizedType === 'withdrawal') {
        if (Number(accountDoc.balance) < numericAmount) {
          throw new Error('Insufficient funds for withdrawal');
        }

        accountDoc.balance = Number(accountDoc.balance) - numericAmount;
        await accountDoc.save({ session });

        const txn = new Transaction({
          accountId: accountDoc._id,
          type: 'withdrawal',
          amount: numericAmount,
          description: description || 'Cash Withdrawal',
          reference,
          status: 'completed'
        });
        resultTxn = await txn.save({ session });

      } else if (normalizedType === 'transfer') {
        if (!targetAccountNumber) {
          throw new Error('Target account number is required for transfers');
        }

        const receiverAccount = await BankAccount.findOne({
          accountNumber: Number(targetAccountNumber)
        }).session(session);

        if (!receiverAccount) {
          throw new Error('Recipient account number not found');
        }

        if (String(accountDoc._id) === String(receiverAccount._id)) {
          throw new Error('Cannot transfer to the exact same account');
        }

        if (Number(accountDoc.balance) < numericAmount) {
          throw new Error('Insufficient funds for transfer');
        }

        accountDoc.balance = Number(accountDoc.balance) - numericAmount;
        receiverAccount.balance = Number(receiverAccount.balance) + numericAmount;

        await accountDoc.save({ session });
        await receiverAccount.save({ session });

      
        const senderTxn = new Transaction({
          accountId: accountDoc._id,
          targetAccountId: receiverAccount._id,
          type: 'transfer',
          amount: numericAmount,
          description: description || `Transfer to Acct: ${targetAccountNumber}`,
          reference: reference, 
          status: 'completed'
        });
        await senderTxn.save({ session });

        
        const receiverTxn = new Transaction({
          accountId: receiverAccount._id,
          type: 'deposit',
          amount: numericAmount,
          description: `Transfer received from Acct: ${accountDoc.accountNumber}`,
          reference: `${reference}-REC`, 
          status: 'completed'
        });
        await receiverTxn.save({ session });

        resultTxn = senderTxn;
      } else {
        throw new Error('Unsupported transaction request type');
      }
    });

    return res.status(201).json({ message: 'Transaction successful', data: resultTxn });
  } catch (error) {
    console.error("TRANSACTION SYSTEM FAILURE:", error.message);
    return res.status(400).json({ message: error.message || 'Transaction processing failed' });
  } finally {
    session.endSession();
  }
};


const loggedInUserTransactions = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const accounts = await BankAccount.find({ userId }).select('_id');
    const accountIds = accounts.map(a => a._id);

    
    const transactions = await Transaction.find({ accountId: { $in: accountIds } })
      .populate('accountId', 'accountNumber currency balance')
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: 'Transactions fetched successfully', data: transactions });
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch transactions list', error: error.message });
  }
};

const userDetails = async (req, res) => {
  try {
    const users = await userModel.find().select('-password');
    return res.json({ message: 'Users fetched', data: users });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

const userAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find().populate('userId', 'firstName email role');
    return res.json({ message: 'Accounts fetched', data: accounts });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching accounts', error: err.message });
  }
};

const userAccountsId = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id)
      .populate('userId', 'username email role');
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    return res.json({ message: 'Account fetched', data: account });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching account', error: err.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user.id;
    const txn = await Transaction.findById(id).populate('accountId', 'userId accountNumber');
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    
    return res.status(200).json({ message: 'Transaction fetched', data: txn });
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch transaction details', error: error.message });
  }
};

module.exports = { 
  createTransaction, 
  loggedInUserTransactions, 
  getTransactionById, 
  userDetails, 
  userAccounts, 
  userAccountsId 
};
