
const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/BookingController');
const { authenticateToken } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and videos
    if (file.fieldname === 'electricityBillImage') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for electricity bill'), false);
      }
    } else if (file.fieldname === 'siteVideo') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for site video'), false);
      }
    } else {
      cb(new Error('Unexpected field'), false);
    }
  }
});

router.post('/', authenticateToken, upload.fields([
  { name: 'electricityBillImage', maxCount: 1 },
  { name: 'siteVideo', maxCount: 1 }
]), bookingController.createBooking);

router.get('/', authenticateToken,bookingController.getAllBookings);

router.get('/my', authenticateToken, bookingController.getMyBookings);

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