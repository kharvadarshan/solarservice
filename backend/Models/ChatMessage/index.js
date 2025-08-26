const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'mentor', 'system'],
    required: true
  },
  recipientId: {
    type: String, // Can be userId or 'mentor' for general mentor chat
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'file'],
    default: 'text'
  }
});

// Index for efficient querying
chatMessageSchema.index({ sender: 1, recipientId: 1, timestamp: 1 });
chatMessageSchema.index({ recipientId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);