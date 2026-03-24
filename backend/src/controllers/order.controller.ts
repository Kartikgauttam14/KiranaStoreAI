import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Helper to generate order number
const generateOrderNumber = async (): Promise<string> => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
};

// POST /api/orders - Place an order
export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, items, deliveryAddress, deliveryFee = 0, discount = 0, paymentMode = 'CASH', notes } = req.body;

    if (!storeId || !items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: storeId, items, deliveryAddress',
      });
    }

    // Verify store exists
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    // Validate payment mode
    const validModes = ['CASH', 'UPI', 'CARD', 'CREDIT'];
    if (!validModes.includes(paymentMode)) {
      return res.status(400).json({ success: false, error: 'Invalid payment mode' });
    }

    // Fetch products and calculate totals
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });

      if (!product || product.storeId !== storeId) {
        return res.status(404).json({ success: false, error: `Product ${item.productId} not found` });
      }

      const itemTotal = (item.unitPrice || product.sellingPrice) * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        unitPrice: item.unitPrice || product.sellingPrice,
        totalPrice: itemTotal,
      });

      subtotal += itemTotal;
    }

    subtotal = parseFloat(subtotal.toFixed(2));
    const finalDiscount = Math.min(discount, subtotal + deliveryFee);
    const grandTotal = parseFloat((subtotal + deliveryFee - finalDiscount).toFixed(2));

    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        customerId: req.userId!,
        storeId,
        orderNumber,
        deliveryAddress,
        subtotal,
        deliveryFee,
        discount: finalDiscount,
        grandTotal,
        paymentMode: paymentMode as 'CASH' | 'UPI' | 'CARD' | 'CREDIT',
        isPaid: paymentMode !== 'CASH',
        notes: notes || null,
        status: 'PLACED',
        items: {
          createMany: { data: orderItems },
        },
      },
      include: {
        items: true,
        store: { select: { name: true, city: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to place order' });
  }
};

// GET /api/orders/my - Get customer's orders
export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const where: any = { customerId: req.userId };
    if (status) where.status = status;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, store: { select: { name: true, city: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch orders' });
  }
};

// GET /api/orders/store/:storeId - Get store's orders
export const getStoreOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { status, page = '1', limit = '10' } = req.query;

    const store = await prisma.store.findUnique({ where: { id: storeId as string } });
    if (!store || store.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const where: any = { storeId: storeId as string };
    if (status) where.status = status;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, customer: { select: { name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    console.error('Error fetching store orders:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch orders' });
  }
};

// GET /api/orders/:id - Get order details
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { sku: true } } } },
        customer: { select: { name: true, phone: true } },
        store: { select: { name: true, address: true, city: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify access
    if (order.customerId !== req.userId && (await prisma.store.findUnique({ where: { id: order.storeId } }))?.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch order' });
  }
};

// PUT /api/orders/:id/status - Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const store = await prisma.store.findUnique({ where: { id: order.storeId } });
    if (store?.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as any, updatedAt: new Date() },
    });

    res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update order' });
  }
};

// PUT /api/orders/:id/cancel - Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.customerId !== req.userId && (await prisma.store.findUnique({ where: { id: order.storeId } }))?.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'Cannot cancel order in this status' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED', updatedAt: new Date() },
    });

    res.json({ success: true, message: 'Order cancelled', data: updated });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to cancel order' });
  }
};

// PUT /api/orders/:id/mark-paid - Mark order as paid
export const markOrderAsPaid = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const store = await prisma.store.findUnique({ where: { id: order.storeId } });
    if (store?.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { isPaid: true },
    });

    res.json({ success: true, message: 'Order marked as paid', data: updated });
  } catch (error: any) {
    console.error('Error marking order as paid:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to mark paid' });
  }
};
