import express from "express";
import {
    addToCart,
    clearCart,
    deleteCartProduct,
    getCart,
    removeFromCart,
    updateCartQuantity,
} from "../controllers/cart.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, addToCart);
router.post("/:id", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.patch("/:itemId", authMiddleware, updateCartQuantity);
router.delete("/:itemId", authMiddleware, removeFromCart);
router.delete("/", authMiddleware, clearCart);

// Legacy routes fallback
router.delete("/items/:productId", authMiddleware, deleteCartProduct);
router.delete("/item/:productId", authMiddleware, removeFromCart);

export default router;