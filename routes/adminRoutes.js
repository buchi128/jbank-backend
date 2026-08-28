const express = require('express');
const router = express.Router();

const { issueBankAccount } = require('../controllers/admin.controller'); 
const { userDetails, userAccounts, loggedInUserTransactions } = require('../controllers/transaction.controller');
const { adminDashboard } = require('../controllers/dashboard.controller');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');


router.get('/users', authMiddleware, requireRole('admin'), userDetails);
router.get('/accounts', authMiddleware, requireRole('admin'), userAccounts);
router.get('/transactions', authMiddleware, requireRole('admin'), loggedInUserTransactions);
router.get('/dashboard', authMiddleware, requireRole('admin'), adminDashboard);


router.post('/issue-bank-account', authMiddleware, requireRole('admin'), issueBankAccount);
router.post('/accounts', authMiddleware, requireRole('admin'), issueBankAccount); 

module.exports = router;
