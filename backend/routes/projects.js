import express from 'express';
import multer from 'multer';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Memory storage for multer file uploads before buffer pass to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post('/', protectAdmin, upload.array('images', 5), createProject);
router.put('/:id', protectAdmin, upload.array('images', 5), updateProject);
router.delete('/:id', protectAdmin, deleteProject);

export default router;
