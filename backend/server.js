const express = require('express');
const cors = require('cors');
const bodyParser  = require('body-parser')
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const bookingRoutes = require('./routes/BookingRoutes');
const authRoutes = require('./routes/AuthRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const cookieParser = require('cookie-parser');
const app = express();

dotenv.config();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to database
connectDB().catch((e) => {
    console.error('Failed to connect to database on startup. Exiting.');
    process.exit(1);
});

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on Port ${PORT}`);
});