const express = require('express');
const router = express.Router();
const { getUserAccount, getUserTransactions, getAllUsers } = require('../controllers/account.controller');
const { userDashboard } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Protected account resource routing execution
router.get('/accounts', authMiddleware, getUserAccount);
router.get('/transactions', authMiddleware, getUserTransactions);
router.get('/dashboard', authMiddleware, userDashboard);
router.get('/', authMiddleware, getAllUsers);

module.exports = router;
