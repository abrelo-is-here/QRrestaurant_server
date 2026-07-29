import express from "express";
import { myStaffs , deleteStaff , createStaff } from "../controllers/staffController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:restaurantId",verifyToken , myStaffs);
router.post("/", verifyToken, createStaff);
router.delete("/:id",verifyToken , deleteStaff);


export default router;