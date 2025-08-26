const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	passwordHash: {
		type: String,
		required: true
	},
	  userType: {
    type: String,
    enum: ['user', 'mentor', 'admin'],
    default: 'user'
  },isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;


