import express from "express"
import { authMiddleware, isAdminMiddleware } from "../middleware/auth.middleware.js"
import { addCategory, deleteCategory, editCategory, getCategory, getCategoryById } from "../controllers/category.controller.js"

const router = express.Router()

router.post("/", authMiddleware, isAdminMiddleware, addCategory)
router.patch("/:id", authMiddleware, isAdminMiddleware, editCategory)
router.delete("/:id", authMiddleware, isAdminMiddleware, deleteCategory)
router.get("/", getCategory)
router.get("/:id", getCategoryById)

export default router;