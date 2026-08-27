const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { userModel } = require('../models/Users.model')

const register = async (req, res) => {
  try {
    const { firstName, lastName, fullName, email, password, phoneNumber, homeAddress } = req.body

    // 1. Resolve Name Keys (Splits fullName if sent, otherwise uses individual keys)
    let finalFirstName = firstName;
    let finalLastName = lastName;

    if (fullName && !firstName && !lastName) {
      const nameParts = fullName.trim().split(" ");
      finalFirstName = nameParts[0] || "User";
      finalLastName = nameParts.slice(1).join(" ") || "Customer";
    }

    // 2. Assign Fallback Values for Missing Student Assignment Fields
    const finalPhone = phoneNumber || "000-000-0000";
    const finalAddress = homeAddress || "Not Provided";

    // Validation Guard: Ensure the essential parameters are present
    if (!finalFirstName || !finalLastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required credential fields' })
    }

    const existing = await userModel.findOne({ email: email.toLowerCase().trim() })
    if (existing) return res.status(409).json({ message: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 10)
    
    // Save to your Mongoose schema cleanly with fallbacks filled
    const user = new userModel({ 
      firstName: finalFirstName.trim(), 
      lastName: finalLastName.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashed, 
      phoneNumber: finalPhone, 
      homeAddress: finalAddress 
    })
    
    const saved = await user.save()

    const payload = { id: saved._id, email: saved.email, role: saved.role || 'user' }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

    const userSafe = saved.toObject()
    delete userSafe.password

    return res.status(201).json({ message: 'User registered successfully', user: userSafe, token })
  } catch (error) {
    console.error('CRITICAL REGISTRATION ERROR:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message })
  }
}


const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' })

    // Database lookup using normalized indexing
    const user = await userModel.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    const payload = { id: user._id, email: user.email, role: user.role || 'user' }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '2h' })

    const userSafe = user.toObject()
    delete userSafe.password

    return res.status(200).json({ message: 'Login successful', user: userSafe, token })
  } catch (error) {
    console.error('CRITICAL LOGIN ERROR:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

const seedAdmin = async (req, res) => {
  try {
    const seedSecret = process.env.SEED_ADMIN_SECRET || 'seed-secret'
    const { seed, email, password, firstName = 'Admin', lastName = 'User' } = req.body
    if (seed !== seedSecret) return res.status(403).json({ message: 'Invalid seed key' })

    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const existing = await userModel.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      if (existing.role === 'admin') return res.status(200).json({ message: 'Admin already exists', data: { email: existing.email } })
      existing.role = 'admin'
      await existing.save()
      const payload = { id: existing._id, email: existing.email, role: existing.role }
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
      const userSafe = existing.toObject(); delete userSafe.password
      return res.status(200).json({ message: 'Upgraded user to admin', user: userSafe, token })
    }

    const hashed = await bcrypt.hash(password, 10)
    const admin = new userModel({ firstName, lastName, email: email.toLowerCase().trim(), password: hashed, phoneNumber: '000', homeAddress: 'n/a', role: 'admin' })
    const saved = await admin.save()
    const payload = { id: saved._id, email: saved.email, role: saved.role }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
    const userSafe = saved.toObject(); delete userSafe.password
    return res.status(201).json({ message: 'Admin created', user: userSafe, token })
  } catch (error) {
    console.error('CRITICAL SEED ERROR:', error);
    return res.status(500).json({ message: 'Seed admin failed', error: error.message })
  }
}

module.exports = { register, login, seedAdmin }
