const express = require("express");
const User = require("../models/User");
const Account = require("../models/Account");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    console.log(req.body)

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "user",
    });


    const account = await Account.create({
      userId: user._id,
      accountNumber: generateAccountNumber(),
      balance: 0,
    });


    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user,
      account,
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid credentials");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const seedAdmin = async (req, res) => {
  try {
    const { seed, email, password, fullName } = req.body;

    if (seed !== process.env.SEED_SECRET) {
      console.log("ENV SEED:", process.env.SEED_SECRET);
      console.log("USER SEED:", seed);
      return res.status(403).json({ message: "Invalid seed key" });
    }

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin created successfully",
      token,
    });

  } catch (err) {
    console.error("SEED ADMIN ERROR:", err);
    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

module.exports = { register, login, seedAdmin }