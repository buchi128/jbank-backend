const express = require('express');
const router = express.Router();
const { getUserAccount, getUserTransactions, getAllUsers, issueBankAccount } = require('../controllers/account.controller');
const { adminDashboard } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/users', authMiddleware, requireRole('admin'), getAllUsers);
router.get('/accounts', authMiddleware, requireRole('admin'), getUserAccount);
router.get('/transactions', authMiddleware, requireRole('admin'), getUserTransactions);
router.post('/issue-bank-account', authMiddleware, requireRole('admin'), issueBankAccount);
router.get('/dashboard', authMiddleware, requireRole('admin'), adminDashboard);

module.exports = router;
