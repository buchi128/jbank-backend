const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userModel, BankAccount } = require('../models/Users.model');


const adminRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, homeAddress } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All primary registration fields are required" });
    }

    const existing = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const adminUser = new userModel({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      phoneNumber: phoneNumber || "0000000000",
      homeAddress: homeAddress || "Admin Office Headquarters",
      role: 'admin' 
    });

    const savedAdmin = await adminUser.save();
    
    const payload = { id: savedAdmin._id, email: savedAdmin.email, role: savedAdmin.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    return res.status(201).json({ message: "Admin registered successfully", token, adminId: savedAdmin._id });
  } catch (error) {
    console.error("ADMIN REGISTRATION ERROR:", error.message);
    return res.status(500).json({ message: "Admin registration failed", error: error.message });
  }
};


const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const admin = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (!admin || admin.role !== 'admin') {
      return res.status(401).json({ message: "Invalid credentials or unauthorized access privilege" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: admin._id, email: admin.email, role: admin.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' });

    return res.status(200).json({ message: "Admin authentication successful", token, role: admin.role });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error.message);
    return res.status(500).json({ message: "Admin login failed", error: error.message });
  }
};


const issueBankAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Missing required field: userId" });


    const generatedAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000);

    const newAccount = new BankAccount({
      userId,
      accountNumber: generatedAccountNumber,
      balance: 0,
      currency: "NGN"
    });

    const savedAccount = await newAccount.save();
    return res.status(201).json({ message: "Bank Account Issued Successfully", account: savedAccount });
  } catch (error) {
    console.error("ACCOUNT ISSUANCE SYSTEM ERROR:", error.message);
    return res.status(500).json({ message: "Could not generate account number", error: error.message });
  }
};

module.exports = { adminRegister, adminLogin, issueBankAccount };
