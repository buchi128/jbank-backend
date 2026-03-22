const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  const transactions = await Transaction.find({
    $or: [
      { senderAccount: user.accountNumber },
      { receiverAccount: user.accountNumber }
    ]
  });

  res.json({ user, transactions });
};

const freezeAccount = async (req, res) => {
  const user = await User.findById(req.params.id);

  user.status = "frozen";
  await user.save();

  res.json("Account frozen");
};

const unfreezeAccount = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json("User not found");
  }

  user.status = "active";
  await user.save();

  res.json("Account unfrozen");
};

const getAllTransactions = async (req, res) => {
  const transactions = await Transaction.find().sort({ createdAt: -1 });
  res.json(transactions);
};

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const users = await User.find();
    const totalBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const transfers = await Transaction.find({ type: "transfer" })
      .sort({ createdAt: -1 })
      .limit(5);

    const withdrawals = await Transaction.find({ type: "withdraw" })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalAccounts: totalUsers,
      totalTransactions,
      totalBalance,
      recentUsers,
      recentTransactions,
      transfers,
      withdrawals
    });

  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to load dashboard");
  }
};
//API TEST EXAMPLES
//GET /api/admin/users
//Authorization: Bearer TOKEN
//PUT /api/admin/freeze/:id
//GET /api/admin/transactions
module.exports = { getAllUsers, getSingleUser, freezeAccount, unfreezeAccount, getAllTransactions, getDashboard }