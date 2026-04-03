FINANCE DATA PROCESSING BACKEND


OVERVIEW

This project is a backend system for managing financial records with role-based access control. It models a simple internal finance dashboard where different types of users interact with data based on their permissions.

Admins manage users, analysts work with financial records, and viewers have read-only access to dashboard data. Authentication is handled using JWT, and access control is enforced at the API level.


FEATURES

- Role-based access control (ADMIN, ANALYST, VIEWER)
- Financial records management (create, read, update, soft delete)
- Filtering, pagination, search, and sorting for records
- Dashboard analytics (summary, category breakdown, trends, recent activity)
- JWT-based authentication with protected routes
- Swagger API documentation at /api-docs
- Consistent API responses using a standard response structure


TECH STACK

| Layer    | Technology     |
| -------- | -------------- |
| Backend  | NestJS         |
| Database | PostgreSQL     |
| ORM      | Prisma         |
| Auth     | JWT (Passport) |
| Docs     | Swagger        |


API OVERVIEW


Authentication

- POST /auth/login — returns a JWT token used to access protected endpoints.

All protected routes require:

```
Authorization: Bearer <token>
```


Roles and access

ADMIN

- Manage users (create, update role/status)
- Full access to all records and dashboard data

ANALYST

- Create and view their own financial records
- Access dashboard analytics

VIEWER

- Read-only access to dashboard endpoints

Non-admin users only access their own records (createdBy), while admins can access all data.


Example requests

- Get records with filters:

  GET /records?page=1&limit=10&search=salary&sortBy=date&order=desc

- Dashboard summary:

  GET /dashboard/summary?startDate=2026-01-01&endDate=2026-12-31

- Create user (admin only):

  POST /users

Full API details are available in Swagger.


SETUP


Prerequisites

- Node.js
- PostgreSQL


Installation

```bash
npm install
```

Environment variables

Create a .env file and configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
JWT_SECRET=your_secret_key
```

Optional:

```env
PORT=3000
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin123456!
```

Run migrations

```bash
npx prisma migrate dev
```

Seed admin user (optional)

```bash
npm run seed
```

Start server

```bash
npm run start:dev
```


API DOCUMENTATION

Swagger UI:

https://finance-data-processing-and-access-zwda.onrender.com/api-docs

You can authenticate and test all endpoints directly from the browser.


DESIGN DECISIONS

- Prisma was used for type-safe queries and faster development
- PostgreSQL fits the relational nature of users and financial records
- JWT authentication keeps the system stateless and simple
- RBAC is enforced using guards at the backend level
- Soft delete is used for records to avoid permanent data loss
- A response wrapper ensures consistent API outputs


ASSUMPTIONS

- Analysts can create and view their own records
- Only admins can manage users and modify all records
- This project focuses on backend logic; frontend is intentionally not included
- Security is simplified for demonstration (no refresh tokens, rate limiting, etc.)


FUTURE IMPROVEMENTS

- Add unit and integration tests
- Introduce caching for dashboard queries
- Implement rate limiting and audit logging
- Build a frontend client for visualization
