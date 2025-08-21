const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
	key: { type: String, required: true },
	title: { type: String, required: true },
	description: { type: String, default: '' },
	status: { type: String, enum: ['pending', 'in_progress', 'done'], default: 'pending' },
	completedAt: { type: Date }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, trim: true, lowercase: true },
	phone: { type: String, required: true, trim: true },
	address: { type: String, required: true, trim: true },
	roofType: { type: String, enum: ['Tile', 'Metal', 'Shingle', 'Flat', 'Other'], default: 'Other' },
	preferredDate: { type: Date, required: true },
	message: { type: String, trim: true },
	status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
	steps: { type: [stepSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema); 