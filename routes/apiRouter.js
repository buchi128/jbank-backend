
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const 
 { createTransaction,
  loggedInUserTransactions,
  getTransactionById,
 // userDetails,
  //userAccounts,
  userAccountsId }
 = require('../controllers/transaction.controller'); // adjust path

router.get('/accounts/user/:id', auth, async (req, res, next) => {
  // reuse loggedInUserTransactions but it expects req.user; if you want to pass userId param, adapt controller
  req.user = { id: req.params.id }; // only for quick testing; prefer proper auth
  return loggedInUserTransactions(req, res, next);
});
router.get('/transactions', auth, requireRole('admin'), async (req, res) => { res.json({ message: 'Not implemented' }); });
//router.get('/transactions/:id', auth, getTransactionById);
router.post('/transactions', auth, createTransaction);
router.get('/admin/dashboard', auth, requireRole('admin'), (req, res) => res.json({ message: 'admin dashboard' }));

module.exports = router;


