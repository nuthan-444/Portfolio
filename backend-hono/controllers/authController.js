import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { getDB } from '../config/db.js';

const generateToken = async (id, email, jwtSecret) => {
  return sign(
    { id: String(id), email, isAdmin: true },
    jwtSecret || 'fallback_secret_key'
  );
};

export const loginAdmin = async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  const { email, password } = body;

  if (!email || !password) {
    return c.json({ message: 'Please provide both email and password' }, 400);
  }

  const jwtSecret = c.env?.JWT_SECRET || 'fallback_secret_key';

  try {
    const db = await getDB(c);
    if (!db) {
      return c.json({ message: 'Database connection unavailable' }, 503);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.collection('users').findOne({ email: cleanEmail });

    if (!user) {
      console.warn(`[Auth Login] User not found: "${cleanEmail}"`);
      return c.json({ message: 'Invalid email or password' }, 401);
    }

    // Support bcrypt hashed and plain-text passwords
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch {
      isMatch = false;
    }
    if (!isMatch && user.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return c.json({ message: 'Invalid email or password' }, 401);
    }

    if (!user.isAdmin) {
      return c.json({ message: 'Access denied: Admin privileges required' }, 403);
    }

    const token = await generateToken(user._id, user.email, jwtSecret);
    return c.json({
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
    return c.json({ message: 'Server error during authentication' }, 500);
  }
};

export const getMe = (c) => {
  return c.json({ user: c.get('user') });
};

export const logoutAdmin = (c) => {
  return c.json({ message: 'Logged out successfully' });
};
