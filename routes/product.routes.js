import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addProduct, deleteProduct, editProduct } from "../controllers/product.controller.js";

const router = express();

router.post("/", authMiddleware, addProduct)
router.patch("/:id", authMiddleware, editProduct)
router.delete("/:id", authMiddleware, deleteProduct)

export default router;