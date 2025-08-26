const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const mongoose = require('mongoose');
const authenticateToken  = async function auth(req, res, next) {
	const authHeader = req.headers['authorization'];
	let token = null;
	if (authHeader) {
		const [scheme, t] = authHeader.split(' ');
		if (scheme === 'Bearer') token = t;
	}
	if (!token && req.cookies && req.cookies.token) {
		token = req.cookies.token;
	}
	if (!token) return res.status(401).json({ error: 'No token provided' });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		console.log(decoded);
		 const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = { ...decoded, name: user.name };
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}; 

module.exports = { authenticateToken };
