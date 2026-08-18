import express from "express";

import {
    getDashboard,

    getAllUsers,
    getUserById,

    getAdminProducts,
    updateProductStock,

    getAllOrders,
    updateOrderStatus,

    getAllReviews,
    deleteReviewByAdmin
} from "../controllers/admin.controller.js";

import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();


// Every admin route requires authentication + admin role
router.use(
    authMiddleware,
    isAdmin
);


// Dashboard
router.get(
    "/dashboard",
    getDashboard
);


// Users
router.get(
    "/users",
    getAllUsers
);

router.get(
    "/users/:userId",
    getUserById
);


// Products
router.get(
    "/products",
    getAdminProducts
);

router.patch(
    "/products/:productId/stock",
    updateProductStock
);


// Orders
router.get(
    "/orders",
    getAllOrders
);

router.patch(
    "/orders/:orderId/status",
    updateOrderStatus
);


// Reviews
router.get(
    "/reviews",
    getAllReviews
);

router.delete(
    "/reviews/:reviewId",
    deleteReviewByAdmin
);


export default router;