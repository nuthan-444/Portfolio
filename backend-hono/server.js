import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import messageRoutes from './routes/messages.js';
import configRoutes from './routes/config.js';
import skillsRoutes from './routes/skills.js';
import websiteRequestRoutes from './routes/websiteRequests.js';

const app = new Hono();

// ── CORS ────────────────────────────────────────────────────────────────────
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ── In-memory Rate Limiter (CF Workers-safe) ────────────────────────────────
// Plain Map at global scope is fine — no async, no crypto, no random values.
// Note: state is per-isolate. For portfolio traffic this is plenty sufficient.
const _rlStore = new Map();

const createRateLimiter = ({ windowMs, limit, message }) => async (c, next) => {
  const key =
    (c.req.header('cf-connecting-ip') ??
     c.req.header('x-forwarded-for') ??
     'global') + c.req.path;

  const now = Date.now();
  const windowStart = now - windowMs;

  // Keep only timestamps within the current window
  const hits = (_rlStore.get(key) ?? []).filter((ts) => ts > windowStart);

  if (hits.length >= limit) {
    const retryAfter = Math.ceil((hits[0] + windowMs - now) / 1000);
    c.header('Retry-After', String(retryAfter));
    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', '0');
    return c.json(message ?? { message: 'Too many requests' }, 429);
  }

  hits.push(now);
  _rlStore.set(key, hits);
  c.header('X-RateLimit-Limit', String(limit));
  c.header('X-RateLimit-Remaining', String(limit - hits.length));

  await next();
};

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
});

const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: 'Too many messages sent. Please wait a bit before trying again.' },
});

// ── Connect DB once per Worker isolate startup ──────────────────────────────
// This runs lazily on first request; subsequent requests reuse the connection.
let dbConnected = false;
app.use('*', async (c, next) => {
  if (!dbConnected) {
    const uri = c.env?.MONGODB_URI;
    dbConnected = await connectDB(uri);
  }
  await next();
});

// ── Apply route-level rate limiters ────────────────────────────────────────
app.use('/api/auth/login', authLimiter);
app.use('/api/messages', async (c, next) => {
  if (c.req.method === 'POST') {
    return contactLimiter(c, next);
  }
  await next();
});

// ── Mount Routes ────────────────────────────────────────────────────────────
app.route('/api/auth', authRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/messages', messageRoutes);
app.route('/api/config', configRoutes);
app.route('/api/skills', skillsRoutes);
app.route('/api/website-requests', websiteRequestRoutes);

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (c) => {
  return c.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    owner: 'Nuthan Prasad KG',
    runtime: 'Cloudflare Workers',
  });
});

// ── 404 ─────────────────────────────────────────────────────────────────────
app.notFound((c) => {
  return c.json({ message: 'API Endpoint Not Found' }, 404);
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('[Server Error]', err.message);
  return c.json(
    { message: err.message || 'Internal Server Error' },
    err.status || 500
  );
});

export default app;
