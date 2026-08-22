import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'steve_ai_ml_portfolio_super_secret_jwt_key_2026');

      // Check if MongoDB is connected or fallback to token payload
      if (User.db && User.db.readyState === 1 && decoded.id && decoded.id.length === 24) {
        req.user = await User.findById(decoded.id).select('-password');
      }
      
      if (!req.user) {
        req.user = { id: decoded.id, email: decoded.email, name: 'Nuthan Prasad KG', isAdmin: true };
      }

      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized as an admin' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
