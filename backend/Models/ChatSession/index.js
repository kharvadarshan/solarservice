
const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'waiting', 'closed', 'paused'],
    default: 'waiting'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    type: String,
    maxlength: 1000
  },
  lastMessageTime: {
    type: Date
  },
  messageCount: {
    type: Number,
    default: 0
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500
  },
  isUserOnline: {
    type: Boolean,
    default: false
  },
  isMentorOnline: {
    type: Boolean,
    default: false
  }
});

// Index for efficient querying
chatSessionSchema.index({ userId: 1, status: 1 });
chatSessionSchema.index({ mentorId: 1, status: 1 });
chatSessionSchema.index({ status: 1, lastActivity: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);