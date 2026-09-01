

import express from 'express';
import { register, login, getMe, getPublicArtists } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/artists', getPublicArtists);

// Protected routes
router.get('/me', auth, getMe);

export default router;