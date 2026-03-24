import { Router, Request, Response } from 'express';
import { authenticate, requireOwner, AuthRequest } from '../middlewares/auth.middleware';
import {
  getStoreOverview,
  getRevenueAnalytics,
  getInventoryAnalytics,
  getTopProducts,
  getPaymentAnalytics,
  getOrderAnalytics,
} from '../controllers/analytics.controller';

const router = Router();

// GET /api/analytics/store/:storeId/overview - Dashboard overview (owner)
router.get('/store/:storeId/overview', authenticate, requireOwner, getStoreOverview);

// GET /api/analytics/store/:storeId/revenue - Revenue metrics (owner)
router.get('/store/:storeId/revenue', authenticate, requireOwner, getRevenueAnalytics);

// GET /api/analytics/store/:storeId/inventory - Inventory metrics (owner)
router.get('/store/:storeId/inventory', authenticate, requireOwner, getInventoryAnalytics);

// GET /api/analytics/store/:storeId/top-products - Top products (owner)
router.get('/store/:storeId/top-products', authenticate, requireOwner, getTopProducts);

// GET /api/analytics/store/:storeId/payment - Payment breakdown (owner)
router.get('/store/:storeId/payment', authenticate, requireOwner, getPaymentAnalytics);

// GET /api/analytics/store/:storeId/orders - Order metrics (owner)
router.get('/store/:storeId/orders', authenticate, requireOwner, getOrderAnalytics);

export default router;
