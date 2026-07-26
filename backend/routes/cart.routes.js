import express from "express"
import { addToCart, clearCart, deleteCartProduct, getCart } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:id", authMiddleware, addToCart)
router.get("/", getCart)
router.delete("/", clearCart)
router.delete("/:productId", deleteCartProduct)


export default router;