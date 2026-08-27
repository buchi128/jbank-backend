const express = require('express');
const router = express.Router();
const { BankAccount } = require('../models/Users.model');
const { userAccounts, userAccountsId } = require('../controllers/transaction.controller');

//GET all accounts (with user info populated)
router.get('/accounts', userAccounts);

//GET account by ID
router.get('/:id', userAccountsId);

module.exports = router;
