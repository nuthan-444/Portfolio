import express from 'express';
import multer from 'multer';
import {
  createWebsiteRequest,
  getWebsiteRequests,
  toggleWebsiteRequestRead,
  deleteWebsiteRequest,
} from '../controllers/websiteRequestController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Multer — memory storage, only images + PDFs, max 10 MB each, max 5 files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'image/svg+xml', 'application/pdf',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPG, PNG, GIF, WebP, SVG) and PDFs are allowed.'));
    }
  },
});

router.post('/', upload.array('files', 5), createWebsiteRequest); // public
router.get('/', protectAdmin, getWebsiteRequests);                  // admin
router.put('/:id/read', protectAdmin, toggleWebsiteRequestRead);    // admin
router.delete('/:id', protectAdmin, deleteWebsiteRequest);          // admin

export default router;
