import { verify } from 'hono/jwt';
import { getDB, toObjectId } from '../config/db.js';

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
