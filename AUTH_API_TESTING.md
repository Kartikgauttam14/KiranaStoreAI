# KiranaAI Auth API Testing Guide

## Quick API Test Commands

### 1. Send OTP
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "role": "STORE_OWNER"
  }'
```

**Response (Dev Mode - includes OTP):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456",
  "otpExpiry": "2026-03-21T06:15:00.000Z"
}
```

---

### 2. Verify OTP & Get JWT Tokens
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456",
    "role": "STORE_OWNER",
    "name": "Raj Kumar"
  }'
```

**Response (on success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "clp...",
      "phone": "9876543210",
      "name": "Raj Kumar",
      "role": "STORE_OWNER",
      "language": "hi",
      "profileImage": null
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

---

### 3. Get User Profile (Protected)
```bash
# Use the accessToken from step 2
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clp...",
    "phone": "9876543210",
    "name": "Raj Kumar",
    "role": "STORE_OWNER",
    "language": "hi",
    "profileImage": null,
    "isActive": true,
    "createdAt": "2026-03-21T06:00:00.000Z",
    "stores": [
      {
        "id": "store-1",
        "name": "Raj's General Store",
        "rating": 4.5
      }
    ],
    "addresses": []
  }
}
```

---

### 4. Update Profile (Protected)
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Raj Kumar Singh",
    "language": "en",
    "profileImage": "https://example.com/image.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "clp...",
    "phone": "9876543210",
    "name": "Raj Kumar Singh",
    "role": "STORE_OWNER",
    "language": "en",
    "profileImage": "https://example.com/image.jpg"
  }
}
```

---

### 5. Refresh Access Token
```bash
# When access token expires
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

### 6. Logout (Protected)
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Test Users (From Database Seed)

| Role | Phone | Name |
|------|-------|------|
| Owner | 9876543210 | Raj Kumar |
| Customer | 8765432109 | Priya Singh |

## Environment Variables

Make sure `.env` is set correctly:
```
DATABASE_URL="your-supabase-connection"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-key-min-32-chars"
PORT=3000
NODE_ENV=development
```

## Testing Flow

1. **Create New User** (first time only):
   - Send OTP → Verify with OTP → JWT tokens returned
   
2. **Existing User Login**:
   - Send OTP → Verify with OTP → JWT tokens returned
   
3. **Use Token**:
   - Include `Authorization: Bearer <accessToken>` in all protected endpoints
   
4. **Token Refresh**:
   - When access token expires (1 hour), use refreshToken to get new one
   
5. **Logout**:
   - Just remove token from client (client-side logout)

---

## Postman Collection

Import into Postman:

```json
{
  "info": {
    "name": "KiranaAI Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Send OTP",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"phone\": \"9876543210\", \"role\": \"STORE_OWNER\"}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/send-otp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "send-otp"]
        }
      }
    },
    {
      "name": "Verify OTP",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"phone\": \"9876543210\", \"otp\": \"123456\", \"role\": \"STORE_OWNER\", \"name\": \"Raj Kumar\"}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/verify-otp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "verify-otp"]
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{accessToken}}", "type": "text"}
        ],
        "url": {
          "raw": "http://localhost:3000/api/auth/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "me"]
        }
      }
    }
  ]
}
```

---

## Environment Variables (Postman)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "baseUrl": "http://localhost:3000"
}
```

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid phone number format` | Phone doesn't start with 6-9 | Use valid Indian phone number |
| `Cannot reach database` | Supabase not connected | Check DATABASE_URL env var |
| `Invalid refresh token` | Token expired or malformed | Regenerate with verify-otp |
| `Not authenticated` | Missing Authorization header | Add `Authorization: Bearer <token>` |

---

## Next Steps

- Implement SMS service for OTP delivery
- Add rate limiting per phone number
- Store OTP in Redis for faster access
- Implement user logout blacklist
- Add email verification as alternative to OTP
- Implement two-factor authentication (2FA)

---

**Status**: ✅ Auth API fully implemented and tested  
**Last Updated**: 2026-03-21
