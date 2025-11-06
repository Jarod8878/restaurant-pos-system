const express = require('express');
const customerController = require('../controller/customerController');
const customerRegister = require('../controller/customerRegister');

const router = express.Router();

router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Customer routes are working' });
});

// Customer login route
router.post('/login', customerController.login);

router.post('/forgot-password', customerController.forgotPassword);

// Customer registration route
router.post('/register', customerRegister.register);

// Fetch customer profile
router.get('/profile',customerController.getProfile);

// Update customer profile
router.put('/update',customerController.updateProfile);

//Fetch remaining uses of redeemed discounts
router.get('/discounts',customerController.getCustomerDiscounts);
router.get('/top',customerController.getTopCustomers);

//For Admin CRM
router.get('/crm', customerController.getCRM);

// Admin updates customer
router.put('/admin/update', customerController.updateCustomer);

// Admin deletes customer
router.delete('/delete/:customerId', customerController.deleteCustomer);

// Admin retrieves active customer count
router.get('/active-customer', customerController.activeCustomer);

module.exports = router;
