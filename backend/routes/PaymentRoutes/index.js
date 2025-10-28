const express = require("express");
const router = express.Router();
const {getKey,paymentVerification,processPayment } = require('../../controllers/PaymentController');


router.post("/payment/process",processPayment);
router.get("/payment/getKey",getKey);
router.post("/payment/paymentVerification",paymentVerification);

module.exports = router;
