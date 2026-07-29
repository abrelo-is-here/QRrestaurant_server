import express from "express";
import {
  getDashboardStats,
  getTodayOrders,
  getPopularItems
} from "../controllers/dashboardController.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get(
  "/stats",
  verifyToken,
  authorizeRoles("owner"),
  getDashboardStats
);


router.get(
  "/today",
  verifyToken,
  getTodayOrders
);


router.get(
  "/popular-items",
  verifyToken,
  getPopularItems
);


export default router;