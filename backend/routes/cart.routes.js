import express from "express"
import { addToCart, clearCart, deleteCartProduct, getCart, removeFromCart } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:id", authMiddleware, addToCart)
router.get("/", authMiddleware, getCart)
router.delete("/", authMiddleware, clearCart)
router.delete("/items/:productId", authMiddleware, deleteCartProduct)
router.delete("/item/:productId", authMiddleware, removeFromCart)


export default router;