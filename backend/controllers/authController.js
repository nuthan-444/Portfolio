import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, email) => {
  return jwt.sign(
    { id, email, isAdmin: true },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '24h' }
  );
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.warn(`[Auth Login] User not found for email: "${cleanEmail}"`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Support both bcrypt hashed passwords and direct plain text passwords from MongoDB shell
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      isMatch = false;
    }

    if (!isMatch && user.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      console.warn(`[Auth Login] Password mismatch for user: "${cleanEmail}"`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    const token = generateToken(user._id, user.email);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

export const getMe = async (req, res) => {
  res.json({
    user: req.user,
  });
};

export const logoutAdmin = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
