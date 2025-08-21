const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/admin');
const AdminController = require('../../controllers/AdminController');

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminAuth);

// Dashboard stats
router.get('/stats', AdminController.getDashboardStats);

// User management
router.get('/users', AdminController.getAllUsers);

// Booking management
router.get('/bookings', AdminController.getAllBookings);
router.put('/bookings/:bookingId', AdminController.updateBookingStatus);

module.exports = router;
