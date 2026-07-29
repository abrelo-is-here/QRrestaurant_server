import express from "express";
import { 
    createCategory, 
    getCategories, 
    updateCatagories,
    fetchSingleCatagorie,
deleteCategory } 
from "../controllers/catagorieController.js";
import { verifyToken , authorizeRoles } from "../middleware/authMiddleware.js";
import {  updateRate , getRate , createRate } from "../controllers/rateController.js";

const router = express.Router();

router.get("/:restaurantId" , getRate);
router.put("/:restaurantId", verifyToken , updateRate);
router.post("/:restaurantId", verifyToken , createRate);

export default router;