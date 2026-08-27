const express = require('express')
const mongoose = require('mongoose')
const { BankAccount, Transaction, userModel } = require('../models/Users.model')

// Create a transaction: Deposit, Withdrawal, Transfer
const createTransaction = async (req, res) => {
  const {accountId, type, amount, description, targetAccountNumber } = req.body
  const userId = req.user && req.user.id
  if (!accountId || !type || amount === undefined) 
    return res.status(400).json({ message: "Missing required fields" })
   // const amount = Number(amount);
    const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) return res.status(400).json({ message: 'Amount must be positive' })

  const session = await mongoose.startSession()
  try {
    let resultTxn = null
    await session.withTransaction(async () => {
      //const account = await BankAccount.findById(accountId).session(session)
      if (!accountId) throw new Error('Source account not found')
      // ensure the requester owns the source account unless admin role handled elsewhere
      if (String(accountId.userId) !== String(userId)) throw new Error('Unauthorized for this account')
      const normalizedType = type.toLowerCase()
      if (normalizedType === 'deposit') {
        accountId.balance = Number(accountId.balance) + Number(amount)
        await accountId.save({ session })
        const txn = new Transaction({accountId, type, amount, description, status: 'Completed' })
        resultTxn = await txn.save({ session })
      } else if (normalizedType === 'withdrawal') {
        if (accountId.balance < amount) throw new Error('Insufficient funds')
        accountId.balance = Number(accountId.balance) - Number(amount)
        await accountId.save({ session })
        const txn = new Transaction({accountId, type, amount, description, status: 'Completed' })
        resultTxn = await txn.save({ session })
      } else if (normalizedType === 'Transfer') {

        const { targetAccountNumber } = req.body

        if (!targetAccountNumber) {
          throw new Error('Target account number is required')
        }

        const senderAccount = accountId;
         await BankAccount.findById(accountId).session(session)

        const receiverAccount = await BankAccount.findOne({
          accountNumber: targetAccountNumber
        }).session(session)

        if (!receiverAccount) {
          throw new Error('Recipient account not found')
        }

        if (String(senderAccount._id) === String(receiverAccount._id)) {
          throw new Error('Cannot transfer to same account')
        }

        if (senderAccount.balance < amount) {
          throw new Error('Insufficient funds')
        }

        // deduct from sender
        senderAccount.balance -= Number(amount)

        // add to receiver
        receiverAccount.balance += Number(amount)

        await senderAccount.save({ session })
        await receiverAccount.save({ session })

        const referenceId = new mongoose.Types.ObjectId().toString()

        const senderTxn = new Transaction({
          accountId,
          type: 'Transfer',
          amount: Number(amount),
          description,
          referenceId,
          status: 'Completed'
        })

        const receiverTxn = new Transaction({
          accountId,
          type: 'Deposit',
           amount: Number(amount),
          description: `Transfer received`,
          referenceId,
          status: 'Completed'
        })

        await senderTxn.save({ session })
        await receiverTxn.save({ session })

        resultTxn = senderTxn
      } else {
        throw new Error('Unsupported transaction type')
      }
    })

    return res.status(201).json({ message: 'Transaction successful', data: resultTxn })
  } catch (error) {
   return res.status(400).json({ message: error.message || 'Transaction failed' });
  } finally {
    session.endSession()
  }
}

// List transactions for authenticated user
const loggedInUserTransactions = async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const accounts = await BankAccount.find({ userId }).select('_id')
    const accountIds = accounts.map(a => a._id)
    //const transactions = await Transaction.find({ accountId: { $in: accountIds } })
    .populate({ path: 'accountId', select: 'accountNumber bankName accountType' })
    .sort({ createdAt: -1 })
    return res.status(200).json({ message: 'Transactions successful'})
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch transactions', error: error.message })
  }
}
const userDetails = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({ message: 'Users fetched', data: users });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
}
const userAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.findOne().populate('userId', 'firstName email role');

    res.json({ message: 'Accounts fetched', data: accounts });
  } catch (err) {
    console.log(error.message)
    res.status(500).json({ message: 'Error fetching accounts', error: err.message });
  }
}
const userAccountsId = async (req, res) => {
  console.log(req.body)
  try {
    const account = await BankAccount.findById(req.params.id)
      .populate('userId', 'username email role');
    if (!account) {
      console.log(req.query)
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ message: 'Account fetched', data: account });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching account', error: err.message });
  }
}

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user && req.user.id
    const txn = await Transaction.findById(id).populate({ select: 'userId accountNumber' })
    if (!txn) return res.status(404).json({ message: 'Transaction not found' })
    // ensure the transaction belongs to one of the user's accounts
    if (String(txn.userId) !== String(userId) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    return res.status(200).json({ message: 'Transaction fetched', data: txn })
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch transaction', error: error.message })
  }
}
module.exports = { createTransaction, loggedInUserTransactions, getTransactionById, userDetails, userAccounts, userAccountsId }

// const mongoose = require("mongoose");
// const { BankAccount, Transaction } = require("../models/Users.model");

// const createTransaction = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { accountId, type, amount, description, targetAccountNumber } = req.body;
//     const userId = req.user?.id;

//     // ✅ Validation
//     if (!accountId || !type || !amount) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(accountId)) {
//       return res.status(400).json({ message: "Invalid accountId" });
//     }

//     const numericAmount = Number(amount);
//     if (numericAmount <= 0) {
//       return res.status(400).json({ message: "Amount must be positive" });
//     }

//     await session.withTransaction(async () => {

//       const sender = await BankAccount.findById(accountId).session(session);
//       if (!sender) throw new Error("Sender account not found");

      // ✅ Ownership check
      // if (String(sender.userId) !== String(userId)) {
      //   throw new Error("Unauthorized");
      // }

      // let receiver = null;

      // =========================
      // 💰 DEPOSIT
      // =========================
      // if (type === "deposit") {

      //   sender.balance += numericAmount;
      //   await sender.save({ session });

      //   await Transaction.create([{
      //     accountId: sender._id,
      //     type,
      //     amount: numericAmount,
      //     description,
      //     reference: generateReference()
      //   }], { session });

      // }

      // =========================
      // 💸 WITHDRAWAL
      // =========================
      // else if (type === "withdrawal") {

      //   if (sender.balance < numericAmount) {
      //     throw new Error("Insufficient funds");
      //   }

      //   sender.balance -= numericAmount;
      //   await sender.save({ session });

      //   await Transaction.create([{
      //     accountId: sender._id,
      //     type,
      //     amount: numericAmount,
      //     description,
      //     reference: generateReference()
      //   }], { session });

      // }

      // =========================
      // 🔁 TRANSFER
      // =========================
      // else if (type === "transfer") {

      //   if (!targetAccountNumber) {
      //     throw new Error("Target account required");
      //   }

      //   receiver = await BankAccount.findOne({
      //     accountNumber: targetAccountNumber
      //   }).session(session);

      //   if (!receiver) throw new Error("Recipient not found");

      //   if (String(sender._id) === String(receiver._id)) {
      //     throw new Error("Cannot transfer to same account");
      //   }

      //   if (sender.balance < numericAmount) {
      //     throw new Error("Insufficient funds");
      //   }

        // ✅ Atomic balance update
        // sender.balance -= numericAmount;
        // receiver.balance += numericAmount;

        // await sender.save({ session });
        // await receiver.save({ session });

        // const reference = generateReference();

        // sender record
        // await Transaction.create([{
        //   accountId: sender._id,
        //   targetAccountId: receiver._id,
        //   type: "transfer",
        //   amount: numericAmount,
        //   description,
        //   reference
        // }], { session });

        // receiver record (optional but realistic)
//         await Transaction.create([{
//           accountId: receiver._id,
//           targetAccountId: sender._id,
//           type: "deposit",
//           amount: numericAmount,
//           description: "Transfer received",
//           reference
//         }], { session });

//       }

//       else {
//         throw new Error("Invalid transaction type");
//       }

//     });

//     res.status(201).json({ message: "Transaction successful" });

//   } catch (error) {

//     console.error("🔥 TRANSACTION ERROR:", error);

//     res.status(400).json({
//       message: error.message || "Transaction failed"
//     });

//   } finally {
//     session.endSession();
//   }
// };
// const loggedInUserTransactions= async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const accounts = await BankAccount.findOne({ userId });

//     const accountIds = accounts.map(a => a._id);

//     const transactions = await Transaction.findOne({
//       accountId: { $in: accountIds }
//     })
//       .populate("accountId", "accountNumber")
//       .populate("targetAccountId", "accountNumber")
//       .sort({ createdAt: -1 });

//     res.json({ accounts, transactions });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


