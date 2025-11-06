const express = require('express');
const { placeOrder, getOrdersByCustomerId } = require('../controller/orderBackendController');
const router = express.Router();

router.post('/', placeOrder);

router.get('/customer/orders', getOrdersByCustomerId);

module.exports = router;
