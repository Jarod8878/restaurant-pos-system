const express = require('express');
const adminController = require('../controller/adminController');
const discountAdminController = require('../controller/discountBackendController');

const router = express.Router();

// Admin login route
router.post('/login', adminController.login);

//Admin discount route
router.get('/discounts', discountAdminController.getAllDiscounts);
router.post('/discounts', discountAdminController.createDiscount);
router.put('/discounts/:id', discountAdminController.updateDiscount);
router.delete('/discounts/:id', discountAdminController.deleteDiscount);

//admin settings
router.get('/getPointsConversionRate', adminController.getPointsConversionRate)
router.put('/updatePointsConversionRate', adminController.updatePointsConversionRate);
router.get('/low-stock', adminController.getLowStockItems);
router.put('/updateLowStockAmount', adminController.updateLowStockAmount);
router.get('/low_stock_amount', adminController.getLowStockAmount);

//daily sales
router.get('/daily-sales', adminController.getDailySales);

//create, update, delete admin
router.get('/all', adminController.getAllAdmins);
router.post('/register', adminController.registerAdmin);
router.put('/update/:id', adminController.updateAdmin);
router.delete('/delete/:id', adminController.deleteAdmin);

//dashboard and sales reports

router.get('/sales-summary', adminController.getSalesSummary);
router.get('/top-items', adminController.getTopSellingItems);
router.get('/category-sales', adminController.getCategorySales);
router.get('/hourly-orders', adminController.getHourlyOrders);
router.get('/sales-trend', adminController.getSalesTrend);
router.get('/items-sales-history/:item_id', adminController.getItemSalesHistory);
module.exports = router;
