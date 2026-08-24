import express from 'express';
import { getSkills, createDomain, updateDomain, deleteDomain } from '../controllers/skillsController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: anyone can read skills
router.get('/', getSkills);

// Admin only: create, update, delete domains
router.post('/', protectAdmin, createDomain);
router.put('/:id', protectAdmin, updateDomain);
router.delete('/:id', protectAdmin, deleteDomain);

export default router;
