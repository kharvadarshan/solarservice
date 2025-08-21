const express= require('express');
const router = express.Router();
const AuthController = require('../../controllers/AuthController');
const auth = require('../../middleware/auth');

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/me', auth, AuthController.me);
router.post('/logout', AuthController.logout);

module.exports = router;