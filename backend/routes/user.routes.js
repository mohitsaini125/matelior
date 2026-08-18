import express from "express";
import {
    getAllUsersAdmin,
    getMe,
    getUserActivityAdmin,
    login,
    register,
    updateProfile,
    updateUserRoleSuperAdmin,
    userDetails,
} from "../controllers/user.controller.js";
import { authMiddleware, isAdmin, isSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);

// Admin user management routes
router.get("/admin", authMiddleware, isAdmin, getAllUsersAdmin);
router.get("/admin/details/:userId", authMiddleware, isAdmin, userDetails);
router.get("/admin/activity/:userId", authMiddleware, isAdmin, getUserActivityAdmin);
router.patch("/admin/update-role/:userId", authMiddleware, isSuperAdmin, updateUserRoleSuperAdmin);

export default router;