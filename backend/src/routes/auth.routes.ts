import { Router, Request, Response } from 'express';
import {
  sendOtp,
  verifyOtp,
  refreshToken,
  getProfile,
  updateProfile,
  logout,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/refresh', refreshToken);

// Protected routes (require authentication)
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

export default router;
