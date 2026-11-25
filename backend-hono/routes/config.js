import { Hono } from 'hono';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = new Hono();

// Public: anyone can read the site config
router.get('/', getConfig);

// Admin only: update social URLs
router.put('/', protectAdmin, updateConfig);

export default router;
