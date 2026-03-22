const express = require("express")
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");


const getMyAccounts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    const accounts = await Account.find({ user: userId });

    const transactions = await Transaction.find({
      accountId: { $in: accounts.map(acc => acc._id) }
    })
      .populate("accountId")
      .populate("targetAccountId")
      .sort({ createdAt: -1 });

    res.json({
      accounts,
      transactions
    });

  } catch (err) {
  console.error("FULL ERROR:", err); 
  res.status(500).json({ message: err.message });

  }
};

module.exports = {getMyAccounts}

