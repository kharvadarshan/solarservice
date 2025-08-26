const express= require('express');
const router = express.Router();
const {login,logout,signup,me,profile} = require('../../controllers/AuthController');
const {authenticateToken} = require('../../middleware/auth');
const User = require('../../Models/User');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken,me);
router.post('/logout',logout);
router.get('/profile', authenticateToken,profile);
module.exports = router;