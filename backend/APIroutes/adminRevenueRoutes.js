const express = require('express');
const router = express.Router();
const revenueController = require('../controller/adminRevenueController');

router.get('/', revenueController.getRevenue);

module.exports = router;
