const express = require('express');
const router = express.Router();
const { userAccounts, userAccountsId } = require('../controllers/transaction.controller');
const { issueBankAccount } = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { BankAccount } = require('../models/Users.model');


router.post('/create', authMiddleware, issueBankAccount);
router.post('/', authMiddleware, issueBankAccount);

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });


    const account = await BankAccount.findOne({ userId })
      .populate('userId', 'firstName lastName email role');

    if (!account) {
      return res.status(404).json({ message: 'No bank account found for this user profile' });
    }

    return res.json({ message: 'Account fetched successfully', data: account });
  } catch (err) {
    console.error("DASHBOARD ACC_ME LOOKUP ERROR:", err.message);
    return res.status(500).json({ message: 'Error fetching account', error: err.message });
  }
});


router.get('/', authMiddleware, userAccounts);
router.get('/:id', authMiddleware, userAccountsId); 


module.exports = router;

