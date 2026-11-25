/**
 * LOCAL DEVELOPMENT ENTRY POINT
 * Uses @hono/node-server so the app runs as a plain Node.js HTTP server.
 * This avoids all Cloudflare Workers global-scope restrictions (Mongoose, BSON, etc.)
 *
 * Usage:  pnpm dev:local
 *
 * The secret: app.fetch(req, process.env) passes process.env as the second
 * argument, which Hono exposes as `c.env` inside every handler — so all
 * c.env.MONGODB_URI / c.env.JWT_SECRET references work without any changes.
 */

import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './server.js';

const PORT = Number(process.env.PORT) || 5000;

serve(
  {
    fetch: (req) => app.fetch(req, process.env),
    port: PORT,
  },
  () => {
    console.log('=================================================');
    console.log(`🚀 Portfolio Backend (Hono/Node) on port ${PORT}`);
    console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
    console.log('=================================================');
  }
);
