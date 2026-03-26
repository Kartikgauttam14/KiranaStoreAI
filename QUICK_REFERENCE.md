# ⚡ KiranaAI - Quick Reference Guide

**Fast lookup for common tasks, file locations, and commands.**

---

## 🚀 Quick Commands

```bash
# Start Development
npm start                    # Start mobile app (Expo)
cd backend && npm run dev   # Start backend API (terminal 2)

# Database
cd backend && npx prisma migrate dev --name init   # Create DB
npx prisma studio                                   # View/edit data

# Testing
npm run build               # TypeScript compilation
curl http://localhost:3000/health  # Test API

# Clean & Restart
npm cache clean --force && npm install
rm -rf node_modules && npm install
```

---

## 📍 File Locations

### **Most Used Files**

| Task | File | Location |
|------|------|----------|
| Add authentication | authStore.ts | `/store/` |
| Create API call | api.ts | `/services/` |
| New screen | _layout.tsx | `/app/(role)/` |
| Change theme | colors.ts | `/constants/` |
| DB migration | schema.prisma | `/backend/prisma/` |
| Update environment | .env | Root & /backend/ |

### **Screen Navigation Map**

```
app/_layout.tsx (Root)
├── (auth)/_layout.tsx
│   ├── role-select.tsx (Owner/Customer)
│   ├── phone-input.tsx (+91 Phone)
│   └── otp-verify.tsx (6-digit OTP)
├── (owner)/_layout.tsx (Bottom Tabs)
│   ├── dashboard/ (Summary cards)
│   ├── inventory/ (Coming soon)
│   ├── billing/ (Coming soon)
│   ├── forecast/ (Coming soon)
│   └── stores/ (Coming soon)
└── (customer)/_layout.tsx (Bottom Tabs)
    ├── home/ (Browse stores)
    ├── stores/ (Coming soon)
    ├── cart/ (Coming soon)
    ├── orders/ (Coming soon)
    └── profile/ (Coming soon)
```

---

## 🎯 Common Tasks

### **Add New Screen**

```typescript
// 1. Create file
// app/(owner)/inventory/detail.tsx

import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function InventoryDetailScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>Inventory Detail</Text>
    </SafeAreaView>
  );
}

// 2. Navigation automatically available via file-based routing
// Navigate from: useRouter() → router.push('(owner)/inventory/detail')
```

### **Add New API Service**

```typescript
// services/analyticsService.ts

import { api } from './api';

export const analyticsService = {
  getDashboardSummary: async (storeId: string) => {
    const { data } = await api.get(`/analytics/store/${storeId}/summary`);
    return data;
  },

  getTopProducts: async (storeId: string) => {
    const { data } = await api.get(`/analytics/store/${storeId}/top-products`);
    return data;
  },
};
```

### **Create Zustand Store**

```typescript
// store/analyticsStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnalyticsState {
  revenue: number;
  orders: number;
  setRevenue: (amount: number) => void;
  setOrders: (count: number) => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      revenue: 0,
      orders: 0,
      setRevenue: (amount) => set({ revenue: amount }),
      setOrders: (count) => set({ orders: count }),
    }),
    {
      name: 'analyticsStore',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### **Add Backend Route**

```typescript
// backend/src/routes/analytics.routes.ts

import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/store/:id/summary', authenticate, async (req, res) => {
  try {
    const storeId = req.params.id;
    
    // TODO: Implement controller logic
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### **Update Database Schema**

```prisma
// backend/prisma/schema.prisma

model Analytics {
  id        String   @id @default(cuid())
  storeId   String
  revenue   Float
  orders    Int
  createdAt DateTime @default(now())

  store Store @relation(fields: [storeId], references: [id])

  @@unique([storeId])
  @@index([storeId])
}
```

Then:
```bash
cd backend
npx prisma migrate dev --name add_analytics
```

### **Add Translation String**

```json
// i18n/en.json
{
  "dashboard": {
    "revenue": "Today's Revenue",
    "orders": "Total Orders"
  }
}

// i18n/hi.json
{
  "dashboard": {
    "revenue": "आज की कमाई",
    "orders": "कुल ऑर्डर"
  }
}
```

Usage:
```typescript
import { useTranslation } from 'react-i18next';

export function DashboardScreen() {
  const { t } = useTranslation();
  return <Text>{t('dashboard:revenue')}</Text>
}
```

---

## 🔑 Important Constants

### **Colors**
```typescript
import { Colors } from '@/constants/colors';

Colors.primary          // #FF6B00 (Saffron)
Colors.secondary        // #1A73E8 (Blue)
Colors.success          // #34A853 (Green)
Colors.warning          // #FBBC04 (Yellow)
Colors.danger           // #EA4335 (Red)
Colors.background       // #FAFAFA (Light gray)
Colors.surface          // #FFFFFF (White)
Colors.textPrimary      // #202124 (Dark text)
Colors.textSecondary    // #5F6368 (Light text)
```

### **Categories**
```typescript
import { PRODUCT_CATEGORIES } from '@/constants/categories';

PRODUCT_CATEGORIES     // ['Grains', 'Dairy', 'Spices', ...]
PRODUCT_UNITS          // ['kg', 'L', 'piece', 'gram', 'ml', 'dozen', 'pack']
GST_RATES              // [0, 5, 12, 18]
PAYMENT_MODES          // ['CASH', 'UPI', 'CARD', 'CREDIT']
```

---

## 🔐 Authentication Flow

```
1. User selects role (Owner/Customer)
2. Enters phone number → POST /api/auth/send-otp
3. Backend generates OTP (dev: always 123456)
4. User enters 6 digits → POST /api/auth/verify-otp
5. Backend returns: { accessToken, refreshToken, user, role }
6. Mobile stores in SecureStore → Zustand store
7. authStore.token added to all API requests (Authorization header)
8. Token expires → useAuth hook triggers refresh automatically
```

---

## 📊 Database Schema Quick Reference

```
User
├── id, phone (unique), role (OWNER/CUSTOMER)
├── name, email, createdAt
└── stores[] (if OWNER)

Store (owned by User)
├── id, name, location (lat/lng)
├── deliveryRadius, hours, rating
└── products[], bills[], orders[]

Product (in Store)
├── id, storeId, sku (unique per store)
├── name, category, price
├── gstSlab, stock
└── saleLogs[], forecasts[]

Bill (transaction)
├── id, storeId, billNumber (unique per store)
├── items[] (BillItem[])
├── totalGST, paymentMode, createdAt
└── saleLogs created from this

Order (by Customer)
├── id, storeId, items[] (OrderItem[])
├── status (PLACED → DELIVERED), deliveryAddress
└── pricing, timestamps

Forecast
├── productId, storeId
├── day7, day14, day30 (predicted quantities)
├── confidence, updatedAt
└── Used for auto-ordering
```

---

## 🐛 Debugging Checklist

### **App Won't Start**
- [ ] `npm install` completed (check node_modules size)
- [ ] No port conflicts (3000 for backend, 19000+ for mobile)
- [ ] .env files exist with required variables
- [ ] TypeScript compiles: `npm run build`

### **API Not Working**
- [ ] Backend running: `curl http://localhost:3000/health`
- [ ] Database connected: `psql -d kiranaai`
- [ ] JWT_SECRET set in .env
- [ ] CORS enabled for localhost

### **TypeScript Errors**
- [ ] All imports use `@/` alias (configured in tsconfig.json)
- [ ] No unused variables: `npx tsc --noUnusedLocals`
- [ ] All types imported: Check `/types/` folder

### **Mobile Screen Issues**
- [ ] Navigation path matches file structure exactly
- [ ] All components imported (Button, Card, etc.)
- [ ] Theme colors imported from constants
- [ ] SafeAreaView wraps entire screen

---

## 📚 File Templates

### **New Custom Hook**
```typescript
// hooks/useFetch.ts

import { useState, useEffect } from 'react';

export function useFetch<T>(
  url: string,
  options?: RequestInit
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url, options)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}
```

### **New UI Component**
```typescript
// components/ui/Check.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface CheckProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Check({ label, checked = false, onChange }: CheckProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.checkbox,
          checked && { backgroundColor: Colors.primary },
        ]}
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
});
```

---

## 🔗 API Endpoint Quick Reference

```
POST   /api/auth/send-otp              # Send OTP to phone
POST   /api/auth/verify-otp            # Verify OTP, get JWT
POST   /api/auth/refresh               # Refresh access token
GET    /api/auth/me                    # Get current user

POST   /api/stores                     # Create store (owner)
GET    /api/stores/my                  # Get my stores (owner)
GET    /api/stores/nearby              # Get nearby stores (customer)

POST   /api/products                   # Add product (owner)
GET    /api/products/store/:id         # Get products in store
PUT    /api/products/:id               # Update product
POST   /api/products/:id/adjust-stock  # Adjust inventory

POST   /api/bills                      # Create bill
GET    /api/bills/store/:id            # Get store bills
GET    /api/bills/:id/pdf              # Download as PDF

POST   /api/orders                     # Place order (customer)
GET    /api/orders/my                  # Get my orders (customer)
PUT    /api/orders/:id/status          # Update status (owner)

POST   /api/forecast/product/:id       # Get product forecast
POST   /api/forecast/store/:id         # Get all forecasts

GET    /api/analytics/store/:id/summary      # Dashboard data
GET    /api/analytics/store/:id/top-products # Best sellers
GET    /api/analytics/store/:id/daily-sales  # Revenue chart
```

---

## ⚙️ Environment Variables Reference

### **Mobile (.env)**
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=kirana-ai
EXPO_PUBLIC_ENV=development
```

### **Backend (.env)**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/kiranaai
JWT_SECRET=your-32-char-random-secret
JWT_REFRESH_SECRET=your-32-char-random-secret
ANTHROPIC_API_KEY=sk-ant-...
MSG91_AUTH_KEY=your-msg91-auth-key
MSG91_ROUTE=4
PORT=3000
NODE_ENV=development
```

---

## 📦 Dependency Quick Reference

### **Must-Have Mobile Packages**
- `react-native` - Framework
- `expo` - Build system
- `zustand` - State management
- `axios` - HTTP client
- `react-hook-form` - Form handling
- `zod` - Validation
- `i18next` - Translations
- `expo-location` - GPS
- `expo-barcode-scanner` - Scanning

### **Must-Have Backend Packages**
- `express` - Web framework
- `@prisma/client` - ORM
- `jsonwebtoken` - JWT
- `bcryptjs` - Password hashing
- `helmet` - Security
- `@anthropic-ai/sdk` - Claude API

---

## 🎓 Learning Resources

**In This Project:**
- `README.md` - Full overview
- `SETUP.md` - Installation guide
- `FILE_MANIFEST.md` - All files list
- `KIRANAAI_AGENT.md` - Original specification

**External Resources:**
- [React Native Docs](https://reactnative.dev/docs/)
- [Expo Documentation](https://docs.expo.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Query Docs](https://tanstack.com/query/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)

---

## 🚢 Deployment Quick Steps

### **Backend Deployment (Railway)**
```bash
# 1. Login to railway.app
# 2. Connect GitHub repo
# 3. Add PostgreSQL database
# 4. Set environment variables
# 5. Auto-deploys on git push
```

### **Mobile Deployment (Expo)**
```bash
# Build
eas build --platform ios --auto-submit
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 🆘 Getting Help

| Issue | Solution |
|-------|----------|
| **Port 3000 in use** | `lsof -i :3000; kill -9 <PID>` |
| **Database error** | Check `DATABASE_URL` in .env |
| **Token not working** | Clear cache: `npm cache clean --force` |
| **Screen not rendering** | Check imports, use SafeAreaView |
| **API not responding** | Check backend logs: `npm run dev` |

---

## ✅ Pre-Commit Checklist

Before pushing code:
- [ ] TypeScript compiles: `npm run build`
- [ ] No console.logs or TODO comments (in production code)
- [ ] All imports use relative paths start with `@/`
- [ ] Tests pass (if any)
- [ ] Code formatted with Prettier

```bash
# Format code
npx prettier --write .

# Check types
npx tsc --noEmit

# Run build
npm run build
```

---

## 📞 Quick Contact

**Questions?** Check:
1. This file (most things are here)
2. README.md (overview & architecture)
3. SETUP.md (installation issues)
4. FILE_MANIFEST.md (what files do)
5. KIRANAAI_AGENT.md (original spec)

**Don't find it?** Create an issue on GitHub with:
- What you were trying to do
- What happened
- Error message (if any)
- Your environment (Node version, OS, etc.)

---

**Last Updated:** 2025-01-15  
**For Version:** React Native + Expo SDK 51, Express.js with Prisma  
**Status:** Production-Ready Foundation (APIs pending)
