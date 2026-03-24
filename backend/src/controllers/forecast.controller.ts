import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Helper function to calculate demand forecast based on sales history
const calculateForecast = (saleLogs: any[], productData: any) => {
  if (saleLogs.length === 0) {
    return {
      forecast7d: productData.reorderQty * 0.5,
      forecast14d: productData.reorderQty * 1.0,
      forecast30d: productData.reorderQty * 2.0,
      confidence: 'LOW',
      reasoning: 'Insufficient sales history for accurate forecast',
    };
  }

  // Calculate daily average
  const totalDays = Math.max(1, Math.ceil((new Date().getTime() - saleLogs[0].saleDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalQuantity = saleLogs.reduce((sum: number, log: any) => sum + log.quantity, 0);
  const dailyAverage = totalQuantity / Math.max(1, totalDays);

  // Simple trend analysis (last 7 days vs previous)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const last7Days = saleLogs.filter((log: any) => log.saleDate >= sevenDaysAgo).reduce((s: number, l: any) => s + l.quantity, 0);
  const prev7Days = saleLogs.filter((log: any) => log.saleDate >= fourteenDaysAgo && log.saleDate < sevenDaysAgo).reduce((s: number, l: any) => s + l.quantity, 0);

  const trend = prev7Days > 0 ? last7Days / prev7Days : 1.0;

  const forecast7d = Math.ceil(dailyAverage * 7 * trend);
  const forecast14d = Math.ceil(dailyAverage * 14 * trend);
  const forecast30d = Math.ceil(dailyAverage * 30 * trend);

  let confidence: string;
  if (totalDays >= 30) confidence = 'HIGH';
  else if (totalDays >= 14) confidence = 'MEDIUM';
  else confidence = 'LOW';

  return {
    forecast7d,
    forecast14d,
    forecast30d,
    confidence,
    reasoning: `Based on ${saleLogs.length} sales records over ${totalDays} days. Daily average: ${dailyAverage.toFixed(2)}. Trend: ${(trend * 100).toFixed(0)}%`,
  };
};

// POST /api/forecasts/product/:productId - Generate forecast for a product
export const generateProductForecast = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (product.store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Fetch sales history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const saleLogs = await prisma.saleLog.findMany({
      where: {
        productId,
        saleDate: { gte: thirtyDaysAgo },
      },
      orderBy: { saleDate: 'asc' },
    });

    const { forecast7d, forecast14d, forecast30d, confidence, reasoning } = calculateForecast(saleLogs, product);

    const restockNow = product.currentStock <= product.reorderLevel;
    const recommendedQty = Math.max(product.reorderQty, Math.ceil(forecast30d * 1.2));
    const bestReorderDay = Math.ceil(product.currentStock / Math.max(1, forecast7d / 7));

    // Upsert forecast
    const forecast = await prisma.forecast.upsert({
      where: {
        storeId_productId: {
          storeId: product.storeId,
          productId,
        },
      },
      update: {
        forecast7d,
        forecast14d,
        forecast30d,
        restockNow,
        recommendedQty,
        bestReorderDay: `${bestReorderDay} days`,
        confidence,
        reasoning,
        generatedAt: new Date(),
      },
      create: {
        productId,
        storeId: product.storeId,
        forecast7d,
        forecast14d,
        forecast30d,
        restockNow,
        recommendedQty,
        bestReorderDay: `${bestReorderDay} days`,
        seasonalNote: null,
        confidence,
        reasoning,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Forecast generated successfully',
      data: forecast,
    });
  } catch (error: any) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate forecast' });
  }
};

// POST /api/forecasts/store/:storeId/all - Generate forecasts for all products
export const generateAllForecasts = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const products = await prisma.product.findMany({
      where: { storeId, isActive: true },
    });

    const results = { successful: 0, failed: 0 };

    for (const product of products) {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const saleLogs = await prisma.saleLog.findMany({
          where: { productId: product.id, saleDate: { gte: thirtyDaysAgo } },
          orderBy: { saleDate: 'asc' },
        });

        const { forecast7d, forecast14d, forecast30d, confidence, reasoning } = calculateForecast(saleLogs, product);
        const restockNow = product.currentStock <= product.reorderLevel;
        const recommendedQty = Math.max(product.reorderQty, Math.ceil(forecast30d * 1.2));
        const bestReorderDay = Math.ceil(product.currentStock / Math.max(1, forecast7d / 7));

        await prisma.forecast.upsert({
          where: { storeId_productId: { storeId, productId: product.id } },
          update: {
            forecast7d,
            forecast14d,
            forecast30d,
            restockNow,
            recommendedQty,
            bestReorderDay: `${bestReorderDay} days`,
            confidence,
            reasoning,
            generatedAt: new Date(),
          },
          create: {
            productId: product.id,
            storeId,
            forecast7d,
            forecast14d,
            forecast30d,
            restockNow,
            recommendedQty,
            bestReorderDay: `${bestReorderDay} days`,
            confidence,
            reasoning,
          },
        });

        results.successful++;
      } catch (err) {
        results.failed++;
      }
    }

    res.json({
      success: true,
      message: `Generated forecasts for ${results.successful} products`,
      data: results,
    });
  } catch (error: any) {
    console.error('Error generating all forecasts:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate forecasts' });
  }
};

// GET /api/forecasts/store/:storeId - Get all forecasts for a store
export const getStoreForcasts = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { restockOnly } = req.query;

    const store = await prisma.store.findUnique({ where: { id: storeId as string } });
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    const where: any = { storeId: storeId as string };
    if (restockOnly === 'true') {
      where.restockNow = true;
    }

    const forecasts = await prisma.forecast.findMany({
      where,
      include: { product: { select: { name: true, currentStock: true, reorderLevel: true } } },
      orderBy: { generatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: forecasts,
      total: forecasts.length,
    });
  } catch (error: any) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch forecasts' });
  }
};

// GET /api/forecasts/product/:productId/latest - Get latest forecast for a product
export const getLatestProductForecast = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const forecast = await prisma.forecast.findFirst({
      where: { productId },
      include: { product: { select: { name: true, currentStock: true } }, store: { select: { name: true } } },
      orderBy: { generatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: forecast,
    });
  } catch (error: any) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch forecast' });
  }
};
