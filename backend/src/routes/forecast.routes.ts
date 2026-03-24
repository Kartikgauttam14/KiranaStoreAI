import { Router, Request, Response } from 'express';
import { authenticate, requireOwner, AuthRequest } from '../middlewares/auth.middleware';
import {
  generateProductForecast,
  generateAllForecasts,
  getStoreForcasts,
  getLatestProductForecast,
} from '../controllers/forecast.controller';

const router = Router();

// POST /api/forecasts/product/:productId - Generate forecast (owner)
router.post('/product/:productId', authenticate, requireOwner, generateProductForecast);

// POST /api/forecasts/store/:storeId/all - Generate all (owner)
router.post('/store/:storeId/all', authenticate, requireOwner, generateAllForecasts);

// GET /api/forecasts/store/:storeId - Get store forecasts
router.get('/store/:storeId', authenticate, getStoreForcasts);

// GET /api/forecasts/product/:productId/latest - Get latest forecast
router.get('/product/:productId/latest', getLatestProductForecast);

export default router;
