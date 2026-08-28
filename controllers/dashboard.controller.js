const express = require('express')
const { userModel, BankAccount, Transaction } = require('../models/Users.model')

const adminDashboard = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments()
    const totalAccounts = await BankAccount.countDocuments()
    const totalTransactions = await Transaction.countDocuments()

   
     const accounts = await BankAccount.find()
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0)

    const recentUsers = await userModel.find().sort({ createdAt: -1 })
      .limit(5)
    //.select('-password').sort({ createdAt: -1 }).limit(5)
    const recentTransactions = await Transaction.find().sort({ createdAt: -1 }).limit(10).populate({ path: 'accountId', select: 'accountNumber bankName' })
    const transfers = await Transaction
      .find({ type: 'Transfer' })
      .populate('accountId', 'accountNumber')
      .sort({ createdAt: -1 })
      .limit(5)

    const withdrawals = await Transaction
      .find({ type: 'Withdrawal' })
      .populate('accountId', 'accountNumber')
      .sort({ createdAt: -1 })
      .limit(5)


    return res.status(200).json({
      message: 'Admin dashboard',
      data: { totalUsers, totalAccounts, totalTransactions, totalBalance, recentUsers, recentTransactions, transfers,
      withdrawals }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Could not load admin dashboard', error: error.message })
  }
}

const userDashboard = async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const accounts = await BankAccount.findOne({ userId }).select('accountNumber bankName accountType balance currency createdAt')
    const accountIds = accounts.map(a => a._id)
    const recentTransactions = await Transaction.findOne({ accountId: { $in: accountIds } }).sort({ createdAt: -1 }).limit(20).populate({ path: 'accountId', select: 'accountNumber' })
   
    return res.status(200).json({ message: 'User dashboard', data: { accounts, recentTransactions } })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Could not load user dashboard', error: error.message })
  }
}

module.exports = { adminDashboard, userDashboard }
