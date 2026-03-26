# Store API Documentation

## Overview

The Store API provides comprehensive endpoints for managing kirana stores, including CRUD operations, location-based search using Haversine formula, and store ratings.

## Base URL
```
http://localhost:3000/api/stores
```

## Authentication

All endpoints marked with 🔐 require Bearer token authentication:
```
Authorization: Bearer {JWT_TOKEN}
```

## Endpoints

### 1. Create Store 🔐 (Owner Only)
**POST** `/api/stores`

Creates a new store for a store owner.

**Required Role:** `STORE_OWNER`

**Request Body:**
```json
{
  "name": "Raj's General Store",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "address": "123 Main Street",
  "city": "New Delhi",
  "pincode": "110001",
  "phone": "9876543210",
  "deliveryRadius": 3.0,
  "minOrderValue": 100,
  "gstNumber": "27AABCT1234A1Z0",
  "fssaiNumber": "10013047000123",
  "openTime": "08:00",
  "closeTime": "22:00"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Store created successfully",
  "data": {
    "id": "clx4ks5qj0001klq5k7q7q7q7",
    "ownerId": "owner-id",
    "name": "Raj's General Store",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "address": "123 Main Street",
    "city": "New Delhi",
    "pincode": "110001",
    "phone": "9876543210",
    "deliveryRadius": 3.0,
    "minOrderValue": 100,
    "gstNumber": "27AABCT1234A1Z0",
    "fssaiNumber": "10013047000123",
    "openTime": "08:00",
    "closeTime": "22:00",
    "isOpen": true,
    "isActive": true,
    "isApproved": true,
    "rating": 0,
    "totalRatings": 0,
    "createdAt": "2026-03-21T10:30:00Z",
    "updatedAt": "2026-03-21T10:30:00Z",
    "owner": {
      "id": "owner-id",
      "name": "Rajesh Kumar",
      "phone": "+919876543210"
    }
  }
}
```

**Validation:**
- `name`, `latitude`, `longitude`, `address`, `city`, `pincode` are required
- Latitude: -90 to 90
- Longitude: -180 to 180
- GST number must be unique (if provided)

---

### 2. Get Owner's Stores 🔐 (Owner Only)
**GET** `/api/stores/my`

Retrieves all stores owned by the authenticated user.

**Required Role:** `STORE_OWNER`

**Query Parameters:** (None)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx4ks5qj0001klq5k7q7q7q7",
      "ownerId": "owner-id",
      "name": "Raj's General Store",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "address": "123 Main Street",
      "city": "New Delhi",
      "pincode": "110001",
      "deliveryRadius": 3.0,
      "minOrderValue": 100,
      "openTime": "08:00",
      "closeTime": "22:00",
      "isOpen": true,
      "isActive": true,
      "rating": 4.5,
      "totalRatings": 24,
      "createdAt": "2026-03-21T10:30:00Z",
      "updatedAt": "2026-03-21T10:30:00Z",
      "owner": {
        "id": "owner-id",
        "name": "Rajesh Kumar",
        "phone": "+919876543210"
      },
      "products": [
        {
          "id": "prod-1",
          "name": "Rice 10kg",
          "currentStock": 50
        }
      ],
      "_count": {
        "products": 45,
        "bills": 230,
        "orders": 15
      }
    }
  ],
  "total": 1
}
```

---

### 3. Get Store by ID
**GET** `/api/stores/:id`

Retrieves detailed information about a specific store.

**Parameters:**
- `id` (path): Store ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx4ks5qj0001klq5k7q7q7q7",
    "ownerId": "owner-id",
    "name": "Raj's General Store",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "address": "123 Main Street",
    "city": "New Delhi",
    "pincode": "110001",
    "phone": "9876543210",
    "deliveryRadius": 3.0,
    "minOrderValue": 100,
    "openTime": "08:00",
    "closeTime": "22:00",
    "isOpen": true,
    "isActive": true,
    "isApproved": true,
    "rating": 4.5,
    "totalRatings": 24,
    "createdAt": "2026-03-21T10:30:00Z",
    "updatedAt": "2026-03-21T10:30:00Z",
    "owner": {
      "id": "owner-id",
      "name": "Rajesh Kumar",
      "phone": "+919876543210"
    },
    "products": [
      {
        "id": "prod-1",
        "name": "Rice 10kg",
        "sku": "RICE-10KG",
        "costPrice": 450,
        "sellingPrice": 550,
        "currentStock": 50,
        "category": "Staples",
        "imageUrl": "https://...",
        "gstRate": 5
      }
    ],
    "_count": {
      "products": 45,
      "orders": 15
    }
  }
}
```

**Error: Store not found (404):**
```json
{
  "success": false,
  "error": "Store not found"
}
```

---

### 4. Update Store 🔐 (Owner Only)
**PUT** `/api/stores/:id`

Updates store information. Only the owner can update their store.

**Required Role:** `STORE_OWNER`

**Parameters:**
- `id` (path): Store ID

**Request Body (all optional):**
```json
{
  "name": "Raj's General Store - Updated",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "address": "456 New Street",
  "city": "New Delhi",
  "pincode": "110002",
  "phone": "9876543211",
  "deliveryRadius": 5.0,
  "minOrderValue": 150,
  "openTime": "07:00",
  "closeTime": "23:00",
  "isOpen": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Store updated successfully",
  "data": {
    "id": "clx4ks5qj0001klq5k7q7q7q7",
    "name": "Raj's General Store - Updated",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "address": "456 New Street",
    "city": "New Delhi",
    "pincode": "110002",
    "phone": "9876543211",
    "deliveryRadius": 5.0,
    "minOrderValue": 150,
    "openTime": "07:00",
    "closeTime": "23:00",
    "isOpen": true,
    "updatedAt": "2026-03-21T11:00:00Z"
  }
}
```

**Error: Unauthorized (403):**
```json
{
  "success": false,
  "error": "Unauthorized: You can only update your own stores"
}
```

---

### 5. Delete Store 🔐 (Owner Only - Soft Delete)
**DELETE** `/api/stores/:id`

Deletes a store (soft delete - marks as inactive).

**Required Role:** `STORE_OWNER`

**Parameters:**
- `id` (path): Store ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Store deleted successfully"
}
```

---

### 6. Find Nearby Stores 📍
**GET** `/api/stores/nearby`

Finds all active stores within a specified radius using Haversine formula for distance calculation.

**Query Parameters:**
- `lat` (required): User's latitude
- `lng` (required): User's longitude
- `radius` (optional): Search radius in kilometers (default: 5)

**Example Request:**
```
GET /api/stores/nearby?lat=28.7041&lng=77.1025&radius=5
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx4ks5qj0001klq5k7q7q7q7",
      "name": "Raj's General Store",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "address": "123 Main Street",
      "city": "New Delhi",
      "pincode": "110001",
      "deliveryRadius": 3.0,
      "minOrderValue": 100,
      "isOpen": true,
      "rating": 4.5,
      "totalRatings": 24,
      "owner": {
        "id": "owner-id",
        "name": "Rajesh Kumar",
        "phone": "+919876543210"
      },
      "distance": 0.45,
      "_count": {
        "products": 45,
        "orders": 15
      }
    },
    {
      "id": "clx4ks5qj0002klq5k7q7q7q8",
      "name": "Fresh Provisions",
      "latitude": 28.7045,
      "longitude": 77.1050,
      "address": "456 Market Road",
      "city": "New Delhi",
      "pincode": "110001",
      "deliveryRadius": 4.0,
      "minOrderValue": 200,
      "isOpen": true,
      "rating": 4.8,
      "totalRatings": 42,
      "owner": {
        "id": "owner-id-2",
        "name": "Priya Sharma",
        "phone": "+918765432109"
      },
      "distance": 0.78,
      "_count": {
        "products": 52,
        "orders": 28
      }
    }
  ],
  "total": 2,
  "searchCenter": {
    "latitude": 28.7041,
    "longitude": 77.1025,
    "radiusKm": 5
  }
}
```

**Note:** Results are sorted by distance (closest first).

**Validation Errors:**
- Missing `lat` or `lng`: 400 Bad Request
- Invalid coordinates or radius: 400 Bad Request

---

### 7. Search Stores by City
**GET** `/api/stores/search/city`

Searches for stores in a specific city with optional name filtering.

**Query Parameters:**
- `city` (required): City name
- `query` (optional): Store name search term

**Example Request:**
```
GET /api/stores/search/city?city=New Delhi&query=Raj
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx4ks5qj0001klq5k7q7q7q7",
      "name": "Raj's General Store",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "address": "123 Main Street",
      "city": "New Delhi",
      "pincode": "110001",
      "rating": 4.5,
      "totalRatings": 24,
      "_count": {
        "products": 45,
        "orders": 15
      }
    }
  ],
  "total": 1
}
```

---

### 8. Toggle Store Open/Closed Status 🔐 (Owner Only)
**PUT** `/api/stores/:id/status`

Toggle whether a store is open or closed for orders.

**Required Role:** `STORE_OWNER`

**Parameters:**
- `id` (path): Store ID

**Request Body:**
```json
{
  "isOpen": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Store is now closed",
  "data": {
    "id": "clx4ks5qj0001klq5k7q7q7q7",
    "isOpen": false,
    "updatedAt": "2026-03-21T11:15:00Z"
  }
}
```

---

### 9. Update Store Rating
**PUT** `/api/stores/:id/rating`

Adds a rating to the store and updates average rating.

**Request Body:**
```json
{
  "rating": 4.5
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rating updated successfully",
  "data": {
    "storeId": "clx4ks5qj0001klq5k7q7q7q7",
    "avgRating": 4.52,
    "totalRatings": 25
  }
}
```

**Validation:**
- Rating must be between 0 and 5

---

## Testing Examples

### 1. Create a Store
```bash
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Namaste Store",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "address": "789 Paradise Road",
    "city": "New Delhi",
    "pincode": "110001",
    "phone": "9876543210",
    "deliveryRadius": 2.5,
    "minOrderValue": 50,
    "gstNumber": "27AABCT5678B1Z0",
    "openTime": "06:00",
    "closeTime": "23:00"
  }'
```

### 2. Get Your Stores
```bash
curl -X GET http://localhost:3000/api/stores/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Find Nearby Stores
```bash
curl -X GET "http://localhost:3000/api/stores/nearby?lat=28.7041&lng=77.1025&radius=5"
```

### 4. Search Stores by City
```bash
curl -X GET "http://localhost:3000/api/stores/search/city?city=New Delhi"
```

### 5. Get Store Details
```bash
curl -X GET http://localhost:3000/api/stores/STORE_ID
```

### 6. Update Store
```bash
curl -X PUT http://localhost:3000/api/stores/STORE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "deliveryRadius": 6.0,
    "minOrderValue": 200
  }'
```

### 7. Toggle Store Status
```bash
curl -X PUT http://localhost:3000/api/stores/STORE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"isOpen": false}'
```

### 8. Add Rating
```bash
curl -X PUT http://localhost:3000/api/stores/STORE_ID/rating \
  -H "Content-Type: application/json" \
  -d '{"rating": 4.5}'
```

### 9. Delete Store
```bash
curl -X DELETE http://localhost:3000/api/stores/STORE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing with Postman

### Import Collection
Create a new collection called "KiranaAI Stores API" with the following requests:

#### Create Store (POST)
- **URL:** `{{baseUrl}}/api/stores`
- **Headers:** 
  - `Authorization: Bearer {{accessToken}}`
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Test Store",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "address": "Test Address",
    "city": "New Delhi",
    "pincode": "110001"
  }
  ```

#### Get My Stores (GET)
- **URL:** `{{baseUrl}}/api/stores/my`
- **Headers:** 
  - `Authorization: Bearer {{accessToken}}`

#### Nearby Stores (GET)
- **URL:** `{{baseUrl}}/api/stores/nearby?lat=28.7041&lng=77.1025&radius=5`

#### Get Store (GET)
- **URL:** `{{baseUrl}}/api/stores/{{storeId}}`

#### Update Store (PUT)
- **URL:** `{{baseUrl}}/api/stores/{{storeId}}`
- **Headers:** 
  - `Authorization: Bearer {{accessToken}}`
- **Body:** (partial data to update)

#### Delete Store (DELETE)
- **URL:** `{{baseUrl}}/api/stores/{{storeId}}`
- **Headers:** 
  - `Authorization: Bearer {{accessToken}}`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: name, latitude, longitude, address, city, pincode"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Unauthorized: You can only update your own stores"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Store not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create store"
}
```

---

## Haversine Formula Implementation

The nearby stores search uses the Haversine formula to calculate distance between two geographic points:

```
d = 2 * R * arcsin(sqrt(sin²((lat2-lat1)/2) + cos(lat1)*cos(lat2)*sin²((lon2-lon1)/2)))
```

Where:
- R = 6371 km (Earth's radius)
- Distance is returned in kilometers
- Results sorted by distance (closest first)

---

## Performance Notes

- **Indexes:** Store model includes indexes on:
  - `ownerId` - for owner lookups
  - `city` - for city-based searches
  - `isActive` - for filtering active stores
  - `latitude, longitude` - for geographic queries

- **Limits:**
  - City search: Maximum 20 results
  - Owner stores: All results returned
  - Nearby stores: All results within radius returned

---

## Next Steps

1. Test all endpoints with the curl examples above
2. Verify Haversine distance calculations
3. Proceed to Step 6: Product Controller implementation
4. Implement inventory management features
