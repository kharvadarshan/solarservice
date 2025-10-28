const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../Models/User');

function signToken(user) {
	return jwt.sign({ userId: user._id, email: user.email, name: user.name, userType:user.userType }, process.env.JWT_SECRET, {
		expiresIn: '7d'
	});
}

function setAuthCookie(res, token) {
	const isProd = process.env.NODE_ENV === 'production';
	res.cookie('token', token, {
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? 'none' : 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000
	});
}

exports.signup = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		console.log(name);
		if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ error: 'Email already registered' });
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);
		const user = await User.create({ name, email, passwordHash:passwordHash });
		const token = signToken(user);
		setAuthCookie(res, token);
		return res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, userType: user.userType } });
	} catch (error) {
		console.error('Signup error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

exports.login = async (req, res) => {
	try {

		console.log(req.body);
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
		const user = await User.findOne({ email });
		console.log(user);
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

		user.lastSeen = new Date();
		await user.save();
		const token = signToken(user);
		setAuthCookie(res, token);
		return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, userType: user.userType } });
	} catch (error) {
		console.error('Login error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

exports.me = async (req, res) => {
	try {
		console.log(req.user);
		const user = await User.findById(req.user.userId).select('_id name email role');
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
	} catch (error) {
		console.error('Me error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};


exports.logout = async (req, res) => {
	res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
	return res.json({ success: true,ok:true });
};

exports.profile =async (req, res) => {
  try {
   

    res.json({user:req.user});
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all users for mentor dashboard
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is mentor or admin
    if (req.user.userType !== 'mentor' && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only mentors and admins can view all users.' });
    }

    const users = await User.find({ userType: 'user' })
      .select('_id name email lastSeen createdAt')
      .sort({ lastSeen: -1 });

    // Get chat session info for each user
    const ChatSession = require('../../Models/ChatSession');
    const ChatMessage = require('../../Models/ChatMessage');
    
    const usersWithChatInfo = await Promise.all(
      users.map(async (user) => {
        // Get latest chat session
        const latestSession = await ChatSession.findOne({ userId: user._id })
          .sort({ lastActivity: -1 });

        // Get unread message count for this mentor
        const unreadCount = await ChatMessage.countDocuments({
          recipientId: req.user.userId,
          sender: user._id,
          isRead: false
        });

        // Get last message
        const lastMessage = await ChatMessage.findOne({
          $or: [
            { sender: user._id, recipientId: req.user.userId },
            { sender: req.user.userId, recipientId: user._id }
          ]
        }).sort({ timestamp: -1 });

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt,
          isOnline: false, // Will be updated by socket events
          unreadCount,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            sender: lastMessage.senderName
          } : null,
          hasActiveSession: !!latestSession
        };
      })
    );

    res.json({
      success: true,
      users: usersWithChatInfo,
      count: usersWithChatInfo.length
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};