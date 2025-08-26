const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI  = process.env.MONGO_URI;

if (!MONGO_URI) {
	console.error('Missing MONGO_URI in environment variables');
}

let isConnected = false;

async function connectDB() {
	if (isConnected) return mongoose.connection;
	try {
		mongoose.set('strictQuery', true);
		await mongoose.connect(MONGO_URI, {
			// keep options minimal for mongoose v8+
		});
		isConnected = true;
		console.log('MongoDB connected');
		return mongoose.connection;
	} catch (err) {
		console.error('MongoDB connection error:', err.message);
		throw err;
	}
}

module.exports = {
	connectDB,
	mongoose
}; 