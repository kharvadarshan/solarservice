const express = require('express');
const router = express.Router();
const BookingController = require('../../controllers/BookingController');
const {authenticateToken} = require('../../middleware/auth');

router.post('/', authenticateToken, BookingController.create);
router.get('/', BookingController.list);
router.get('/my', authenticateToken, BookingController.my);

module.exports = router; 