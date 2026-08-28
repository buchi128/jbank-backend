const express = require('express');
const router = express.Router();
const {
  createTransaction,
  loggedInUserTransactions,
  getTransactionById,
  userDetails,
  userAccounts,
} = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { adminDashboard } = require('../controllers/dashboard.controller');

router.post('/deposit', authMiddleware, createTransaction);
router.post('/withdraw', authMiddleware, createTransaction);
router.post('/transfer', authMiddleware, createTransaction);

router.get('/history', authMiddleware, loggedInUserTransactions);
router.get('/details/:id', authMiddleware, getTransactionById);


router.get('/', authMiddleware, loggedInUserTransactions);
router.post('/', authMiddleware, createTransaction);


router.get('/users', authMiddleware, userDetails);
router.get('/accounts', authMiddleware, userAccounts);
router.get('/admin/dashboard', adminDashboard);
router.get("/accounts/user/:userId", authMiddleware, loggedInUserTransactions);

module.exports = router;
