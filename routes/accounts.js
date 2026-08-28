const express = require('express');
const router = express.Router();
const { userAccounts, userAccountsId } = require('../controllers/transaction.controller');
const { issueBankAccount } = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');



router.post('/', authMiddleware, issueBankAccount);
router.post('/create', authMiddleware, issueBankAccount);


router.get('/', authMiddleware, userAccounts);       
router.get('/:id', authMiddleware, userAccountsId); 

module.exports = router;
