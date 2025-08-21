const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
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
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload;
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}; 