````markdown
# MATELIOR

> A modern, scalable full-stack e-commerce platform built with the MERN stack.

![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-green)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)

---

## 📖 About

**MATELIOR** is a full-stack e-commerce platform built from scratch with the goal of implementing real-world backend engineering practices.

This project focuses on writing clean, modular, secure, and scalable code while following industry-standard architecture. Instead of creating a basic CRUD application, MATELIOR is designed to simulate how production-grade e-commerce systems are structured.

The complete development journey is being documented through daily LinkedIn posts, where I share progress updates, architectural decisions, and key learnings.

---

## 🚧 Project Status

**Status:** 🟡 In Development

### ✅ Completed

#### Authentication & Authorization
- User Registration
- User Login
- Password Hashing (bcrypt)
- JWT Authentication
- Authentication Middleware
- Role-Based Authorization (Admin & Customer)

#### Product Module
- Create Product
- Update Product
- Delete Product
- Get All Products
- Get Product by ID
- Search Products
- Filter Products
- Sort Products

#### Category Module
- Create Category
- Update Category
- Delete Category
- Get All Categories
- Get Category by ID
- Search Categories
- Filter Categories
- Sort Categories

#### Database
- MongoDB Integration
- Mongoose ODM
- Product ↔ Category Relationship using ObjectId References
- Mongoose Populate

#### Utilities
- Reusable Success Response Utility
- Reusable Failure Response Utility
- Reusable Error Response Utility

---

## 🚀 Upcoming Features

- Pagination
- Shopping Cart
- Wishlist
- Address Management
- Order Management
- Payment Integration
- Reviews & Ratings
- Product Inventory Management
- Coupon System
- Image Upload
- Admin Dashboard
- Deployment

---

# 🛠 Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv

### Frontend *(Planned)*

- React Native

---

# 📁 Project Structure

```text
MATELIOR
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
│   └── response.js
│
├── .env
├── index.js
├── package.json
└── README.md
```

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- Secure Password Hashing
- JWT-based Authentication
- Protected Routes

---

## 👤 Authorization

- Admin Role
- Customer Role
- Middleware-based Access Control
- Admin-only Product & Category Management

---

## 📦 Product Management

- Add Product
- Update Product
- Delete Product
- Retrieve All Products
- Retrieve Product by ID
- Search Products
- Filter Products
- Sort Products
- Product Validation
- Category Population

---

## 🗂 Category Management

- Add Category
- Update Category
- Delete Category
- Retrieve All Categories
- Retrieve Category by ID
- Search Categories
- Filter Categories
- Sort Categories

---

## ⚙ Utilities

To keep controllers clean and maintain consistent API responses throughout the application:

- `successResponse()`
- `failedResponse()`
- `errorResponse()`

---

# 🔒 Security

- Password Hashing with bcrypt
- JWT Authentication
- Protected API Routes
- Role-Based Authorization
- Environment Variables using dotenv

---

# 🗄 Database Models

## User

| Field | Type |
|------|------|
| Name | String |
| Email | String |
| Password | String |
| Role | Admin / Customer |

---

## Product

| Field | Type |
|------|------|
| Name | String |
| Description | String |
| Category | ObjectId (Category) |
| Price | Number |
| Discount Percentage | Number |
| Stock | Number |
| SKU | String |
| Images | Array |
| Material | String |
| Colors | Array |
| Weight | Number |
| Tags | Array |

---

## Category

| Field | Type |
|------|------|
| Name | String |
| Description | String |
| Image | String |
| Status | Active / Hidden |

---

# 📡 API Endpoints

## User Routes

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/user/register` | Public |
| POST | `/user/login` | Public |

---

## Product Routes

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/product` | Admin |
| PATCH | `/product/:id` | Admin |
| DELETE | `/product/:id` | Admin |
| GET | `/product` | Public |
| GET | `/product/:id` | Public |

---

## Category Routes

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/category` | Admin |
| PATCH | `/category/:id` | Admin |
| DELETE | `/category/:id` | Admin |
| GET | `/category` | Public |
| GET | `/category/:id` | Public |

---

# 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/matelior.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
dbURL=YOUR_MONGODB_CONNECTION_STRING
jwtSecret=YOUR_JWT_SECRET
```

### 4. Start the Development Server

```bash
npm start
```

---

# 🗺 Development Roadmap

## ✅ Completed

- [x] Project Setup
- [x] MongoDB Connection
- [x] Authentication
- [x] Authorization
- [x] Product CRUD
- [x] Product Search
- [x] Product Filtering
- [x] Product Sorting
- [x] Category CRUD
- [x] Category Search
- [x] Category Filtering
- [x] Category Sorting
- [x] Product–Category Relationship
- [x] Reusable Response Utilities

## 🚧 In Progress

- [ ] Pagination

## 📅 Planned

- [ ] Shopping Cart
- [ ] Wishlist
- [ ] Address Management
- [ ] Order Management
- [ ] Payment Integration
- [ ] Reviews & Ratings
- [ ] Inventory Management
- [ ] Coupons
- [ ] Image Upload
- [ ] Admin Dashboard
- [ ] Deployment

---

# 🎯 Goals

MATELIOR is being built to gain hands-on experience in designing and developing production-ready backend systems.

The project emphasizes:

- Clean Architecture
- Modular Code Organization
- REST API Design
- Authentication & Authorization
- MongoDB Data Modeling
- Scalable Project Structure
- Secure Development Practices
- Maintainable Code

---

# 📈 Build in Public

Every stage of MATELIOR's development is shared through daily LinkedIn posts, covering:

- Features implemented
- Backend architecture
- Engineering decisions
- Challenges encountered
- Lessons learned

This repository grows alongside that journey.

---

## ⭐ Support

If you find this project useful or interesting, consider giving it a **⭐ Star**. Your support is greatly appreciated!
````
