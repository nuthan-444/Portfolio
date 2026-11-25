import { Hono } from 'hono';
import {
  getSkills,
  createDomain,
  updateDomain,
  deleteDomain,
} from '../controllers/skillsController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = new Hono();

// Public: anyone can read skills
router.get('/', getSkills);

// Admin only
router.post('/', protectAdmin, createDomain);
router.put('/:id', protectAdmin, updateDomain);
router.delete('/:id', protectAdmin, deleteDomain);

export default router;
