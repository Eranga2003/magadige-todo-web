import { Response, NextFunction } from 'express';
import { getDb } from '../utils/firebase';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

/**
 * Retrieve all tasks for the logged-in user
 */
export async function getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    const db = getDb();
    const snapshot = await db.collection('tasks').where('userId', '==', userId).get();
    
    const tasks: any[] = [];
    snapshot.docs.forEach((doc: any) => {
      tasks.push(doc.data());
    });

    res.status(200).json({ status: 'success', data: tasks });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new task
 */
export async function createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    const { id, title, description, priority, dueDate, completed, section, comments, createdAt, meeting, startTime, endTime } = req.body;
    const db = getDb();

    // Generate or use client-provided task ID
    const taskDocRef = db.collection('tasks').doc(id || `task_${Date.now()}`);
    const taskId = taskDocRef.id;

    const newTask = {
      id: taskId,
      userId,
      title: title || '',
      description: description || '',
      priority: priority || 'P4',
      dueDate: dueDate || 'NONE',
      completed: completed !== undefined ? completed : false,
      section: section || 'INBOX',
      comments: comments || [],
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      meeting: meeting || null,
      startTime: startTime || null,
      endTime: endTime || null,
    };

    await taskDocRef.set(newTask);

    res.status(201).json({ status: 'success', data: newTask });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing task
 */
export async function updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const taskId = req.params.id;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    const db = getDb();
    const taskDocRef = db.collection('tasks').doc(taskId);
    const doc = await taskDocRef.get();

    if (!doc.exists) {
      res.status(404).json({ status: 'error', message: 'Task not found.' });
      return;
    }

    const existingTask = doc.data();
    if (existingTask.userId !== userId) {
      res.status(403).json({ status: 'error', message: 'Forbidden. You do not own this task.' });
      return;
    }

    const updatedFields = {
      ...req.body,
      id: taskId,
      userId,
      updatedAt: new Date().toISOString()
    };

    const updatedTask = {
      ...existingTask,
      ...updatedFields
    };

    await taskDocRef.set(updatedTask);

    res.status(200).json({ status: 'success', data: updatedTask });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a task
 */
export async function deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const taskId = req.params.id;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    const db = getDb();
    const taskDocRef = db.collection('tasks').doc(taskId);
    const doc = await taskDocRef.get();

    if (!doc.exists) {
      res.status(404).json({ status: 'error', message: 'Task not found.' });
      return;
    }

    const existingTask = doc.data();
    if (existingTask.userId !== userId) {
      res.status(403).json({ status: 'error', message: 'Forbidden. You do not own this task.' });
      return;
    }

    await taskDocRef.delete();

    res.status(200).json({ status: 'success', message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
