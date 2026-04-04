#  Finance Data Processing & Access Control Backend

##  Overview

This project is a **production-style backend system** for managing financial data with **role-based access control (RBAC)** and analytics.

It simulates a real-world finance dashboard where:

* **Admins** manage users and system-wide data
* **Analysts** create and analyze financial records
* **Viewers** access read-only insights

The system is designed with **clean architecture, secure authentication, and scalable data handling**, and is fully deployed with a live PostgreSQL database.

---

## 🌐 Live Deployment

* 🔗 **Landing Page (Project Overview)**:
https://amanraj909.github.io/Finance-Data-Processing-and-Access-Control-Backend/

* 🔗 **API Base URL**:
  https://finance-data-processing-and-access-zwda.onrender.com

* 📘 **Swagger API Docs**:
  https://finance-data-processing-and-access-zwda.onrender.com/api-docs

  Quick Start (Evaluator Guide) || Demo Access 

To simplify testing, a seeded admin user is available.

Admin Credentials
Email: [admin@example.com]
Password: Admin123456!

Steps to use:

1. Open Swagger API Docs
2. Use POST /auth/login with above credentials
3. Copy the JWT token
4. Click "Authorize" and paste: Bearer <token>
5. Test all protected endpoints

Note: These credentials are for demonstration purposes only. Do not use real or sensitive data.


---

## ✨ Features

* 🔐 Role-Based Access Control (ADMIN, ANALYST, VIEWER)
* 📊 Financial Records Management (CRUD + soft delete)
* 🔍 Filtering, search, pagination, and sorting
* 📈 Dashboard analytics:

  * Total income & expenses
  * Category-wise breakdown
  * Trends (time-based)
  * Recent activity
* 🔑 JWT-based authentication with protected routes
* 📄 Interactive API documentation using Swagger
* 🧱 Consistent API response structure

---

## 🛠 Tech Stack

| Layer    | Technology     |
| -------- | -------------- |
| Backend  | NestJS         |
| Database | PostgreSQL     |
| ORM      | Prisma         |
| Auth     | JWT (Passport) |
| API Docs | Swagger        |

---

## 🔐 Authentication & Access Control

### Login

```http
POST /auth/login
```

Returns a JWT token:

```
Authorization: Bearer <token>
```

---

### Roles & Permissions

#### 👑 ADMIN

* Manage users (create/update roles/status)
* Full access to all records and dashboard data

#### 📊 ANALYST

* Create and manage their own financial records
* Access dashboard analytics

#### 👁 VIEWER

* Read-only access to dashboard data

> Non-admin users can only access their own records (`createdBy`), while admins have full visibility.

---

## 📡 API Highlights

### Get Records with Filters

```http
GET /records?page=1&limit=10&search=salary&sortBy=date&order=desc
```

### Dashboard Summary

```http
GET /dashboard/summary?startDate=2026-01-01&endDate=2026-12-31
```

### Create User (Admin Only)

```http
POST /users
```

👉 Full API details available in Swagger UI.

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js
* PostgreSQL

---

### Install Dependencies

```bash
npm install
```

---

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
JWT_SECRET=your_secret_key

# Optional
PORT=3000
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin123456!
```

---

### Run Migrations

```bash
npx prisma migrate dev
```

---

### Seed Admin User (Optional)

```bash
npm run seed
```

---

### Start Server

```bash
npm run start:dev
```

---

## 📘 API Documentation

Swagger UI allows you to:

* Authenticate using JWT
* Test all endpoints
* View request/response schemas

👉 Access here:
https://finance-data-processing-and-access-zwda.onrender.com/api-docs

---

## 🧠 Design Decisions

* **Prisma ORM** for type-safe queries and developer productivity
* **PostgreSQL** for relational data modeling and efficient aggregation
* **JWT Authentication** for stateless and scalable security
* **RBAC via Guards** for clean and centralized permission handling
* **Soft Deletes** to prevent permanent data loss
* **Modular Architecture (NestJS)** for maintainability and scalability

---

## ⚠️ Assumptions

* Analysts can only access their own records
* Admins have full system control
* Frontend is intentionally excluded (backend-focused assignment)
* Security features are simplified (no refresh tokens, rate limiting, etc.)

---

## 🔮 Future Improvements

* ✅ Unit & integration testing
* ⚡ Caching for dashboard queries
* 🛡 Rate limiting & audit logging
* 🌐 Frontend dashboard (React/Next.js)

---

## 📝 Note

This system is deployed with a live PostgreSQL database and demonstrates production-style backend architecture.
It is intended for **evaluation and demonstration purposes only** — avoid using sensitive data.

---

## 👨‍💻 Author

**Aman Raj**
Backend Developer (B.Tech CSE) | Amanconnect010@gmail.com | +91 9142324099
