
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },	
  electricityBill: {
    type: Number,
    required: [true, 'Electricity bill amount is required'],
    min: 0
  },
  serviceProvider: {
    type: String,
    required: [true, 'Service provider is required'],
    trim: true
  },
  billingCycle: {
    type: String,
    enum: ['one-month', 'two-month'],
    required: [true, 'Billing cycle is required']
  },
  calculatedPower: {
    type: Number,
    required: [true, 'Calculated power is required'],
    min: 0
  },
  selectedPanelType: {
    type: {
      id: { type: Number, required: [true, 'Panel type ID is required'] },
      name: { type: String, required: [true, 'Panel type name is required'], trim: true },
      wattPeak: { type: Number, required: [true, 'Watt peak is required'], min: 0 },
      plates: { type: Number, required: [true, 'Number of plates is required'], min: 0 },
      requiredPower: { type: Number, required: [true, 'Required power is required'], min: 0 },
      price: { type: Number, required: [true, 'Price is required'], min: 0 }
    },
    required: [true, 'Panel type is required']
  },
  selectedCompany: {
    type: {
      id: { type: Number, required: [true, 'Company ID is required'] },
      name: { type: String, required: [true, 'Company name is required'], trim: true },
      tentativeAmount: { type: Number, required: [true, 'Tentative amount is required'], min: 0 },
      subsidyAmount: { type: Number, required: [true, 'Subsidy amount is required'], min: 0 },
      effectiveAmount: { type: Number, required: [true, 'Effective amount is required'], min: 0 },
      roi: { type: String, required: [true, 'ROI is required'], trim: true },
      breakEven: { type: String, required: [true, 'Break even period is required'], trim: true },
      rating: { type: Number, required: [true, 'Rating is required'], min: 0, max: 5 }
    },
    required: [true, 'Company selection is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-]{10,15}$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);


// const mongoose = require('mongoose');

// const stepSchema = new mongoose.Schema({
// 	key: { type: String, required: true },
// 	title: { type: String, required: true },
// 	description: { type: String, default: '' },
// 	status: { type: String, enum: ['pending', 'in_progress', 'done'], default: 'pending' },
// 	completedAt: { type: Date }
// }, { _id: false });

// const bookingSchema = new mongoose.Schema({
// 	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// 	name: { type: String, required: true, trim: true },
// 	email: { type: String, required: true, trim: true, lowercase: true },
// 	phone: { type: String, required: true, trim: true },
// 	address: { type: String, required: true, trim: true },
// 	roofType: { type: String, enum: ['Tile', 'Metal', 'Shingle', 'Flat', 'Other'], default: 'Other' },
// 	preferredDate: { type: Date, required: true },
// 	message: { type: String, trim: true },
// 	status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
// 	steps: { type: [stepSchema], default: [] }
// }, { timestamps: true });

// module.exports = mongoose.model('Booking', bookingSchema); 