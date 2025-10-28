// controllers/bookingController.js
// Basic controllers for POST and GET endpoints

const Booking = require('../../Models/Booking');
const path = require('path');
const fs = require('fs');

exports.createBooking = async (req, res) => {
  try {
    const bookingData = { ...req.body };

    console.log('Received booking data:', bookingData);
    console.log('Files received:', req.files);

    // Add userId if user is authenticated
    if (req.user && req.user.id) {
      bookingData.userId = req.user.id;
    }

    // Parse JSON fields that were stringified in frontend
    if (bookingData.selectedPanelType) {
      bookingData.selectedPanelType = JSON.parse(bookingData.selectedPanelType);
    }
    if (bookingData.selectedCompany) {
      bookingData.selectedCompany = JSON.parse(bookingData.selectedCompany);
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.electricityBillImage) {
        const electricityBillFile = req.files.electricityBillImage[0];
        bookingData.electricityBillImage = electricityBillFile.filename;
      }
      if (req.files.siteVideo) {
        const siteVideoFile = req.files.siteVideo[0];
        bookingData.siteVideo = siteVideoFile.filename;
      }
    }
    
    // Validation can be added here if needed (e.g., using Joi or manual checks)
    
    const booking = new Booking(bookingData);
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

const saveFileInfo = (file) => {
  const fileInfo = {
    originalName: file.originalname,
    filename: file.filename,
    url: `http://localhost:5000/api/uploads/${file.filename}`,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype
  }
  return fileInfo
}


exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Updating booking status:', { id, status });

    // Validate status
    const validStatuses = ['pending', 'survey', 'quoted', 'installation', 'confirmed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, survey, quoted, installation, confirmed, rejected'
      });
    }

    // Find and update booking
    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        status: status,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};


// controllers/BookingController.js

// Upload quotation PDF
exports.uploadQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No quotation file uploaded'
      });
    }

    console.log('Uploading quotation for booking:', id, 'File:', req.file.filename);

    // Update booking with quotation info
    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        quotationPdf: req.file.filename,
        quotationUploadedAt: new Date(),
        status: 'quoted', // Automatically update status to quoted
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      // Delete the uploaded file if booking not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Quotation uploaded successfully',
      data: {
        quotationPdf: booking.quotationPdf,
        quotationUploadedAt: booking.quotationUploadedAt,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error uploading quotation:', error);
    
    // Delete the uploaded file if error occurred
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading quotation',
      error: error.message
    });
  }
};


const getUploadsPath = (filename = '') => {
  // Go up two levels from controllers directory to reach backend root
  // then go into uploads directory
  return path.join(__dirname,'..' ,'..', 'uploads', filename);
};

// Download quotation PDF
exports.downloadQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Downloading quotation for booking:', id);
    const booking = await Booking.findById(id);
    console.log('Found booking:', booking);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.quotationPdf) {
      return res.status(404).json({
        success: false,
        message: 'No quotation found for this booking'
      });
    }

     const filePath = getUploadsPath(booking.quotationPdf);

      console.log('Looking for file at path:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Quotation file not found'
      });
    }

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quotation-${booking.name}-${booking._id}.pdf"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading quotation',
      error: error.message
    });
  }
};

// Delete quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.quotationPdf) {
      return res.status(404).json({
        success: false,
        message: 'No quotation found for this booking'
      });
    }

    const filePath = path.join(__dirname, '../uploads', booking.quotationPdf);
    
    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update booking to remove quotation
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { 
        quotationPdf: null,
        quotationUploadedAt: null,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Quotation deleted successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quotation',
      error: error.message
    });
  }
};


exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean(); // lean() for better performance if no updates needed
    
    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving bookings',
      error: error.message
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error retrieving booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving booking',
      error: error.message
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in req.user from auth middleware
    
    const bookings = await Booking.find({ 
      $or: [
        { email: req.user.email }, // Match by email if no userId
        { userId: userId } // Match by userId if available
      ]
    }).sort({ createdAt: -1 }).lean();
    
    res.status(200).json({
      success: true,
      message: 'User bookings retrieved successfully',
      bookings: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error retrieving user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user bookings',
      error: error.message
    });
  }
};

// const Booking = require('../../Models/Booking');

// const DEFAULT_STEPS = [
// 	{ key: 'site_survey', title: 'Site Survey', description: 'Technician visits to assess site', status: 'pending' },
// 	{ key: 'design', title: 'System Design', description: 'Engineers design your solar system', status: 'pending' },
// 	{ key: 'permitting', title: 'Permitting', description: 'We submit paperwork for approval', status: 'pending' },
// 	{ key: 'installation', title: 'Installation', description: 'Crew installs panels and inverter', status: 'pending' },
// 	{ key: 'inspection', title: 'Inspection', description: 'Final inspection and commissioning', status: 'pending' },
// ];

// exports.create = async (req, res) => {
// 	try {
// 		const { name, email, phone, address, roofType, preferredDate, message } = req.body;
// 		if (!name || !email || !phone || !address || !preferredDate) {
// 			return res.status(400).json({ error: 'Missing required fields' });
// 		}
// 		const booking = await Booking.create({
// 			userId: req.user?.id || null,
// 			name, email, phone, address, roofType, preferredDate, message,
// 			steps: DEFAULT_STEPS
// 		});
// 		return res.status(201).json({ success: true, booking });
// 	} catch (error) {
// 		console.error('Create booking error:', error);
// 		return res.status(500).json({ error: 'Internal server error' });
// 	}
// };

// exports.list = async (req, res) => {
// 	try {
// 		const bookings = await Booking.find().sort({ createdAt: -1 });
// 		return res.json({ success: true, bookings });
// 	} catch (error) {
// 		console.error('List bookings error:', error);
// 		return res.status(500).json({ error: 'Internal server error' });
// 	}
// };

// exports.my = async (req, res) => {
// 	try {
// 		const bookings = await Booking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
// 		return res.json({ success: true, bookings:bookings });
// 	} catch (error) {
// 		console.error('My bookings error:', error);
// 		return res.status(500).json({ error: 'Internal server error' });
// 	}
// }; 
