// routes/dashboard.js
// Defines the route for the main dashboard page.

const express = require('express');
const router = express.Router();
const { showDashboard } = require('../controllers/dashboardController');

// GET / → show the dashboard
router.get('/', showDashboard);

module.exports = router;
