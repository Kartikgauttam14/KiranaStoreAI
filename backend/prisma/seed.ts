/**
 * Database Seed Script
 * Populate KiranaAI database with sample data for development/testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KiranaAI database with sample data...\n');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.billItem.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.forecast.deleteMany();
    await prisma.saleLog.deleteMany();
    await prisma.stockAdjustment.deleteMany();
    await prisma.product.deleteMany();
    await prisma.address.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    console.log('Creating test users...');
    const ownerUser = await prisma.user.create({
      data: {
        phone: '9876543210',
        name: 'Raj Kumar',
        role: 'STORE_OWNER',
        language: 'hi',
      },
    });

    const customerUser = await prisma.user.create({
      data: {
        phone: '8765432109',
        name: 'Priya Singh',
        role: 'CUSTOMER',
        language: 'hi',
      },
    });

    // Create stores
    console.log('Creating sample stores...');
    const store1 = await prisma.store.create({
      data: {
        ownerId: ownerUser.id,
        name: 'Raj\'s General Store',
        address: '123 Main Street',
        city: 'Delhi',
        pincode: '110001',
        latitude: 28.6139,
        longitude: 77.2090,
        phone: '9123456789',
        deliveryRadius: 5,
        openTime: '06:00',
        closeTime: '22:00',
        rating: 4.5,
        totalRatings: 342,
      },
    });

    const store2 = await prisma.store.create({
      data: {
        ownerId: ownerUser.id,
        name: 'Fresh Provisions',
        address: '456 Park Avenue',
        city: 'Delhi',
        pincode: '110002',
        latitude: 28.5244,
        longitude: 77.1855,
        phone: '9987654321',
        deliveryRadius: 3,
        openTime: '07:00',
        closeTime: '21:00',
        rating: 4.8,
        totalRatings: 521,
      },
    });

    // Create products
    console.log('Creating sample products...');
    const products = await Promise.all([
      prisma.product.create({
        data: {
          storeId: store1.id,
          sku: 'RICE-001',
          name: 'Basmati Rice 1kg',
          nameHindi: 'बासमती चावल 1किग्रा',
          category: 'Grains',
          unit: 'kg',
          costPrice: 120,
          sellingPrice: 150,
          currentStock: 50,
          reorderLevel: 10,
          reorderQty: 20,
          gstRate: 5,
        },
      }),
      prisma.product.create({
        data: {
          storeId: store1.id,
          sku: 'MILK-001',
          name: 'Full Cream Milk 500ml',
          nameHindi: 'पूर्ण क्रीम दूध 500मिली',
          category: 'Dairy',
          unit: 'ml',
          costPrice: 30,
          sellingPrice: 45,
          currentStock: 120,
          reorderLevel: 50,
          reorderQty: 40,
          gstRate: 5,
        },
      }),
      prisma.product.create({
        data: {
          storeId: store1.id,
          sku: 'OIL-001',
          name: 'Cooking Oil 1L',
          nameHindi: 'खाना पकाने का तेल 1लीटर',
          category: 'Oils',
          unit: 'L',
          costPrice: 150,
          sellingPrice: 180,
          currentStock: 30,
          reorderLevel: 5,
          reorderQty: 15,
          gstRate: 5,
        },
      }),
      prisma.product.create({
        data: {
          storeId: store2.id,
          sku: 'FLOUR-001',
          name: 'Whole Wheat Flour 5kg',
          nameHindi: 'पूरे गेहूं का आटा 5किग्रा',
          category: 'Grains',
          unit: 'kg',
          costPrice: 200,
          sellingPrice: 240,
          currentStock: 25,
          reorderLevel: 5,
          reorderQty: 10,
          gstRate: 5,
        },
      }),
    ]);

    // Create sale logs for forecasting
    console.log('Creating sales history...');
    const today = new Date();
    for (let i = 30; i > 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      for (const product of products.slice(0, 2)) {
        const quantity = Math.floor(Math.random() * 20) + 5;
        await prisma.saleLog.create({
          data: {
            productId: product.id,
            storeId: product.storeId,
            quantity: quantity,
            unitPrice: product.sellingPrice,
            totalPrice: quantity * product.sellingPrice,
            saleDate: date,
          },
        });
      }
    }

    // Create a sample bill
    console.log('Creating sample bill...');
    const bill = await prisma.bill.create({
      data: {
        storeId: store1.id,
        billNumber: 'BILL-001',
        subtotal: 195,
        gstTotal: 9.75,
        grandTotal: 204.75,
        paymentMode: 'CASH',
        items: {
          create: [
            {
              productId: products[0].id,
              productName: products[0].name,
              quantity: 1,
              unit: 'kg',
              unitPrice: 150,
              gstRate: 5,
              gstAmount: 7.5,
              totalPrice: 157.5,
            },
            {
              productId: products[1].id,
              productName: products[1].name,
              quantity: 1,
              unit: 'ml',
              unitPrice: 45,
              gstRate: 5,
              gstAmount: 2.25,
              totalPrice: 47.25,
            },
          ],
        },
      },
      include: { items: true },
    });

    // Create forecasts
    console.log('Creating demand forecasts...');
    for (const product of products.slice(0, 2)) {
      await prisma.forecast.create({
        data: {
          productId: product.id,
          storeId: store1.id,
          forecast7d: 75,
          forecast14d: 145,
          forecast30d: 320,
          confidence: 'high',
          restockNow: false,
          recommendedQty: 40,
          bestReorderDay: 'Monday',
          reasoning: 'Based on historical sales data and seasonal trends',
        },
      });
    }

    // Create customer address
    console.log('Creating customer addresses...');
    const address = await prisma.address.create({
      data: {
        userId: customerUser.id,
        label: 'Home',
        line1: '789 Oak Lane',
        line2: 'Apt 101',
        city: 'Delhi',
        pincode: '110001',
        latitude: 28.6292,
        longitude: 77.2197,
        isDefault: true,
      },
    });

    // Create sample order
    console.log('Creating sample order...');
    const order = await prisma.order.create({
      data: {
        customerId: customerUser.id,
        storeId: store1.id,
        orderNumber: 'ORD-001',
        status: 'PLACED',
        deliveryAddress: '789 Oak Lane, Apt 101, Delhi',
        subtotal: 195,
        deliveryFee: 15,
        grandTotal: 210,
        paymentMode: 'UPI',
        items: {
          create: [
            {
              productId: products[0].id,
              productName: products[0].name,
              quantity: 1,
              unit: 'kg',
              unitPrice: 150,
              totalPrice: 150,
            },
            {
              productId: products[1].id,
              productName: products[1].name,
              quantity: 1,
              unit: 'ml',
              unitPrice: 45,
              totalPrice: 45,
            },
          ],
        },
      },
      include: { items: true },
    });

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Sample Data Created:');
    console.log(`  • 2 Users (1 Owner, 1 Customer)`);
    console.log(`  • 2 Stores`);
    console.log(`  • 4 Products`);
    console.log(`  • 30 days of sales history`);
    console.log(`  • 1 Bill with 2 items`);
    console.log(`  • 2 Demand Forecasts`);
    console.log(`  • 1 Customer Address`);
    console.log(`  • 1 Order with 2 items\n`);
    console.log('Test Credentials:');
    console.log('  Owner:    +919876543210');
    console.log('  Customer: +918765432109\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

