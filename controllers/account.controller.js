const express = require('express')
const nodemailer = require('nodemailer')
const { userModel, BankAccount, Transaction } = require('../models/Users.model')
const generateAccountNumber = require('./account.number')


const getUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const accounts = await BankAccount.findOne({ userId });

    if (!accounts || accounts.length === 0) {
      return res.json({
        accounts: [],
        transactions: []
      });
    }
    const accountIds = accounts.map(acc => acc._id);
    const transactions = await Transaction.findOne({
      accountId: { $in: accountIds }
    }).populate("accountId targetAccountId");

    res.json({
      accounts,
      transactions
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getUserTransactions = async (req, res) => {
    try {
        
        const transactions = await Transaction.findOne().populate({ path: 'accountId', populate: { path: userId, select: 'accountNumber'} }) //'firstName lastName email'
        .sort({created:-1})
        .limit(50)
        .lean()

        return res.status(200).json({ message: 'Transactions fetched successfully', data: accounts, transactions })
    } catch (error) {
        return res.status(500).json({ message: 'Could not fetch transactions', error: error.message })
    }
}

const getAllUsers = async (req, res) => {
    try {
    
        const users = await userModel.find().select('-password')
        return res.status(200).json({ message: 'Users fetched successfully', data: users })
    } catch (error) {
        return res.status(500).json({ message: 'Could not fetch users', error: error.message })
    }
}

const saveUserDetails = async (req, res) => {
    try {
        const form = new userModel(req.body)
        const saved = await form.save()
        // send response before attempting email (non-blocking)
        res.status(201).json({ message: 'User saved successfully', data: saved })

        // Attempt to send a welcome email (best-effort)
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.ethereal.email',
                port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
                secure: false,
                service:'Gmail',
                auth: {
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || ''
                }
            })

            const mailOptions = {
                from: process.env.MAIL_FROM || 'no-reply@example.com',
                to: saved.email,
                subject: 'Thank you for Registering with JBank PLC',
                text: 'Welcome to JBank PLC',
              //  html: '<p>Welcome to JBank PLC</p>'
            }

            transporter.sendMail(mailOptions).catch(err => console.log('Mail send failed:', err.message))
        } catch (mailErr) {
            console.log('Mail setup failed:', mailErr.message)
        }
    } catch (error) {
        return res.status(500).json({ message: 'Failed to save user details', error: error.message })
    }
}

const issueBankAccount = async (req, res) => {
    try {
        const { userId, email, bankName = 'JBank', accountType = 'Savings', initialDeposit = 0, currency = 'NAIRA' } = req.body
        if (!userId && !email) return res.status(400).json({ message: 'userId or email is required' })

        const user = userId ? await userModel.findById(userId) : await userModel.findOne({ email })
        if (!user) return res.status(404).json({ message: 'User not found' })

        // generate a unique account number (retry a few times)
        let accountNumber
        let exists = true
        for (let i = 0; i < 5 && exists; i++) {
            accountNumber = generateAccountNumber()
            exists = await BankAccount.findOne({ accountNumber })
        }
        if (exists) return res.status(500).json({ message: 'Could not generate unique account number' })

        const account = new BankAccount({ userId: user._id, accountNumber, bankName, accountType, balance: initialDeposit, currency })
        const saved = await account.save()

        // create initial deposit transaction if deposit provided
        let saveTransaction = null;
        if (Number(initialDeposit) > 0) {
            const transaction = new Transaction({ accountId: saved._id, type: 'Deposit', amount: initialDeposit, status: 'Completed', userId: user._id, description: 'Initial deposit by admin' })
            await transaction.save()
            saveTransaction = await transaction.save()
        }
          const accountPop = await BankAccount.findById(saved._id).populate({path:'userId', select:'email username firstName lastName'}) 
          .lean()
        return res.status(201).json({ message: 'Bank account issued', data: {account:accountPop, transaction: saveTransaction }, saved })
    } catch (error) {
        return res.status(500).json({ message: 'Failed to issue bank account', error: error.message })
    }
}

module.exports = { getUserAccount, getUserTransactions, getAllUsers, saveUserDetails, issueBankAccount }
