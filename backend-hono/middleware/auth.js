import { verify } from 'hono/jwt';
import User from '../models/User.js';

export const protectAdmin = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Not authorized, no token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret =
      c.env?.JWT_SECRET ||
      'steve_ai_ml_portfolio_super_secret_jwt_key_2026';

    const decoded = await verify(token, jwtSecret);

    // Check if MongoDB is connected or fallback to token payload
    let user = null;
    if (
      User.db &&
      User.db.readyState === 1 &&
      decoded.id &&
      String(decoded.id).length === 24
    ) {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      user = {
        id: decoded.id,
        email: decoded.email,
        name: 'Nuthan Prasad KG',
        isAdmin: true,
      };
    }

    if (!user.isAdmin) {
      return c.json({ message: 'Not authorized as an admin' }, 403);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return c.json(
      { message: 'Not authorized, token invalid or expired' },
      401
    );
  }
};
