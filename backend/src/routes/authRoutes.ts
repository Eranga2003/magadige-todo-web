import { Router } from 'express';
import { register, login, socialLogin, getMe, updateProfile } from '../controllers/authController';
import { validateBody, registerSchema, loginSchema, socialLoginSchema } from '../middlewares/validationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Register route with Zod input validation
router.post('/register', validateBody(registerSchema), register);

// Login route with Zod input validation
router.post('/login', validateBody(loginSchema), login);

// Social (Google/Facebook) login/register route
router.post('/social-login', validateBody(socialLoginSchema), socialLogin);

// Get current logged-in user profile (requires valid JWT)
router.get('/me', authMiddleware, getMe);

// Update user profile information (requires valid JWT)
router.put('/profile', authMiddleware, updateProfile);

export default router;
