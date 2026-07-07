import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { breakDownTask } from '../controllers/aiController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Protect all task endpoints with JWT token validation
router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTask);
router.post('/breakdown', breakDownTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;

