const express = require('express');
const router = express.Router();
const BookingController = require('../../controllers/BookingController');
const auth = require('../../middleware/auth');

router.post('/', auth, BookingController.create);
router.get('/', BookingController.list);
router.get('/my', auth, BookingController.my);

module.exports = router; 