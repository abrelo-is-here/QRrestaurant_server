import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getSingleOrder
} from "../controllers/orderController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyQrSession } from "../middleware/qrSessionMiddleware.js";

const router = express.Router();

router.post("/", verifyQrSession, createOrder);

router.get("/:restaurantId", getOrders); // verifyToken alew

router.get("/single/:id", getSingleOrder); // verifyToken alew

router.delete("/:id", deleteOrder);

router.put("/:id", updateOrderStatus); // verifyToken alew

export default router;