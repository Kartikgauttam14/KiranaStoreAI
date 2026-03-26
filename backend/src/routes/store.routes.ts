import { Router, Request, Response } from 'express';
import { authenticate, requireOwner, AuthRequest } from '../middlewares/auth.middleware';
import {
  createStore,
  getOwnerStores,
  getStoreById,
  updateStore,
  deleteStore,
  getNearbyStores,
  searchStoresByCity,
  toggleStoreStatus,
  updateStoreRating,
} from '../controllers/store.controller';

const router = Router();

// POST /api/stores - Create a new store (owner only)
router.post('/', authenticate, requireOwner, createStore);

// GET /api/stores/my - Get owner's stores
router.get('/my', authenticate, requireOwner, getOwnerStores);

// GET /api/stores/nearby - Find nearby stores
router.get('/nearby', getNearbyStores);

// GET /api/stores/search/city - Search stores by city
router.get('/search/city', searchStoresByCity);

// GET /api/stores/:id - Get store by ID
router.get('/:id', getStoreById);

// PUT /api/stores/:id - Update store (owner only)
router.put('/:id', authenticate, requireOwner, updateStore);

// PUT /api/stores/:id/status - Toggle open/closed (owner only)
router.put('/:id/status', authenticate, requireOwner, toggleStoreStatus);

// PUT /api/stores/:id/rating - Update store rating
router.put('/:id/rating', updateStoreRating);

// DELETE /api/stores/:id - Delete store (owner only)
router.delete('/:id', authenticate, requireOwner, deleteStore);

export default router;
