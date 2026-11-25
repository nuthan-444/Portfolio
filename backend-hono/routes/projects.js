import { Hono } from 'hono';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = new Hono();

router.get('/', getProjects);
router.get('/:id', getProjectById);

// File uploads are handled inside the controller using c.req.parseBody()
router.post('/', protectAdmin, createProject);
router.put('/:id', protectAdmin, updateProject);
router.delete('/:id', protectAdmin, deleteProject);

export default router;
