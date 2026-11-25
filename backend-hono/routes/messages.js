import { Hono } from 'hono';
import {
  createMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = new Hono();

router.post('/', createMessage);
router.get('/', protectAdmin, getMessages);
router.put('/:id/read', protectAdmin, markMessageAsRead);
router.delete('/:id', protectAdmin, deleteMessage);

export default router;
