import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { addAddress, deleteAddress, getAddress, getAddressById, updateAddress } from "../controllers/address.controller.js"

const router = express.Router()

router.post("/", authMiddleware, addAddress)
router.get("/", authMiddleware, getAddress)
router.get("/:id", authMiddleware, getAddressById)
router.patch("/:id", authMiddleware, updateAddress)
router.delete("/:id", authMiddleware, deleteAddress)


export default router