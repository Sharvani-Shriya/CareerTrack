// routes/stats.js
// Defines the route for the statistics page.

const express = require('express');
const router = express.Router();
const { showStats } = require('../controllers/statsController');

// GET /stats → show statistics and charts
router.get('/', showStats);

module.exports = router;
