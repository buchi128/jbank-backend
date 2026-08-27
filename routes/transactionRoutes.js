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


router.post("/transactions", authMiddleware, createTransaction);
router.post('/', authMiddleware, createTransaction);
router.get('/', authMiddleware, loggedInUserTransactions);
router.post('/deposit', authMiddleware, createTransaction);
router.get('/withdraw', authMiddleware, loggedInUserTransactions);
router.get('/transfer/:id', authMiddleware, getTransactionById);
router.get('/users', authMiddleware, userDetails);
router.get('/accounts', authMiddleware, userAccounts);
router.get('/admin/dashboard',adminDashboard)
router.get("/accounts/user/:userId", authMiddleware, loggedInUserTransactions);

module.exports = router;

