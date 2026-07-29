import express from "express";
import { createRestaurant, updateRestaurantStatus,getRestaurant ,  getRestaurants,updateRestaurant ,deleteRestaurant , getRestaurantStatus } from "../controllers/restaurantController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.js";



const router = express.Router();

// Admin-only routes
router.post("/", verifyToken, authorizeRoles("admin"), upload.single("logo"), createRestaurant);
router.get("/", verifyToken, authorizeRoles("admin"), getRestaurants); // Public route to get all restaurants with staff info
router.get("/:id", verifyToken, authorizeRoles("admin"), getRestaurant);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteRestaurant);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  upload.single("logo"),
  updateRestaurant
);
// 🔥 ONLY ADMIN CAN DO THIS
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("admin"),
  updateRestaurantStatus
);


// only admin can extend subscription
// router.patch(
//   "/:id/subscription",
//   verifyToken,
//   authorizeRoles("admin"),
//   extendSubscription
// );

// Public route to check restaurant status
router.get("/status/:id", getRestaurantStatus);


export default router;