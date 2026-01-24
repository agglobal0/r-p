const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes.
 * Looks for JWT in HttpOnly cookie named 'token'.
 * If valid, attaches the user document (without password) to req.user.
 */
const protect = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    // Attach user id as a custom header for downstream handlers that may rely on it
    req.headers['x-user-id'] = user._id.toString();
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes.
 * Looks for JWT in HttpOnly cookie named 'token'.
 * If valid, attaches the user document (without password) to req.user.
 */
const protect = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    // Attach user id as a custom header for downstream handlers that may rely on it
    req.headers['x-user-id'] = user._id.toString();
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
