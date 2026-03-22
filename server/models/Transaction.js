const mongoose = require("mongoose");



const transactionSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  senderAccount: String,
  receiverAccount: String,
  status: String
}, { timestamps: true });

const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = transactionModel






