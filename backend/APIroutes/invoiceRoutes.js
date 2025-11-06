const express = require('express');
const { getInvoice } = require('../controller/invoiceController');

const router = express.Router();

// 📌 Route to fetch invoice details
router.get('/:orderId', getInvoice);

module.exports = router;
