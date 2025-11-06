const express = require('express');
const discountBackendController = require('../controller/discountBackendController');

const router = express.Router();

router.get('/', discountBackendController.getDiscount);
router.post('/redeem', (req, res, next) => {
    console.log("/api/discounts/redeem route hit");
    discountBackendController.redeemDiscount(req, res, next);
  });
  
router.post('/apply', discountBackendController.applyDiscount);

module.exports = router;
