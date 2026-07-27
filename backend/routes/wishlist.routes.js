import express from "express"
import { authMiddleware } from "../middleware/auth.middleware"

const router = express.Router()

router.post("/", authMiddleware, addToWishlist)
router.post("/", authMiddleware, readWishlist)
router.delete("/:id", removeFromWishlist)
router.delete("/", clearWishlist)

export default router;