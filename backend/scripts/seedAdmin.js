const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../Models/User');
require('dotenv').config();

const seedAdmin = async () => {
	try {
		// Connect to database
		await mongoose.connect(process.env.MONGO_URI);
		console.log('Connected to database');

		// Check if admin already exists
		const existingAdmin = await User.findOne({ email: 'admin@solartech.com' });
		if (existingAdmin) {
			console.log('Admin user already exists');
			process.exit(0);
		}

		// Create admin user
		const passwordHash = await bcrypt.hash('admin123', 10);
		const adminUser = await User.create({
			name: 'Admin User',
			email: 'admin@solartech.com',
			passwordHash,
			role: 'admin'
		});

		console.log('Admin user created successfully:');
		console.log('Email: admin@solartech.com');
		console.log('Password: admin123');
		console.log('Role: admin');

		process.exit(0);
	} catch (error) {
		console.error('Error seeding admin:', error);
		process.exit(1);
	}
};

seedAdmin();
