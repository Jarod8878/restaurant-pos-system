const express = require('express');
const router = express.Router();
const orderAdminController = require('../controller/orderAdminController');

router.get('/all', orderAdminController.getAllOrders);
router.post('/delete',orderAdminController.deleteOrders);
router.put('/status', orderAdminController.updateOrderStatus);

module.exports = router;


