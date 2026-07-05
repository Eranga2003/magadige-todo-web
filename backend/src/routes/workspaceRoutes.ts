import { Router } from 'express';
import { 
  createWorkspace, 
  getWorkspaces, 
  getWorkspaceById, 
  inviteMember, 
  validateToken, 
  acceptInvitation,
  createWorkspaceProject
} from '../controllers/workspaceController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public invitation token validation
router.get('/invitations/validate/:token', validateToken);

// Protected routes (require JWT verification)
router.post('/workspaces', authMiddleware, createWorkspace);
router.get('/workspaces', authMiddleware, getWorkspaces);
router.get('/workspaces/:id', authMiddleware, getWorkspaceById);
router.post('/workspaces/:id/invite', authMiddleware, inviteMember);
router.post('/workspaces/:id/projects', authMiddleware, createWorkspaceProject);
router.post('/invitations/accept', authMiddleware, acceptInvitation);

export default router;
