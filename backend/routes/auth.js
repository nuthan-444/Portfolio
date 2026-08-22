import express from 'express';
import { loginAdmin, getMe, logoutAdmin } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', protectAdmin, getMe);

export default router;
