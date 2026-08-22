import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: anyone can read the site config (for hero/footer social links)
router.get('/', getConfig);

// Admin only: update social URLs
router.put('/', protectAdmin, updateConfig);

export default router;
