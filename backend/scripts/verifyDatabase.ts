#!/usr/bin/env ts-node
/**
 * Database Schema Verification Script
 * Verifies all 11 models were created in Supabase
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 KiranaAI Database Verification\n');

  try {
    // Test connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Database connection: SUCCESS\n');

    // Count records in each table
    const stats = {
      'User': await prisma.user.count(),
      'Store': await prisma.store.count(),
      'Product': await prisma.product.count(),
      'Bill': await prisma.bill.count(),
      'BillItem': await prisma.billItem.count(),
      'SaleLog': await prisma.saleLog.count(),
      'StockAdjustment': await prisma.stockAdjustment.count(),
      'Order': await prisma.order.count(),
      'OrderItem': await prisma.orderItem.count(),
      'Forecast': await prisma.forecast.count(),
      'Address': await prisma.address.count(),
    };

    console.log('📊 Database Models (Record Count):\n');
    Object.entries(stats).forEach(([model, count]) => {
      console.log(`  ${model.padEnd(20)} : ${count} records`);
    });

    const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log(`\n  ${'TOTAL'.padEnd(20)} : ${totalRecords} records\n`);

    console.log('✅ All 11 models verified in database!\n');
    console.log('Database is ready for development.');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
