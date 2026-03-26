import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// GET /api/analytics/store/:storeId/overview - Store dashboard overview
export const getStoreOverview = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({ where: { id: storeId as string } });
    if (!store || store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Get metrics
    const [products, bills, orders, lowStockCount, totalRevenue, totalGst] = await Promise.all([
      prisma.product.count({ where: { storeId: storeId as string, isActive: true } }),
      prisma.bill.count({ where: { storeId: storeId as string } }),
      prisma.order.count({ where: { storeId: storeId as string } }),
      prisma.product.count({
        where: {
          storeId: storeId as string,
          isActive: true,
          currentStock: { lte: prisma.product.fields.reorderLevel },
        },
      }),
      prisma.bill.aggregate({
        where: { storeId: storeId as string },
        _sum: { grandTotal: true },
      }),
      prisma.bill.aggregate({
        where: { storeId: storeId as string },
        _sum: { gstTotal: true },
      }),
    ]);

    // Calculate inventory value
    const storeProducts = await prisma.product.findMany({
      where: { storeId: storeId as string, isActive: true },
      select: { currentStock: true, costPrice: true },
    });

    const inventoryValue = storeProducts.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);

    res.json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          city: store.city,
          rating: store.rating,
          totalRatings: store.totalRatings,
        },
        metrics: {
          totalProducts: products,
          totalBills: bills,
          totalOrders: orders,
          lowStockProducts: lowStockCount,
          inventoryValue: parseFloat(inventoryValue.toFixed(2)),
          totalRevenue: totalRevenue._sum.grandTotal || 0,
          totalGst: totalGst._sum.gstTotal || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching store overview:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch overview' });
  }
};

// GET /api/analytics/store/:storeId/revenue - Revenue analytics
export const getRevenueAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { period = '30' } = req.query;

    const store = await prisma.store.findUnique({ where: { id: storeId as string } });
    if (!store || store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const periodDays = parseInt(period as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const bills = await prisma.bill.findMany({
      where: {
        storeId: storeId as string,
        createdAt: { gte: startDate },
      },
      select: { grandTotal: true, gstTotal: true, createdAt: true, paymentMode: true },
    });

    // Aggregate by day
    const dailyData: any = {};
    let totalRevenue = 0;
    let totalGst = 0;

    bills.forEach((bill) => {
      const date = bill.createdAt.toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + bill.grandTotal;
      totalRevenue += bill.grandTotal;
      totalGst += bill.gstTotal;
    });

    res.json({
      success: true,
      data: {
        period: `Last ${periodDays} days`,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalGst: parseFloat(totalGst.toFixed(2)),
        averageDaily: bills.length > 0 ? parseFloat((totalRevenue / periodDays).toFixed(2)) : 0,
        billCount: bills.length,
        dailyRevenue: dailyData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch analytics' });
  }
};

// GET /api/analytics/store/:storeId/inventory - Inventory analytics
export const getInventoryAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({ where: { id: storeId as string } });
    if (!store || store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const products = await prisma.product.findMany({
      where: { storeId: storeId as string, isActive: true },
    });

    const categories: any = {};
    let totalCostValue = 0;
    let totalSellingValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((product) => {
      const category = product.category;
      if (!categories[category]) {
        categories[category] = { count: 0, costValue: 0, sellingValue: 0 };
      }

      categories[category].count++;
      const costValue = product.currentStock * product.costPrice;
      const sellingValue = product.currentStock * product.sellingPrice;
      categories[category].costValue += costValue;
      categories[category].sellingValue += sellingValue;

      totalCostValue += costValue;
      totalSellingValue += sellingValue;

      if (product.currentStock === 0) outOfStockCount++;
      else if (product.currentStock <= product.reorderLevel) lowStockCount++;
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts: products.length,
          lowStockProducts: lowStockCount,
          outOfStockProducts: outOfStockCount,
          totalCostValue: parseFloat(totalCostValue.toFixed(2)),
          totalSellingValue: parseFloat(totalSellingValue.toFixed(2)),
          totalMargin: parseFloat((totalSellingValue - totalCostValue).toFixed(2)),
        },
        byCategory: Object.entries(categories).map(([name, data]: [string, any]) => ({
          name,
          productCount: data.count,
          costValue: parseFloat(data.costValue.toFixed(2)),
          sellingValue: parseFloat(data.sellingValue.toFixed(2)),
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch analytics' });
  }
};

// GET /api/analytics/store/:storeId/top-products - Top selling products
export const getTopProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { period = '30', limit = '10' } = req.query;

    const store = await prisma.store.findUnique({ where: { id: storeId as string } });
    if (!store || store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const periodDays = parseInt(period as string) || 30;
    const limitNum = parseInt(limit as string) || 10;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const billItems = await prisma.billItem.findMany({
      where: {
        bill: { storeId: storeId as string, createdAt: { gte: startDate } },
      },
      include: { product: true },
    });

    const productStats: any = {};
    billItems.forEach((item) => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          gst: 0,
        };
      }
      productStats[item.productId].quantity += item.quantity;
      productStats[item.productId].revenue += item.totalPrice;
      productStats[item.productId].gst += item.gstAmount;
    });

    const topProducts = Object.entries(productStats)
      .map(([productId, stats]: [string, any]) => ({ productId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limitNum);

    res.json({
      success: true,
      data: topProducts,
      period: `Last ${periodDays} days`,
    });
  } catch (error: any) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch top products' });
  }
};

// GET /api/analytics/store/:storeId/payment - Payment mode analytics
export const getPaymentAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { period = '30' } = req.query;

    const store = await prisma.store.findUnique({ where: { id: storeId as string } });
    if (!store || store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const periodDays = parseInt(period as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const bills = await prisma.bill.findMany({
      where: {
        storeId: storeId as string,
        createdAt: { gte: startDate },
      },
      select: { paymentMode: true, grandTotal: true },
    });

    const paymentData: any = {};
    let totalRevenue = 0;

    bills.forEach((bill) => {
      if (!paymentData[bill.paymentMode]) {
        paymentData[bill.paymentMode] = { count: 0, amount: 0 };
      }
      paymentData[bill.paymentMode].count++;
      paymentData[bill.paymentMode].amount += bill.grandTotal;
      totalRevenue += bill.grandTotal;
    });

    const breakdown = Object.entries(paymentData).map(([mode, data]: [string, any]) => ({
      mode,
      count: data.count,
      amount: parseFloat(data.amount.toFixed(2)),
      percentage: totalRevenue > 0 ? parseFloat(((data.amount / totalRevenue) * 100).toFixed(2)) : 0,
    }));

    res.json({
      success: true,
      data: breakdown,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      period: `Last ${periodDays} days`,
    });
  } catch (error: any) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch analytics' });
  }
};

// GET /api/analytics/store/:storeId/orders - Order analytics
export const getOrderAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({ where: { id: storeId as string } });
    if (!store || store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const orders = await prisma.order.findMany({
      where: { storeId: storeId as string },
      select: { status: true, grandTotal: true, createdAt: true },
    });

    const statusCounts: any = {};
    let totalOrderValue = 0;

    orders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      totalOrderValue += order.grandTotal;
    });

    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalOrderValue: parseFloat(totalOrderValue.toFixed(2)),
        averageOrderValue: orders.length > 0 ? parseFloat((totalOrderValue / orders.length).toFixed(2)) : 0,
        byStatus: statusCounts,
      },
    });
  } catch (error: any) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch analytics' });
  }
};
