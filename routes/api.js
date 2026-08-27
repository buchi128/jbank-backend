const express = require('express')
const router = express.Router()

const {
  getUserAccount,
  getUserTransactions,
  getAllUsers,
  issueBankAccount
} = require('../controllers/admin.controller')

router.get('/users', getAllUsers)
router.get('/accounts', getUserAccount)
router.get('/transactions', getUserTransactions)
router.post('/accounts', issueBankAccount)

module.exports = router