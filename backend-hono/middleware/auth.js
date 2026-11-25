import { verify } from 'hono/jwt';
import { getDB, toObjectId } from '../config/db.js';

const DEFAULT_JWT_SECRET = 'steve_ai_ml_portfolio_super_secret_jwt_key_2026';

export const protectAdmin = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const match = authHeader && authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return c.json({ message: 'Not authorized, no token provided' }, 401);
  }

  const token = match[1].trim();

  try {
    const jwtSecret = c.env?.JWT_SECRET || DEFAULT_JWT_SECRET;

    // Hono v4.11+ requires explicit algorithm parameter in verify()
    const decoded = await verify(token, jwtSecret, 'HS256');

    let user = null;
    const db = await getDB(c);
    const oid = toObjectId(decoded.id ? String(decoded.id) : '');
    if (db && oid) {
      user = await db
        .collection('users')
        .findOne({ _id: oid }, { projection: { password: 0 } });
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
