import express from "express";
import { register, login, createStaffOrOwner } from "../controllers/authController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Owner creates staff
router.post(
  "/create-staff",
  verifyToken,
  createStaffOrOwner
);

export default router;