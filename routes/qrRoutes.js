import express from "express";
import { generateQRCode, scanQr } from "../controllers/qrController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { verifyQrSession , verifyQr } from "../middleware/qrSessionMiddleware.js";



const router = express.Router();

// Owner generates QR
router.post(
  "/generate",
  verifyToken,
  generateQRCode
);

// 🔥 NEW: Guest scans QR
router.get("/scan", scanQr);
router.get("/verify", verifyQrSession , verifyQr);
console.log("🔥 QR ROUTES ACTIVE");

export default router;