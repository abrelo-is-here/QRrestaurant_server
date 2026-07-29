import express from "express";
import { 
    createCategory, 
    getCategories, 
    updateCatagories,
    fetchSingleCatagorie,
deleteCategory } 
from "../controllers/catagorieController.js";
import { verifyToken , authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken,  createCategory);

router.get("/single/:id", verifyToken , fetchSingleCatagorie); // ✅ move this up

router.get("/:restaurantId", getCategories);

router.put("/:id", verifyToken, updateCatagories);

router.delete("/:id", verifyToken, deleteCategory);
export default router;