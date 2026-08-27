const express = require('express');
const router = express.Router();
const { adminDashboard, userDashboard } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Admin dashboard route
router.get('/dashboard', authMiddleware, requireRole('admin'), adminDashboard);

// User dashboard route
router.get('/user/dashboard', authMiddleware, userDashboard);

module.exports = router;
