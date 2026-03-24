# Product API Documentation

## Overview

The Product API provides comprehensive inventory management features including CRUD operations, stock tracking, bulk uploads, and inventory valuation.

## Base URL
```
http://localhost:3000/api/products
```

## Authentication

All endpoints marked with 🔐 require Bearer token authentication (owner only):
```
Authorization: Bearer {JWT_TOKEN}
```

## Endpoints

### 1. Add Product 🔐 (Owner Only)
**POST** `/api/products`

Adds a new product to a store.

**Request Body:**
```json
{
  "storeId": "store-id",
  "name": "Basmati Rice 10kg",
  "nameHindi": "बासमती चावल 10kg",
  "category": "Staples",
  "sku": "RICE-BAS-10",
  "barcode": "8901234567890",
  "unit": "kg",
  "costPrice": 450,
  "sellingPrice": 550,
  "currentStock": 100,
  "reorderLevel": 20,
  "reorderQty": 100,
  "gstRate": 5,
  "hsnCode": "1006",
  "imageUrl": "https://...",
  "supplierName": "Rice Suppliers Ltd",
  "supplierPhone": "9876543210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product added successfully",
  "data": {
    "id": "prod-1",
    "storeId": "store-id",
    "name": "Basmati Rice 10kg",
    "category": "Staples",
    "sku": "RICE-BAS-10",
    "costPrice": 450,
    "sellingPrice": 550,
    "currentStock": 100,
    "reorderLevel": 20,
    "reorderQty": 100,
    "gstRate": 5,
    "isActive": true,
    "createdAt": "2026-03-21T10:30:00Z",
    "updatedAt": "2026-03-21T10:30:00Z"
  }
}
```

**Validation:**
- All required fields must be provided
- Selling price must be > cost price
- No negative prices or stock
- SKU must be unique per store

---

### 2. Get Products by Store
**GET** `/api/products/store/:storeId`

Retrieves all products for a store with filters and enriched data.

**Query Parameters:**
- `category` (optional): Filter by product category
- `lowStock` (optional): "true" to show only low stock items
- `search` (optional): Search by name or SKU

**Example Request:**
```
GET /api/products/store/store-id?category=Staples&lowStock=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-1",
      "storeId": "store-id",
      "name": "Basmati Rice 10kg",
      "category": "Staples",
      "sku": "RICE-BAS-10",
      "costPrice": 450,
      "sellingPrice": 550,
      "currentStock": 15,
      "reorderLevel": 20,
      "gstRate": 5,
      "margin": 100,
      "marginPercent": "22.22",
      "stockStatus": "LOW"
    }
  ],
  "total": 1
}
```

**Stock Status Values:**
- `LOW`: Current stock ≤ reorder level
- `MEDIUM`: Current stock ≤ reorder level × 1.5
- `HEALTHY`: Current stock > threshold

---

### 3. Get Product Details
**GET** `/api/products/:id`

Retrieves detailed information about a specific product.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "prod-1",
    "name": "Basmati Rice 10kg",
    "category": "Staples",
    "sku": "RICE-BAS-10",
    "costPrice": 450,
    "sellingPrice": 550,
    "currentStock": 100,
    "margin": 100,
    "marginPercent": "22.22",
    "stockStatus": "HEALTHY",
    "store": {
      "id": "store-id",
      "name": "Raj's Store",
      "city": "New Delhi"
    },
    "_count": {
      "billItems": 45,
      "orderItems": 12,
      "stockAdjustments": 8
    }
  }
}
```

---

### 4. Update Product 🔐 (Owner Only)
**PUT** `/api/products/:id`

Updates product information. All fields optional.

**Request Body:**
```json
{
  "name": "Premium Basmati Rice 10kg",
  "sellingPrice": 600,
  "reorderLevel": 25,
  "imageUrl": "https://..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "prod-1",
    "name": "Premium Basmati Rice 10kg",
    "sellingPrice": 600,
    "updatedAt": "2026-03-21T11:00:00Z"
  }
}
```

---

### 5. Delete Product 🔐 (Owner Only - Soft Delete)
**DELETE** `/api/products/:id`

Deletes a product (marks as inactive).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 6. Adjust Stock 🔐 (Owner Only)
**POST** `/api/products/:id/adjust-stock`

Adjusts product stock and records the adjustment.

**Request Body:**
```json
{
  "quantity": 50,
  "reason": "PURCHASE"
}
```

**Valid Reasons:**
- `PURCHASE`: New stock purchase
- `DAMAGE`: Damaged items
- `THEFT`: Theft/Loss
- `EXPIRY`: Expired items
- `CORRECTION`: Inventory correction
- `RETURN`: Customer return

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stock adjusted successfully",
  "data": {
    "product": {
      "id": "prod-1",
      "currentStock": 150,
      "updatedAt": "2026-03-21T11:15:00Z"
    },
    "adjustment": {
      "id": "adj-1",
      "productId": "prod-1",
      "quantity": 50,
      "reason": "PURCHASE",
      "type": "INBOUND",
      "notes": "Previous: 100, New: 150",
      "createdAt": "2026-03-21T11:15:00Z"
    }
  }
}
```

---

### 7. Get Low Stock Products 🔐 (Owner Only)
**GET** `/api/products/low-stock/:storeId`

Returns all products below reorder level for a store.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-1",
      "name": "Basmati Rice 10kg",
      "currentStock": 15,
      "reorderLevel": 20,
      "reorderQty": 100,
      "shortfall": 85,
      "margin": 100
    }
  ],
  "total": 1
}
```

---

### 8. Get Categories 🔐
**GET** `/api/products/category/:storeId`

Lists all product categories in a store.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Staples",
      "productCount": 12
    },
    {
      "name": "Dairy",
      "productCount": 8
    },
    {
      "name": "Oils",
      "productCount": 5
    }
  ],
  "total": 3
}
```

---

### 9. Get Inventory Value 🔐 (Owner Only)
**GET** `/api/products/inventory-value/:storeId`

Calculates total inventory value at cost and selling prices.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalProducts": 45,
    "totalCostValue": 48750.50,
    "totalSellingValue": 58250.75,
    "totalMargin": 9500.25,
    "marginPercent": "19.48"
  }
}
```

---

### 10. Bulk Upload Products 🔐 (Owner Only)
**POST** `/api/products/bulk-upload/:storeId`

Efficiently uploads multiple products at once.

**Request Body:**
```json
{
  "products": [
    {
      "name": "Basmati Rice 10kg",
      "category": "Staples",
      "sku": "RICE-BAS-10",
      "unit": "kg",
      "costPrice": 450,
      "sellingPrice": 550,
      "currentStock": 100,
      "reorderLevel": 20,
      "reorderQty": 100,
      "gstRate": 5
    },
    {
      "name": "Full Cream Milk 1L",
      "category": "Dairy",
      "sku": "MILK-CREAM-1",
      "unit": "litre",
      "costPrice": 40,
      "sellingPrice": 55,
      "currentStock": 200,
      "reorderLevel": 50,
      "reorderQty": 150,
      "gstRate": 5
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk upload completed. 2 products created, 0 failed.",
  "data": {
    "successful": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

## Testing Examples

### 1. Add Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "storeId": "STORE_ID",
    "name": "Basmati Rice 10kg",
    "category": "Staples",
    "sku": "RICE-BAS-10",
    "unit": "kg",
    "costPrice": 450,
    "sellingPrice": 550,
    "currentStock": 100,
    "gstRate": 5
  }'
```

### 2. Get Products by Store
```bash
curl -X GET "http://localhost:3000/api/products/store/STORE_ID?category=Staples" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Product Details
```bash
curl -X GET http://localhost:3000/api/products/PRODUCT_ID
```

### 4. Update Product
```bash
curl -X PUT http://localhost:3000/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sellingPrice": 600,
    "reorderLevel": 25
  }'
```

### 5. Adjust Stock
```bash
curl -X POST http://localhost:3000/api/products/PRODUCT_ID/adjust-stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"quantity": 50, "reason": "PURCHASE"}'
```

### 6. Get Low Stock Products
```bash
curl -X GET http://localhost:3000/api/products/low-stock/STORE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Get Inventory Value
```bash
curl -X GET http://localhost:3000/api/products/inventory-value/STORE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Bulk Upload Products
```bash
curl -X POST http://localhost:3000/api/products/bulk-upload/STORE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "products": [
      {
        "name": "Rice",
        "category": "Staples",
        "sku": "RICE-1",
        "unit": "kg",
        "costPrice": 450,
        "sellingPrice": 550,
        "currentStock": 100
      }
    ]
  }'
```

### 9. Delete Product
```bash
curl -X DELETE http://localhost:3000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: storeId, name, category, sku, unit, costPrice, sellingPrice, currentStock"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Unauthorized: You can only add products to your own stores"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 409 Conflict (Duplicate SKU)
```json
{
  "success": false,
  "error": "Product with this SKU already exists in this store"
}
```

---

## Data Calculations

### Margin Calculation
```
Margin = Selling Price - Cost Price
Margin % = (Margin / Cost Price) × 100
```

### Inventory Value
```
Cost Value = Stock × Cost Price
Selling Value = Stock × Selling Price
Total Margin = Selling Value - Cost Value
```

### Stock Status
```
LOW: Current Stock ≤ Reorder Level
MEDIUM: Current Stock ≤ Reorder Level × 1.5
HEALTHY: Current Stock > (Reorder Level × 1.5)
```

---

## Next Steps

1. Test all endpoints using curl examples
2. Verify bulk upload functionality
3. Test stock adjustments and inventory tracking
4. Proceed to Step 7: Bill Controller (POS operations)
