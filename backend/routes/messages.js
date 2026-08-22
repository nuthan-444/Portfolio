import express from 'express';
import {
  createMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createMessage);
router.get('/', protectAdmin, getMessages);
router.put('/:id/read', protectAdmin, markMessageAsRead);
router.delete('/:id', protectAdmin, deleteMessage);

export default router;
