
import { Router } from 'express';
import {
  listItems,
  listMyItems,
  getItemById,
  createItem,
  updateItem,
  deleteMyItems,
  deleteItem,
} from '../controllers/itemController.js';

import requireAuth from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', listItems);

// Protected routes
router.get('/mine', requireAuth, listMyItems);
router.post('/', requireAuth, createItem);
router.delete('/mine', requireAuth, deleteMyItems);

// Public single-item route
router.get('/:id', getItemById);

// Owner-only routes
router.put('/:id', requireAuth, updateItem);
router.delete('/:id', requireAuth, deleteItem);

export default router;
