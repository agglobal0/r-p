const express = require('express');
const router = express.Router();
const { register, verifyOTP, login, forgotPassword, resetPassword, logout } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

// Register new user (sends verification OTP)
router.post('/register', register);

// Verify email OTP
router.post('/verify-otp', verifyOTP);

// Login
router.post('/login', login);

// Forgot password - send reset OTP
router.post('/forgot-password', forgotPassword);

// Reset password using OTP
router.post('/reset-password', resetPassword);

// Logout
router.post('/logout', logout);

// Get current logged in user
router.get('/me', protect, (req, res) => {
	res.json({ user: req.user });
});

module.exports = router;
