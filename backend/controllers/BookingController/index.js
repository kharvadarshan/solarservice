const Booking = require('../../Models/Booking');

const DEFAULT_STEPS = [
	{ key: 'site_survey', title: 'Site Survey', description: 'Technician visits to assess site', status: 'pending' },
	{ key: 'design', title: 'System Design', description: 'Engineers design your solar system', status: 'pending' },
	{ key: 'permitting', title: 'Permitting', description: 'We submit paperwork for approval', status: 'pending' },
	{ key: 'installation', title: 'Installation', description: 'Crew installs panels and inverter', status: 'pending' },
	{ key: 'inspection', title: 'Inspection', description: 'Final inspection and commissioning', status: 'pending' },
];

exports.create = async (req, res) => {
	try {
		const { name, email, phone, address, roofType, preferredDate, message } = req.body;
		if (!name || !email || !phone || !address || !preferredDate) {
			return res.status(400).json({ error: 'Missing required fields' });
		}
		const booking = await Booking.create({
			userId: req.user?.id || null,
			name, email, phone, address, roofType, preferredDate, message,
			steps: DEFAULT_STEPS
		});
		return res.status(201).json({ success: true, booking });
	} catch (error) {
		console.error('Create booking error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

exports.list = async (req, res) => {
	try {
		const bookings = await Booking.find().sort({ createdAt: -1 });
		return res.json({ success: true, bookings });
	} catch (error) {
		console.error('List bookings error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

exports.my = async (req, res) => {
	try {
		const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
		return res.json({ success: true, bookings });
	} catch (error) {
		console.error('My bookings error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}; 