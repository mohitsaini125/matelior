# MATELIOR

> A modern, scalable full-stack e-commerce platform built with the MERN stack.

![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)

---

## 📖 About

MATELIOR is a full-stack e-commerce application being built from scratch with a focus on **clean architecture, scalability, security, and production-ready backend practices**.

Instead of simply creating CRUD APIs, this project aims to implement how real-world e-commerce platforms are designed.

The development journey is being documented publicly through daily updates on LinkedIn.

---

## 🚧 Project Status

**Currently Under Development**

Completed:
- ✅ Project Setup
- ✅ Express Server
- ✅ MongoDB Integration
- ✅ User Authentication
- ✅ Password Hashing (bcrypt)
- ✅ JWT Authentication
- ✅ Role-Based Authorization
- ✅ Product Model
- ✅ Add Product API
- ✅ Update Product API
- ✅ Delete Product API

Currently Working On:
- 🔄 Product Retrieval APIs

Upcoming:
- Categories
- Cart
- Wishlist
- Addresses
- Orders
- Payments
- Reviews
- Admin Dashboard
- Image Uploads
- Search & Filters
- Deployment

---

# 🛠️ Tech Stack

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv

## Frontend (Planned)

- React
- Tailwind CSS

---

# 📁 Project Structure

```
MATELIOR/

│── controllers/
│── middleware/
│── models/
│── routes/
│── .env
│── index.js
│── package.json
│── README.md
```

---

# ✨ Features

## Authentication

- User Registration
- User Login
- Password Encryption
- JWT Authentication
- Protected Routes

## Authorization

- Customer Role
- Admin Role
- Admin-only Product Management

## Products

- Create Product
- Update Product
- Delete Product
- Product Validation
- Product Schema with Metadata

---

# 🔐 Security

- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes
- Role-based authorization
- Environment variables using dotenv

---

# 📌 API Endpoints

## User

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/user/register` | Register User |
| POST | `/user/login` | Login User |

---

## Products

| Method | Endpoint | Access |
|---------|----------|--------|
| POST | `/products` | Admin |
| PATCH | `/products/:id` | Admin |
| DELETE | `/products/:id` | Admin |

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/matelior.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Create .env

```
dbURL=your_mongodb_connection_string
jwtSecret=your_secret_key
```

---

## Start Development Server

```bash
npm run dev
```

---

# 📅 Development Roadmap

- [x] Project Setup
- [x] Authentication
- [x] Authorization
- [x] Product Creation
- [x] Product Update
- [x] Product Delete
- [ ] Product Listing
- [ ] Product Details
- [ ] Search & Filtering
- [ ] Categories
- [ ] Wishlist
- [ ] Cart
- [ ] Address Management
- [ ] Orders
- [ ] Payment Integration
- [ ] Reviews
- [ ] Admin Dashboard
- [ ] Deployment

---

# 🎯 Goal

The objective of MATELIOR is to learn and implement backend engineering practices that resemble production-grade applications while building a complete full-stack e-commerce platform.

Every feature is developed with emphasis on:

- Clean Architecture
- Modular Code
- Security
- Scalability
- Maintainability

---

# 📈 Development Journey

This project is being built publicly, with regular progress updates and technical insights shared on LinkedIn.

---

## ⭐ If you like this project

Consider giving the repository a ⭐ to support the journey.