import express from "express"
import { authMiddleware, isAdminMiddleware } from "../middleware/auth.middleware.js"
import {
    cancelOrder,
    createOrder,
    getOrder,
    getOrderById,
    returnOrder,
    updateOrderStatus
} from "../controllers/order.controller.js";

const router = express.Router()

//User APIs
router.post("/", authMiddleware, createOrder)
router.get("/", authMiddleware, getOrder)
router.get("/:orderId", authMiddleware, getOrderById)
router.patch("/:orderId/return", authMiddleware, returnOrder)
router.patch("/:orderId/cancel", authMiddleware, cancelOrder)

//Admin APIs
router.patch("/admin/:orderId/status",
    authMiddleware,
    isAdminMiddleware,
    updateOrderStatus
)

export default router;