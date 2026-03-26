# 🏪 KiranaAI — Smart Kirana Store Management & Customer Platform

![KiranaStoreAI Banner](./assets/banner.png)

**KiranaAI** is a comprehensive, production-ready mobile and web application designed to digitize and streamline operations for local Kirana (neighborhood grocery) stores. It serves both store owners and customers: giving owners a powerful digital POS, multi-store management, and AI-driven demand forecasting, while offering customers a seamless app to discover nearby stores, browse categories, and place orders.

---

## 🌟 Key Features

### 👨‍💼 For Store Owners
- **Multi-Store Management:** Manage multiple Kirana shops from a single dashboard.
- **Digital POS System:** Create bills with automatic GST calculations (0%, 5%, 12%, 18%).
- **AI-Powered Forecasting:** Demand predictions for 7/14/30 days powered by Claude AI.
- **Inventory Tracking:** Barcode scanning, low stock alerts, and bulk adjustments.
- **Analytics & Insights:** Revenue graphs, top-selling products, and daily sales tracking.
- **Customer Khata (Credit):** Track customer tabs and pending payments seamlessly.

### 🛍️ For Customers
- **Location-Based Discovery:** Find nearby Kirana shops using GPS and Haversine formula.
- **Easy Shopping Flow:** Browse 12 categories, add to cart, and checkout with multiple payment modes.
- **Order Tracking:** Real-time status updates (placed → packed → out → delivered).
- **Multi-Language:** English and Hindi (Hinglish/Devanagari) support.

---

## 🛠️ Architecture & Tech Stack

- **Mobile App:** React Native (0.74), Expo SDK 51, React Navigation, Zustand.
- **Frontend UI:** React Native Paper, custom atomic components, react-hook-form.
- **Backend API:** Node.js, Express.js, TypeScript.
- **Database:** PostgreSQL 14+ with Prisma ORM.
- **Security & Auth:** Secure JWT with refresh tokens, OTP via MSG91, Helmet, Rate Limiting.
- **AI Integration:** Claude (Anthropic SDK) for demand forecasting.

---

## 🚀 Quick Start & Setup

### 1. Mobile App Setup
```bash
cd KiranaAI
npm install
cp .env.example .env
npm start
```

### 2. Backend Setup
```bash
cd KiranaAI/backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

---

## 📚 Complete Documentation Index

Looking for detailed technical specifications? Check out our dedicated documentation files throughout this repository:

* **[PROJECT.md](PROJECT.md)** — Project overview, architecture, and technology layer breakdown.
* **[FEATURES.md](FEATURES.md)** — Detailed feature lists separated by Store Owners and Customers.
* **[API.md](API.md)** — Comprehensive REST API endpoint references and examples.
* **[DATABASE.md](DATABASE.md)** — PostgreSQL schema, Prisma setup, and Data models.
* **[SETUP.md](SETUP.md)** — Deep-dive installation and environment configuration.
* **[DEVELOPMENT.md](DEVELOPMENT.md)** — Coding standards, component structures, and best practices.
* **[DEPLOYMENT.md](DEPLOYMENT.md)** — Production deployment guides for Heroku, AWS, and Docker.
* **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Common issues, edge cases, and solutions.
* **[KIRANAAI_AGENT.md](KIRANAAI_AGENT.md)** — Complete project specification and build order reference.

---

## 📄 License & Legal

**License**  
Copyright © 2026 Kartikgauttam14/Techzolo Technologies LLP. All Rights Reserved. This project is proprietary and closed-source. You may not copy, distribute, or modify this code without explicit permission.
