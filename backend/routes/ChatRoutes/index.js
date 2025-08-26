const express = require('express');
const ChatMessage = require('../../Models/ChatMessage');
const ChatSession = require('../../Models/ChatSession');
const User = require('../../Models/User');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// Get chat history for a user
router.get('/history/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({
      $or: [
        { sender: userId },
        { recipientId: userId }
      ]
    })
    .populate('sender', 'name userType')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json(messages.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all active chat sessions (for mentors)
router.get('/sessions/active', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'mentor' && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sessions = await ChatSession.find({
      status: { $in: ['active', 'waiting'] }
    })
    .populate('userId', 'name email lastSeen')
    .populate('mentorId', 'name')
    .sort({ lastActivity: -1 });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between mentor and specific user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const mentorId = req.user.userId;

    if (req.user.userType !== 'mentor' && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await ChatMessage.find({
      $or: [
        { sender: userId, recipientId: mentorId },
        { sender: mentorId, recipientId: userId },
        { recipientId: 'mentor', sender: userId }
      ]
    })
    .populate('sender', 'name userType')
    .sort({ timestamp: 1 });

    // Mark messages as read
    await ChatMessage.updateMany(
      { sender: userId, recipientId: mentorId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new chat session
router.post('/session/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if user already has an active session
    const existingSession = await ChatSession.findOne({
      userId,
      status: { $in: ['active', 'waiting'] }
    });

    if (existingSession) {
      return res.json(existingSession);
    }

    // Create new session
    const session = new ChatSession({
      userId,
      status: 'waiting'
    });

    await session.save();
    await session.populate('userId', 'name email');

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Close chat session
router.put('/session/:sessionId/close', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedback } = req.body;

    const session = await ChatSession.findByIdAndUpdate(
      sessionId,
      {
        status: 'closed',
        endTime: new Date(),
        rating,
        feedback
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat statistics (for admin dashboard)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Promise.all([
      ChatSession.countDocuments({ status: 'active' }),
      ChatSession.countDocuments({ status: 'waiting' }),
      ChatSession.countDocuments({
        startTime: { $gte: today }
      }),
      ChatMessage.countDocuments({
        timestamp: { $gte: today }
      }),
      User.countDocuments({ userType: 'user', isActive: true }),
      User.countDocuments({ userType: 'mentor', isActive: true })
    ]);

    res.json({
      activeSessions: stats[0],
      waitingSessions: stats[1],
      todaySessions: stats[2],
      todayMessages: stats[3],
      activeUsers: stats[4],
      activeMentors: stats[5]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

