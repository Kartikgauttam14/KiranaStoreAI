import { Router, Request, Response } from 'express';
import { authenticate, requireOwner, AuthRequest } from '../middlewares/auth.middleware';
import {
  createBill,
  getBillsByStore,
  getBillById,
  getSalesSummary,
  markBillAsPaid,
  getTodaysSales,
} from '../controllers/bill.controller';

const router = Router();

// POST /api/bills - Create bill (owner only)
router.post('/', authenticate, requireOwner, createBill);

// GET /api/bills/store/:storeId - Get store bills (owner only)
router.get('/store/:storeId', authenticate, requireOwner, getBillsByStore);

// GET /api/bills/store/:storeId/summary - Sales summary (owner only)
router.get('/store/:storeId/summary', authenticate, requireOwner, getSalesSummary);

// GET /api/bills/store/:storeId/daily - Today's sales (owner only)
router.get('/store/:storeId/daily', authenticate, requireOwner, getTodaysSales);

// GET /api/bills/:id - Get bill details (owner only)
router.get('/:id', authenticate, requireOwner, getBillById);

// POST /api/bills/:id/mark-paid - Mark paid (owner only)
router.post('/:id/mark-paid', authenticate, requireOwner, markBillAsPaid);

export default router;
