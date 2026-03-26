export interface Product {
  id: string;
  storeId: string;
  name: string;
  nameHindi?: string;
  category: string;
  sku: string;
  barcode?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  reorderQty: number;
  gstRate: number;
  hsnCode?: string;
  imageUrl?: string;
  expiryDate?: string;
  supplierName?: string;
  supplierPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  storeId: string;
  name: string;
  nameHindi?: string;
  category: string;
  sku: string;
  barcode?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  reorderQty: number;
  gstRate: number;
  hsnCode?: string;
  imageUrl?: string;
  expiryDate?: string;
  supplierName?: string;
  supplierPhone?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface StockAdjustmentRequest {
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: 'PURCHASE' | 'DAMAGE' | 'THEFT' | 'EXPIRY' | 'CORRECTION' | 'RETURN';
  notes?: string;
}

export interface SalesLog {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: string;
}
