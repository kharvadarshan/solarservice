const express = require("express");
const router = express.Router();
const {PaymentProcess} = require('../../controllers/PaymentController');


router.post("/payment/process",PaymentProcess);


module.exports = router;
