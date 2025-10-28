// routes/uploads.js
const express = require('express')
const path = require('path')
const fs = require('fs')
const router = express.Router()

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename
  
  // Security check: ensure filename doesn't contain path segments
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ success: false, message: 'Invalid filename' })
  }
  
  const uploadsDir = path.join(__dirname, '../uploads')
  const filePath = path.join(uploadsDir, filename)
  
  console.log('Looking for file:', filePath); // Debug log
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath); // Debug log
    return res.status(404).json({ success: false, message: 'File not found' })
  }
  
  // Set appropriate headers
  const ext = path.extname(filename).toLowerCase()
const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.pdf': 'application/pdf'
}
  
  const mimeType = mimeTypes[ext] || 'application/octet-stream'
  res.setHeader('Content-Type', mimeType)
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath)
  fileStream.on('error', (error) => {
    console.error('File stream error:', error)
    res.status(500).json({ success: false, message: 'Error reading file' })
  })
  fileStream.pipe(res)
})

module.exports = router



// // routes/uploads.js
// const express = require('express')
// const path = require('path')
// const fs = require('fs')
// const router = express.Router()

// // Serve uploaded files
// router.get('/uploads/:filename', (req, res) => {
//   const filename = req.params.filename
//   const uploadsDir = path.join(__dirname, '../uploads')
//   const filePath = path.join(uploadsDir, filename)
  
//   // Check if file exists
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ success: false, message: 'File not found' })
//   }
  
//   // Set appropriate headers
//   const ext = path.extname(filename).toLowerCase()
//   const mimeTypes = {
//     '.jpg': 'image/jpeg',
//     '.jpeg': 'image/jpeg',
//     '.png': 'image/png',
//     '.gif': 'image/gif',
//     '.mp4': 'video/mp4',
//     '.mov': 'video/quicktime',
//     '.avi': 'video/x-msvideo'
//   }
  
//   const mimeType = mimeTypes[ext] || 'application/octet-stream'
//   res.setHeader('Content-Type', mimeType)
  
//   // For downloads, set content-disposition
//   if (req.query.download) {
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
//   }
  
//   // Stream the file
//   const fileStream = fs.createReadStream(filePath)
//   fileStream.pipe(res)
// })

// module.exports = router