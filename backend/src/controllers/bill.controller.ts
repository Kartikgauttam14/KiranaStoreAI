import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Helper function to generate bill number
const generateBillNumber = async (storeId: string): Promise<string> => {
  const latestBill = await prisma.bill.findFirst({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    select: { billNumber: true },
  });

  if (!latestBill) {
    return `BILL-${Date.now()}-001`;
  }

  const lastNumber = parseInt(latestBill.billNumber.split('-').pop() || '0');
  const nextNumber = String(lastNumber + 1).padStart(3, '0');
  return `BILL-${Date.now()}-${nextNumber}`;
};

// POST /api/bills - Create a new bill (POS transaction)
export const createBill = async (req: AuthRequest, res: Response) => {
  try {
    const {
      storeId,
      items,
      customerName,
      customerPhone,
      discount = 0,
      paymentMode = 'CASH',
    } = req.body;

    // Validation
    if (!storeId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: storeId, items (non-empty array)',
      });
    }

    // Verify store and ownership
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    if (store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only create bills for your own stores',
      });
    }

    // Validate payment mode
    const validPaymentModes = ['CASH', 'UPI', 'CARD', 'CREDIT'];
    if (!validPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment mode. Must be one of: ${validPaymentModes.join(', ')}`,
      });
    }

    // Fetch products and validate stock
    const billItems: any[] = [];
    let subtotal = 0;
    let gstTotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product ${item.productId} not found`,
        });
      }

      if (product.storeId !== storeId) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productId} does not belong to this store`,
        });
      }

      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.currentStock}`,
        });
      }

      const unitPrice = item.unitPrice || product.sellingPrice;
      const itemSubtotal = unitPrice * item.quantity;
      const gstAmount = (itemSubtotal * product.gstRate) / 100;
      const itemTotal = itemSubtotal + gstAmount;

      billItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        unitPrice,
        gstRate: product.gstRate,
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        totalPrice: parseFloat(itemTotal.toFixed(2)),
      });

      subtotal += itemSubtotal;
      gstTotal += gstAmount;
    }

    subtotal = parseFloat(subtotal.toFixed(2));
    gstTotal = parseFloat(gstTotal.toFixed(2));

    // Apply discount
    const discountAmount = Math.min(discount, subtotal + gstTotal);
    const grandTotal = parseFloat((subtotal + gstTotal - discountAmount).toFixed(2));

    // Generate bill number
    const billNumber = await generateBillNumber(storeId);

    // Create bill with transaction
    const bill = await prisma.bill.create({
      data: {
        storeId,
        billNumber,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        subtotal,
        gstTotal,
        discount: discountAmount,
        grandTotal,
        paymentMode: paymentMode as 'CASH' | 'UPI' | 'CARD' | 'CREDIT',
        isPaid: paymentMode !== 'CREDIT',
        items: {
          createMany: {
            data: billItems,
          },
        },
      },
      include: {
        items: true,
        store: {
          select: {
            name: true,
            address: true,
            city: true,
            phone: true,
            gstNumber: true,
          },
        },
      },
    });

    // Update product stock
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            currentStock: product.currentStock - item.quantity,
          },
        });

        // Create SaleLog for demand forecasting
        const billItem = billItems[i];
        await prisma.saleLog.create({
          data: {
            productId: item.productId,
            storeId,
            quantity: item.quantity,
            unitPrice: billItem.unitPrice,
            totalPrice: billItem.totalPrice,
            saleDate: new Date(),
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: bill,
    });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create bill',
    });
  }
};

// GET /api/bills/store/:storeId - Get bills for a store
export const getBillsByStore = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { paymentMode, startDate, endDate, page = '1', limit = '20' } = req.query;

    // Verify store and ownership
    const store = await prisma.store.findUnique({
      where: { id: storeId as string },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    if (store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only view your own stores',
      });
    }

    const whereCondition: any = {
      storeId: storeId as string,
    };

    if (paymentMode) {
      whereCondition.paymentMode = paymentMode;
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) {
        whereCondition.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereCondition.createdAt.lte = new Date(endDate as string);
      }
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where: whereCondition,
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.bill.count({ where: whereCondition }),
    ]);

    res.json({
      success: true,
      data: bills,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch bills',
    });
  }
};

// GET /api/bills/:id - Get bill details
export const getBillById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                sku: true,
                hsnCode: true,
              },
            },
          },
        },
        store: {
          select: {
            name: true,
            address: true,
            city: true,
            pincode: true,
            phone: true,
            gstNumber: true,
            fssaiNumber: true,
          },
        },
      },
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found',
      });
    }

    if (bill.store && bill.store.gstNumber) {
      // Verify ownership through store relationship
      const store = await prisma.store.findUnique({
        where: { id: bill.storeId },
      });

      if (store?.ownerId !== req.userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: You can only view your own bills',
        });
      }
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error: any) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch bill',
    });
  }
};

// GET /api/bills/store/:storeId/summary - Get sales summary
export const getSalesSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { days = '30' } = req.query;

    // Verify store and ownership
    const store = await prisma.store.findUnique({
      where: { id: storeId as string },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    if (store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only view your own stores',
      });
    }

    const daysNum = parseInt(days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const bills = await prisma.bill.findMany({
      where: {
        storeId: storeId as string,
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Calculate summary
    let totalRevenue = 0;
    let totalGst = 0;
    let totalDiscount = 0;
    let totalTransactions = 0;
    const paymentModeBreakdown: any = {};
    const dailyRevenue: any = {};

    bills.forEach((bill) => {
      totalRevenue += bill.grandTotal;
      totalGst += bill.gstTotal;
      totalDiscount += bill.discount;
      totalTransactions++;

      // Payment mode breakdown
      paymentModeBreakdown[bill.paymentMode] = (paymentModeBreakdown[bill.paymentMode] || 0) + bill.grandTotal;

      // Daily revenue
      const date = bill.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + bill.grandTotal;
    });

    res.json({
      success: true,
      data: {
        period: `Last ${daysNum} days`,
        totalTransactions,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalGst: parseFloat(totalGst.toFixed(2)),
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        averageTransactionValue: totalTransactions > 0 ? parseFloat((totalRevenue / totalTransactions).toFixed(2)) : 0,
        paymentModeBreakdown,
        dailyRevenue,
      },
    });
  } catch (error: any) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch sales summary',
    });
  }
};

// POST /api/bills/:id/mark-paid - Mark bill as paid (for credit bills)
export const markBillAsPaid = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bill = await prisma.bill.findUnique({
      where: { id },
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        error: 'Bill not found',
      });
    }

    // Verify ownership through store
    const store = await prisma.store.findUnique({
      where: { id: bill.storeId },
    });

    if (store?.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only update your own bills',
      });
    }

    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        isPaid: true,
      },
    });

    res.json({
      success: true,
      message: 'Bill marked as paid',
      data: updatedBill,
    });
  } catch (error: any) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark bill as paid',
    });
  }
};

// GET /api/bills/store/:storeId/daily - Get today's sales
export const getTodaysSales = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    // Verify store and ownership
    const store = await prisma.store.findUnique({
      where: { id: storeId as string },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    if (store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only view your own stores',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bills = await prisma.bill.findMany({
      where: {
        storeId: storeId as string,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        items: true,
      },
    });

    let totalRevenue = 0;
    let totalGst = 0;
    let totalTransactions = bills.length;

    bills.forEach((bill) => {
      totalRevenue += bill.grandTotal;
      totalGst += bill.gstTotal;
    });

    res.json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        totalTransactions,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalGst: parseFloat(totalGst.toFixed(2)),
        bills,
      },
    });
  } catch (error: any) {
    console.error('Error fetching today sales:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch today sales',
    });
  }
};
