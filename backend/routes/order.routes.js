import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { createOrder, getOrder, getOrderById, returnOrder } from "../controllers/order.controller.js";

const router = express.Router()

router.post("/", authMiddleware, createOrder)
router.get("/", authMiddleware, getOrder)
router.get("/:orderId", authMiddleware, getOrderById)
router.patch("/:orderId/return", authMiddleware, returnOrder)

export default router;