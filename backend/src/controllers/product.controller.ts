import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// POST /api/products - Add product to store
export const addProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, name, nameHindi, category, sku, barcode, unit, costPrice, sellingPrice, currentStock, reorderLevel, reorderQty, gstRate, hsnCode, imageUrl, supplierName, supplierPhone } = req.body;

    // Validation
    if (!storeId || !name || !category || !sku || !unit || costPrice === undefined || sellingPrice === undefined || currentStock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: storeId, name, category, sku, unit, costPrice, sellingPrice, currentStock',
      });
    }

    // Verify store exists and user is owner
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
        error: 'Unauthorized: You can only add products to your own stores',
      });
    }

    // Check if product with same SKU already exists in this store
    const existingProduct = await prisma.product.findUnique({
      where: {
        storeId_sku: {
          storeId,
          sku,
        },
      },
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'Product with this SKU already exists in this store',
      });
    }

    // Validate prices
    if (costPrice < 0 || sellingPrice < 0 || currentStock < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price and stock values cannot be negative',
      });
    }

    if (sellingPrice < costPrice) {
      return res.status(400).json({
        success: false,
        error: 'Selling price must be greater than cost price',
      });
    }

    const product = await prisma.product.create({
      data: {
        storeId,
        name,
        nameHindi: nameHindi || null,
        category,
        sku,
        barcode: barcode || null,
        unit,
        costPrice,
        sellingPrice,
        currentStock,
        reorderLevel: reorderLevel || 10,
        reorderQty: reorderQty || 50,
        gstRate: gstRate || 5,
        hsnCode: hsnCode || null,
        imageUrl: imageUrl || null,
        supplierName: supplierName || null,
        supplierPhone: supplierPhone || null,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add product',
    });
  }
};

// GET /api/products/store/:storeId - Get all products for a store
export const getProductsByStore = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const { category, lowStock = 'false', search } = req.query;

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId as string },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    const whereCondition: any = {
      storeId: storeId as string,
      isActive: true,
    };

    if (category) {
      whereCondition.category = {
        equals: category as string,
        mode: 'insensitive',
      };
    }

    if (lowStock === 'true') {
      whereCondition.currentStock = {
        lte: prisma.product.fields.reorderLevel,
      };
    }

    if (search) {
      whereCondition.OR = [
        {
          name: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          sku: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate margin and status for each product
    const enrichedProducts = products.map((product) => ({
      ...product,
      margin: product.sellingPrice - product.costPrice,
      marginPercent: ((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(2),
      stockStatus: product.currentStock <= product.reorderLevel ? 'LOW' : product.currentStock <= product.reorderLevel * 1.5 ? 'MEDIUM' : 'HEALTHY',
    }));

    res.json({
      success: true,
      data: enrichedProducts,
      total: enrichedProducts.length,
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch products',
    });
  }
};

// GET /api/products/:id - Get product details
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        _count: {
          select: {
            billItems: true,
            orderItems: true,
            stockAdjustments: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const enriched = {
      ...product,
      margin: product.sellingPrice - product.costPrice,
      marginPercent: ((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(2),
      stockStatus: product.currentStock <= product.reorderLevel ? 'LOW' : 'HEALTHY',
    };

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch product',
    });
  }
};

// PUT /api/products/:id - Update product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, nameHindi, category, costPrice, sellingPrice, reorderLevel, reorderQty, gstRate, imageUrl, supplierName, supplierPhone } = req.body;

    // Get product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (product.store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only update products in your own stores',
      });
    }

    // Validate prices
    if ((costPrice !== undefined && costPrice < 0) || (sellingPrice !== undefined && sellingPrice < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Price values cannot be negative',
      });
    }

    const finalCostPrice = costPrice !== undefined ? costPrice : product.costPrice;
    const finalSellingPrice = sellingPrice !== undefined ? sellingPrice : product.sellingPrice;

    if (finalSellingPrice < finalCostPrice) {
      return res.status(400).json({
        success: false,
        error: 'Selling price must be greater than cost price',
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || undefined,
        nameHindi: nameHindi || undefined,
        category: category || undefined,
        costPrice: costPrice !== undefined ? costPrice : undefined,
        sellingPrice: sellingPrice !== undefined ? sellingPrice : undefined,
        reorderLevel: reorderLevel !== undefined ? reorderLevel : undefined,
        reorderQty: reorderQty !== undefined ? reorderQty : undefined,
        gstRate: gstRate !== undefined ? gstRate : undefined,
        imageUrl: imageUrl || undefined,
        supplierName: supplierName || undefined,
        supplierPhone: supplierPhone || undefined,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update product',
    });
  }
};

// DELETE /api/products/:id - Delete product (soft delete)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (product.store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only delete products from your own stores',
      });
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete product',
    });
  }
};

// POST /api/products/:id/adjust-stock - Adjust product stock
export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (quantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: quantity, reason',
      });
    }

    const validReasons = ['PURCHASE', 'DAMAGE', 'THEFT', 'EXPIRY', 'CORRECTION', 'RETURN'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        error: `Invalid reason. Must be one of: ${validReasons.join(', ')}`,
      });
    }

    // Get product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (product.store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only adjust stock in your own stores',
      });
    }

    const newStock = product.currentStock + quantity;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock adjustment would result in negative stock',
      });
    }

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        currentStock: newStock,
        updatedAt: new Date(),
      },
    });

    // Record stock adjustment in StockAdjustment table
    const adjustment = await prisma.stockAdjustment.create({
      data: {
        productId: id,
        storeId: product.storeId,
        quantity,
        reason: reason as 'PURCHASE' | 'DAMAGE' | 'THEFT' | 'EXPIRY' | 'CORRECTION' | 'RETURN',
        type: quantity > 0 ? 'INBOUND' : 'OUTBOUND',
        notes: `Previous: ${product.currentStock}, New: ${newStock}`,
      },
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        product: updatedProduct,
        adjustment,
      },
    });
  } catch (error: any) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to adjust stock',
    });
  }
};

// GET /api/products/low-stock/:storeId - Get low stock products
export const getLowStockProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

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
        error: 'Unauthorized: You can only view your own stores',
      });
    }

    const lowStockProducts = await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
        currentStock: {
          lte: prisma.product.fields.reorderLevel,
        },
      },
      orderBy: {
        currentStock: 'asc',
      },
    });

    const enriched = lowStockProducts.map((product) => ({
      ...product,
      shortfall: product.reorderQty - product.currentStock,
      margin: product.sellingPrice - product.costPrice,
    }));

    res.json({
      success: true,
      data: enriched,
      total: enriched.length,
    });
  } catch (error: any) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch low stock products',
    });
  }
};

// GET /api/products/category/:storeId - Get product categories for store
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: {
        storeId,
        isActive: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    const enriched = categories.map((cat) => ({
      name: cat.category,
      productCount: cat._count.id,
    }));

    res.json({
      success: true,
      data: enriched,
      total: enriched.length,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch categories',
    });
  }
};

// GET /api/products/inventory-value/:storeId - Get total inventory value
export const getInventoryValue = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

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
        error: 'Unauthorized: You can only view your own stores',
      });
    }

    const products = await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
      },
    });

    let totalCostValue = 0;
    let totalSellingValue = 0;
    let totalMargin = 0;

    products.forEach((product) => {
      const costValue = product.currentStock * product.costPrice;
      const sellingValue = product.currentStock * product.sellingPrice;
      const margin = sellingValue - costValue;

      totalCostValue += costValue;
      totalSellingValue += sellingValue;
      totalMargin += margin;
    });

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalCostValue: parseFloat(totalCostValue.toFixed(2)),
        totalSellingValue: parseFloat(totalSellingValue.toFixed(2)),
        totalMargin: parseFloat(totalMargin.toFixed(2)),
        marginPercent: ((totalMargin / totalCostValue) * 100).toFixed(2),
      },
    });
  } catch (error: any) {
    console.error('Error calculating inventory value:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate inventory value',
    });
  }
};

// POST /api/products/bulk-upload/:storeId - Bulk upload products
export const bulkUploadProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    const { products: productsData } = req.body;

    if (!Array.isArray(productsData) || productsData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Products array is required and must not be empty',
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
        error: 'Unauthorized: You can only upload products to your own stores',
      });
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (let index = 0; index < productsData.length; index++) {
      const data = productsData[index];

      try {
        // Check if product already exists
        const existing = await prisma.product.findUnique({
          where: {
            storeId_sku: {
              storeId,
              sku: data.sku,
            },
          },
        });

        if (existing) {
          results.failed++;
          results.errors.push({
            row: index + 1,
            sku: data.sku,
            error: 'SKU already exists',
          });
          continue;
        }

        await prisma.product.create({
          data: {
            storeId,
            name: data.name,
            nameHindi: data.nameHindi || null,
            category: data.category,
            sku: data.sku,
            barcode: data.barcode || null,
            unit: data.unit,
            costPrice: parseFloat(data.costPrice),
            sellingPrice: parseFloat(data.sellingPrice),
            currentStock: parseFloat(data.currentStock),
            reorderLevel: data.reorderLevel ? parseFloat(data.reorderLevel) : 10,
            reorderQty: data.reorderQty ? parseFloat(data.reorderQty) : 50,
            gstRate: data.gstRate ? parseFloat(data.gstRate) : 5,
            hsnCode: data.hsnCode || null,
            imageUrl: data.imageUrl || null,
            supplierName: data.supplierName || null,
            supplierPhone: data.supplierPhone || null,
            isActive: true,
          },
        });

        results.successful++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({
          row: index + 1,
          sku: data.sku,
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk upload completed. ${results.successful} products created, ${results.failed} failed.`,
      data: results,
    });
  } catch (error: any) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to bulk upload products',
    });
  }
};
