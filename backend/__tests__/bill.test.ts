// backend/__tests__/bill.test.ts

import request from 'supertest';
import app from '../src/index';
import { prisma } from '@/db';

describe('Billing Controller Tests', () => {
  let storeId: string;
  let productId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const userRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        phone: '+919876543210',
        otp: '123456',
        name: 'Store Owner',
        role: 'owner'
      });

    authToken = userRes.body.data.accessToken;

    // Create test store
    const storeRes = await request(app)
      .post('/api/stores')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Store',
        latitude: 28.6139,
        longitude: 77.2090,
        address: '123 Main St',
        city: 'Delhi',
        pincode: '110001'
      });

    storeId = storeRes.body.data.store.id;

    // Create test product
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        storeId,
        name: 'Whole Milk 1L',
        category: 'Dairy',
        sku: 'MILK001',
        unit: 'Litre',
        costPrice: 40,
        sellingPrice: 55,
        currentStock: 100,
        reorderLevel: 10,
        reorderQty: 50,
        gstRate: 5
      });

    productId = productRes.body.data.product.id;
  });

  describe('POST /api/bills', () => {
    it('should create bill and deduct stock', async () => {
      // Get initial stock
      const initialProduct = await prisma.product.findUnique({
        where: { id: productId }
      });

      const initialStock = initialProduct?.currentStock || 0;

      // Create bill
      const response = await request(app)
        .post('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          storeId,
          items: [
            {
              productId,
              quantity: 2,
              unitPrice: 55
            }
          ],
          customerName: 'Raj Kumar',
          customerPhone: '+919876543210',
          paymentMode: 'CASH',
          discount: 0
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bill).toHaveProperty('billNumber');
      expect(response.body.data.bill.subtotal).toBe(110);
      expect(response.body.data.bill.grandTotal).toBeGreaterThan(110);

      // Verify stock was deducted
      const updatedProduct = await prisma.product.findUnique({
        where: { id: productId }
      });

      expect(updatedProduct?.currentStock).toBe(initialStock - 2);
    });

    it('should reject bill with out-of-stock items', async () => {
      const response = await request(app)
        .post('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          storeId,
          items: [
            {
              productId,
              quantity: 1000, // More than available
              unitPrice: 55
            }
          ],
          customerName: 'Test User',
          customerPhone: '+919876543210',
          paymentMode: 'CASH'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('stock');
    });

    it('should calculate GST correctly', async () => {
      const response = await request(app)
        .post('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          storeId,
          items: [
            {
              productId,
              quantity: 1,
              unitPrice: 100 // For easier calculation
            }
          ],
          customerName: 'Test User',
          customerPhone: '+919876543210',
          paymentMode: 'CASH',
          discount: 0
        });

      expect(response.status).toBe(201);
      
      const bill = response.body.data.bill;
      const expectedTax = 100 * 0.05; // 5% GST
      
      expect(bill.tax).toBeCloseTo(expectedTax, 2);
      expect(bill.grandTotal).toBeCloseTo(100 + expectedTax, 2);
    });
  });

  describe('GET /api/bills/store/:storeId', () => {
    it('should return bill history for store', async () => {
      const response = await request(app)
        .get(`/api/bills/store/${storeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.bills)).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('totalAmount');
    });

    it('should filter bills by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/bills/store/${storeId}`)
        .query({ startDate: today, endDate: tomorrow })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/bills/:billId', () => {
    it('should return specific bill details', async () => {
      // Create a bill first
      const billRes = await request(app)
        .post('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          storeId,
          items: [{ productId, quantity: 1, unitPrice: 55 }],
          customerName: 'Test User',
          customerPhone: '+919876543210',
          paymentMode: 'CASH'
        });

      const billId = billRes.body.data.bill.id;

      // Get bill details
      const response = await request(app)
        .get(`/api/bills/${billId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bill.id).toBe(billId);
    });
  });
});
