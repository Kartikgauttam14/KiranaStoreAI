# Bill API Documentation (POS Operations)

## Overview

The Bill API handles Point-of-Sale (POS) transactions, including bill creation, stock updates, GST calculations, payment processing, and sales analytics.

## Base URL
```
http://localhost:3000/api/bills
```

## Authentication

All endpoints require Bearer token authentication (owner only):
```
Authorization: Bearer {JWT_TOKEN}
```

## Endpoints

### 1. Create Bill 🔐 (Owner Only)
**POST** `/api/bills`

Creates a new POS bill with items, automatically:
- Validates stock availability
- Calculates GST per item
- Updates product stock
- Records sales logs for forecasting

**Request Body:**
```json
{
  "storeId": "store-id",
  "items": [
    {
      "productId": "prod-1",
      "quantity": 2,
      "unitPrice": 550
    },
    {
      "productId": "prod-2",
      "quantity": 5,
      "unitPrice": 40
    }
  ],
  "customerName": "Rajesh Kumar",
  "customerPhone": "9876543210",
  "discount": 100,
  "paymentMode": "CASH"
}
```

**Payment Modes:**
- `CASH`: Marked as paid immediately
- `UPI`: Marked as paid immediately
- `CARD`: Marked as paid immediately
- `CREDIT`: Marked as unpaid (can be updated later)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Bill created successfully",
  "data": {
    "id": "bill-1",
    "storeId": "store-id",
    "billNumber": "BILL-1711007400000-001",
    "customerName": "Rajesh Kumar",
    "customerPhone": "9876543210",
    "subtotal": 1120,
    "gstTotal": 163.20,
    "discount": 100,
    "grandTotal": 1183.20,
    "paymentMode": "CASH",
    "isPaid": true,
    "createdAt": "2026-03-21T10:30:00Z",
    "items": [
      {
        "id": "item-1",
        "productName": "Basmati Rice 10kg",
        "quantity": 2,
        "unit": "kg",
        "unitPrice": 550,
        "gstRate": 5,
        "gstAmount": 55,
        "totalPrice": 1155
      }
    ],
    "store": {
      "name": "Raj's General Store",
      "address": "123 Main Street",
      "city": "New Delhi",
      "phone": "9876543210",
      "gstNumber": "27AABCT1234A1Z0"
    }
  }
}
```

**Automatic Operations:**
- Stock reduced by purchased quantity
- SaleLog entries created for demand forecasting
- Bill number automatically generated

**Validations:**
- All items must belong to the store
- Sufficient stock required for all items
- Discount cannot exceed bill total

---

### 2. Get Bills by Store 🔐 (Owner Only)
**GET** `/api/bills/store/:storeId`

Retrieves paginated list of bills with filtering options.

**Query Parameters:**
- `paymentMode` (optional): Filter by CASH, UPI, CARD, CREDIT
- `startDate` (optional): ISO date format (YYYY-MM-DD)
- `endDate` (optional): ISO date format (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)

**Example Request:**
```
GET /api/bills/store/store-id?startDate=2026-03-01&endDate=2026-03-31&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "bill-1",
      "billNumber": "BILL-1711007400000-001",
      "customerName": "Rajesh Kumar",
      "subtotal": 1120,
      "gstTotal": 163.20,
      "discount": 100,
      "grandTotal": 1183.20,
      "paymentMode": "CASH",
      "isPaid": true,
      "createdAt": "2026-03-21T10:30:00Z",
      "items": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 3. Get Bill Details 🔐 (Owner Only)
**GET** `/api/bills/:id`

Retrieves complete bill information with all items and product details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "bill-1",
    "billNumber": "BILL-1711007400000-001",
    "storeId": "store-id",
    "customerName": "Rajesh Kumar",
    "customerPhone": "9876543210",
    "subtotal": 1120,
    "gstTotal": 163.20,
    "discount": 100,
    "grandTotal": 1183.20,
    "paymentMode": "CASH",
    "isPaid": true,
    "createdAt": "2026-03-21T10:30:00Z",
    "items": [
      {
        "id": "item-1",
        "productId": "prod-1",
        "productName": "Basmati Rice 10kg",
        "quantity": 2,
        "unit": "kg",
        "unitPrice": 550,
        "gstRate": 5,
        "gstAmount": 55,
        "totalPrice": 1155,
        "product": {
          "sku": "RICE-BAS-10",
          "hsnCode": "1006"
        }
      }
    ],
    "store": {
      "name": "Raj's General Store",
      "address": "123 Main Street",
      "city": "New Delhi",
      "pincode": "110001",
      "phone": "9876543210",
      "gstNumber": "27AABCT1234A1Z0",
      "fssaiNumber": "10013047000123"
    }
  }
}
```

---

### 4. Get Sales Summary 🔐 (Owner Only)
**GET** `/api/bills/store/:storeId/summary`

Analytics dashboard with revenue, GST, and payment breakdown.

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30)

**Example Request:**
```
GET /api/bills/store/store-id/summary?days=7
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "Last 30 days",
    "totalTransactions": 156,
    "totalRevenue": 45230.75,
    "totalGst": 7850.25,
    "totalDiscount": 1200,
    "averageTransactionValue": 290.07,
    "paymentModeBreakdown": {
      "CASH": 25000,
      "UPI": 15000,
      "CARD": 5000,
      "CREDIT": 230.75
    },
    "dailyRevenue": {
      "2026-03-21": 1850.50,
      "2026-03-20": 2100.25,
      "2026-03-19": 1950.00
    }
  }
}
```

---

### 5. Get Today's Sales 🔐 (Owner Only)
**GET** `/api/bills/store/:storeId/daily`

Quick view of today's sales performance.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-21",
    "totalTransactions": 12,
    "totalRevenue": 3450.50,
    "totalGst": 620.25,
    "bills": [
      {
        "id": "bill-1",
        "billNumber": "BILL-1711007400000-001",
        "customerName": "Customer 1",
        "grandTotal": 1183.20,
        "paymentMode": "CASH",
        "createdAt": "2026-03-21T10:30:00Z"
      }
    ]
  }
}
```

---

### 6. Mark Bill as Paid 🔐 (Owner Only)
**POST** `/api/bills/:id/mark-paid`

Updates credit bills to paid status.

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bill marked as paid",
  "data": {
    "id": "bill-1",
    "billNumber": "BILL-1711007400000-001",
    "isPaid": true
  }
}
```

---

## Testing Examples

### 1. Create a Bill
```bash
curl -X POST http://localhost:3000/api/bills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "storeId": "STORE_ID",
    "items": [
      {
        "productId": "PRODUCT_ID_1",
        "quantity": 2,
        "unitPrice": 550
      },
      {
        "productId": "PRODUCT_ID_2",
        "quantity": 5
      }
    ],
    "customerName": "John Doe",
    "paymentMode": "CASH",
    "discount": 50
  }'
```

### 2. Get Store Bills
```bash
curl -X GET "http://localhost:3000/api/bills/store/STORE_ID?startDate=2026-03-01&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Bill Details
```bash
curl -X GET http://localhost:3000/api/bills/BILL_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Sales Summary
```bash
curl -X GET "http://localhost:3000/api/bills/store/STORE_ID/summary?days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Today's Sales
```bash
curl -X GET http://localhost:3000/api/bills/store/STORE_ID/daily \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Mark Bill as Paid
```bash
curl -X POST http://localhost:3000/api/bills/BILL_ID/mark-paid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Bill Number Format

Bills are numbered automatically as: `BILL-{TIMESTAMP}-{SEQUENCE}`

Example: `BILL-1711007400000-001`

This ensures:
- Unique bill numbers
- Chronological ordering
- Human-readable format

---

## GST Calculation

GST is calculated per item:
```
Item Subtotal = Quantity × Unit Price
GST Amount = (Item Subtotal × GST Rate) / 100
Item Total = Item Subtotal + GST Amount
```

**Bill Total:**
```
Bill Subtotal = Sum of all item subtotals
Bill GST = Sum of all item GST amounts
Grand Total = (Bill Subtotal + Bill GST) - Discount
```

---

## Payment Modes

| Mode | Status | Use Case |
|------|--------|----------|
| CASH | Paid | Cash received in store |
| UPI | Paid | Digital payment immediately confirmed |
| CARD | Paid | Card payment immediately confirmed |
| CREDIT | Unpaid | Customer bill/credit account |

---

## Data Actions on Bill Creation

When a bill is created:

1. **Stock Update** - Product stock reduced by purchased quantity
2. **SaleLog Creation** - Entry added for demand forecasting
3. **GST Calculation** - Per-item GST computed and recorded
4. **Bill Number** - Unique sequential number assigned
5. **Payment Status** - Set based on payment mode

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: storeId, items (non-empty array)"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Unauthorized: You can only create bills for your own stores"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Product prod-1 not found"
}
```

### 409 Conflict (Insufficient Stock)
```json
{
  "success": false,
  "error": "Insufficient stock for Basmati Rice 10kg. Available: 5"
}
```

---

## Performance Optimization

- **Bill Number**: Uses timestamp + sequence for O(1) generation
- **Stock Updates**: Transactional to prevent race conditions
- **Pagination**: Default 20 bills per page to avoid memory issues
- **Indexes**: Created on storeId, billNumber, createdAt, paymentMode

---

## Next Steps

1. Test bill creation and stock updates
2. Verify GST calculations
3. Test sales analytics endpoints
4. Proceed to Step 8: Order Controller (customer orders)
