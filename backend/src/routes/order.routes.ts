import { Router, Request, Response } from 'express';
import { authenticate, requireOwner, AuthRequest } from '../middlewares/auth.middleware';
import {
  placeOrder,
  getCustomerOrders,
  getStoreOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  markOrderAsPaid,
} from '../controllers/order.controller';

const router = Router();

// POST /api/orders - Place order (customer)
router.post('/', authenticate, placeOrder);

// GET /api/orders/my - Get customer's orders
router.get('/my', authenticate, getCustomerOrders);

// GET /api/orders/store/:storeId - Get store's orders (owner)
router.get('/store/:storeId', authenticate, requireOwner, getStoreOrders);

// GET /api/orders/:id - Get order details
router.get('/:id', authenticate, getOrderById);

// PUT /api/orders/:id/status - Update status (owner)
router.put('/:id/status', authenticate, requireOwner, updateOrderStatus);

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', authenticate, cancelOrder);

// PUT /api/orders/:id/mark-paid - Mark paid (owner)
router.put('/:id/mark-paid', authenticate, requireOwner, markOrderAsPaid);

export default router;
