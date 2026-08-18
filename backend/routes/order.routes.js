import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";
import {
    cancelOrder,
    createOrder,
    getAllOrdersAdmin,
    getOrder,
    getOrderById,
    returnOrder,
    updateOrderStatus,
    updateRefundStatus,
    updateReturnStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// Admin APIs (placed before /:orderId to prevent parameter capture)
router.get("/admin", authMiddleware, isAdmin, getAllOrdersAdmin);
router.patch(
    "/admin/:orderId/status",
    authMiddleware,
    isAdmin,
    updateOrderStatus
);
router.patch(
    "/admin/:orderId/return",
    authMiddleware,
    isAdmin,
    updateReturnStatus
);
router.patch(
    "/admin/:orderId/refund",
    authMiddleware,
    isAdmin,
    updateRefundStatus
);

// Customer APIs
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrder);
router.get("/:orderId", authMiddleware, getOrderById);
router.patch("/:orderId/return", authMiddleware, returnOrder);
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);

export default router;