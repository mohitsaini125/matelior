import express from "express"
import { authMiddleware, isAdminMiddleware } from "../middleware/auth.middleware.js";
import { addProduct, deleteProduct, editProduct, getProductById, getProducts } from "../controllers/product.controller.js";

const router = express();

router.post("/", authMiddleware, isAdminMiddleware, addProduct)
router.patch("/:id", authMiddleware, isAdminMiddleware, editProduct)
router.delete("/:id", authMiddleware, isAdminMiddleware,deleteProduct)
router.get("/", getProducts)
router.get("/:id", getProductById)

export default router;