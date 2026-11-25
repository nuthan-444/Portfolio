import { Hono } from 'hono';
import {
  createWebsiteRequest,
  getWebsiteRequests,
  toggleWebsiteRequestRead,
  deleteWebsiteRequest,
} from '../controllers/websiteRequestController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = new Hono();

// Public: submit a request (file uploads handled inside controller)
router.post('/', createWebsiteRequest);

// Admin only
router.get('/', protectAdmin, getWebsiteRequests);
router.put('/:id/read', protectAdmin, toggleWebsiteRequestRead);
router.delete('/:id', protectAdmin, deleteWebsiteRequest);

export default router;
