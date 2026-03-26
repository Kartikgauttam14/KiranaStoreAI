import { Router, Request, Response } from 'express';
import { authenticate, requireOwner, AuthRequest } from '../middlewares/auth.middleware';
import {
  addProduct,
  getProductsByStore,
  getProductById,
  updateProduct,
  deleteProduct,
  adjustStock,
  getLowStockProducts,
  getCategories,
  getInventoryValue,
  bulkUploadProducts,
} from '../controllers/product.controller';

const router = Router();

// POST /api/products - Add product (owner only)
router.post('/', authenticate, requireOwner, addProduct);

// POST /api/products/bulk-upload/:storeId - Bulk upload (owner only)
router.post('/bulk-upload/:storeId', authenticate, requireOwner, bulkUploadProducts);

// GET /api/products/store/:storeId - Get products by store
router.get('/store/:storeId', getProductsByStore);

// GET /api/products/category/:storeId - Get categories
router.get('/category/:storeId', getCategories);

// GET /api/products/low-stock/:storeId - Get low stock (owner only)
router.get('/low-stock/:storeId', authenticate, requireOwner, getLowStockProducts);

// GET /api/products/inventory-value/:storeId - Get inventory value (owner only)
router.get('/inventory-value/:storeId', authenticate, requireOwner, getInventoryValue);

// GET /api/products/:id - Get product details
router.get('/:id', getProductById);

// PUT /api/products/:id - Update product (owner only)
router.put('/:id', authenticate, requireOwner, updateProduct);

// POST /api/products/:id/adjust-stock - Adjust stock (owner only)
router.post('/:id/adjust-stock', authenticate, requireOwner, adjustStock);

// DELETE /api/products/:id - Delete product (owner only)
router.delete('/:id', authenticate, requireOwner, deleteProduct);

export default router;
