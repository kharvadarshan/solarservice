const User = require('../../Models/User');
const Booking = require('../../Models/Booking');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select('_id name email role createdAt').sort({ createdAt: -1 });
		return res.json({ success: true, users });
	} catch (error) {
		console.error('Get all users error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
	try {
		const bookings = await Booking.find()
			.populate('userId', 'name email')
			.sort({ createdAt: -1 });
		return res.json({ success: true, bookings });
	} catch (error) {
		console.error('Get all bookings error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

// Update booking status (admin only)
exports.updateBookingStatus = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const { status, steps } = req.body;
		
		const updateData = {};
		if (status) updateData.status = status;
		if (steps) updateData.steps = steps;
		
		const booking = await Booking.findByIdAndUpdate(
			bookingId,
			updateData,
			{ new: true }
		).populate('userId', 'name email');
		
		if (!booking) {
			return res.status(404).json({ error: 'Booking not found' });
		}
		
		return res.json({ success: true, booking });
	} catch (error) {
		console.error('Update booking status error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

// Get dashboard stats (admin only)
exports.getDashboardStats = async (req, res) => {
	try {
		const totalUsers = await User.countDocuments();
		const totalBookings = await Booking.countDocuments();
		const pendingBookings = await Booking.countDocuments({ status: 'pending' });
		const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
		const completedBookings = await Booking.countDocuments({ status: 'completed' });
		
		// Recent bookings (last 7 days)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const recentBookings = await Booking.countDocuments({
			createdAt: { $gte: sevenDaysAgo }
		});
		
		return res.json({
			success: true,
			stats: {
				totalUsers,
				totalBookings,
				pendingBookings,
				confirmedBookings,
				completedBookings,
				recentBookings
			}
		});
	} catch (error) {
		console.error('Get dashboard stats error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
