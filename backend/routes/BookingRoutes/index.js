
const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/BookingController');
const { authenticateToken } = require('../../middleware/auth');

router.post('/',authenticateToken, bookingController.createBooking);

router.get('/', authenticateToken,bookingController.getAllBookings);

router.get('/:id', authenticateToken, bookingController.getBookingById);



module.exports = router;




// const express = require('express');
// const router = express.Router();
// const BookingController = require('../../controllers/BookingController');
// const {authenticateToken} = require('../../middleware/auth');

// router.post('/', authenticateToken, BookingController.create);
// router.get('/', BookingController.list);
// router.get('/my', authenticateToken, BookingController.my);

// module.exports = router; 