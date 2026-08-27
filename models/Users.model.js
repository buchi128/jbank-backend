const mongoose = require('mongoose')
const { Schema } = mongoose;

// 1. User Details Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: [true, "This email is in use please try another email" ]},
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    homeAddress: { type: String, required: true },
    role: { type: String, enum: ['user','admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
})
// 2. User Bank Account Details Schema
const bankAccountSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  accountNumber: {
    type: Number,
    unique: true,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: "NGN"
  }
}, { timestamps: true });

// 3. User Account Transactions Schema
    const transactionSchema = new mongoose.Schema({
  accountId: { // sender
    type: Schema.Types.ObjectId,
    ref: "BankAccount",
    required: true
  },
  targetAccountId: { // receiver (optional for deposit)
    type: Schema.Types.ObjectId,
    ref: "BankAccount"
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "transfer"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  reference: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed"
  }
}, { timestamps: true });

// Export Models
const userModel = mongoose.model('User', userSchema);
const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { userModel, BankAccount, Transaction };





