import express from "express";
import { getOwners, deleteOwner } from "../controllers/userController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only routes
router.get("/owners", verifyToken, authorizeRoles("admin"), getOwners);
router.delete("/owners/:id", verifyToken, authorizeRoles("admin"), deleteOwner);




export default router;