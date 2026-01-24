const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure nodemailer transporter (use env vars for real credentials)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.ethereal.email',
  port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Helper to generate JWT token
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Helper to send OTP email
const sendOTPEmail = async (email, otp, purpose) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to: email,
    subject: `${purpose} OTP Verification`,
    text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

// Register new user and send verification OTP
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Let Mongoose pre-save hook hash the password
    const user = await User.create({ username, email, password });
    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();
    await sendOTPEmail(email, otp, 'Email Verification');
    res.status(201).json({ message: 'User registered, OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Verify email OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.verificationOTP !== otp || Date.now() > user.verificationOTPExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: 'Email verified', user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: 'Logged in', user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot password - send reset OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOTPEmail(email, otp, 'Password Reset');
    res.json({ message: 'Reset OTP sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset password using OTP
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.resetOTP !== otp || Date.now() > user.resetOTPExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Assign plain password; Mongoose pre-save hook will hash it
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout - clear cookie
exports.logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
};