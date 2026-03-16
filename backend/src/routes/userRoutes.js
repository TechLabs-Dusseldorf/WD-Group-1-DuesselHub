import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { getUserProfile, updateUserProfile, changePassword } from '../controllers/userController.js';

const router = express.Router();

// All these routes require the user to be logged in
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/profile/password', protect, changePassword);

export default router;