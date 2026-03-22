const express = require("express");
const User = require("../models/User");
const Transaction = require("../models/Transaction");




const deposit = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json("User not found");

    if (user.status === "frozen")
      return res.status(403).json("Account is frozen");

    user.balance += amount;
    await user.save();

    await Transaction.create({
      type: "deposit",
      amount,
      receiverAccount: user.accountNumber,
      status: "success"
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Deposit failed");
  }
};

const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json("User not found");

    if (user.status === "frozen")
      return res.status(403).json("Account is frozen");

    if (user.balance < amount)
      return res.status(400).json("Insufficient funds");

    user.balance -= amount;
    await user.save();

    await Transaction.create({
      type: "withdraw",
      amount,
      senderAccount: user.accountNumber,
      status: "success"
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Withdraw failed");
  }
};
const transfer = async (req, res) => {
  try {
    const { amount, targetAccountNumber } = req.body;

    const sender = await User.findById(req.user.id);
    if (!sender) return res.status(404).json("Sender not found");

    if (sender.status === "frozen")
      return res.status(403).json("Account is frozen");

    const receiver = await User.findOne({ accountNumber: targetAccountNumber });
    if (!receiver) return res.status(404).json("Receiver not found");

    if (sender.balance < amount)
      return res.status(400).json("Insufficient funds");

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    await Transaction.create({
      type: "transfer",
      amount,
      senderAccount: sender.accountNumber,
      receiverAccount: receiver.accountNumber,
      status: "success"
    });

    res.json("Transfer successful");
  } catch (err) {
    console.error(err);
    res.status(500).json("Transfer failed");
  }
};
const history = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json("User not found");

    const transactions = await Transaction.find({
      $or: [
        { senderAccount: user.accountNumber },
        { receiverAccount: user.accountNumber }
      ]
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to load history");
  }
};
module.exports = {deposit,withdraw,transfer,history}