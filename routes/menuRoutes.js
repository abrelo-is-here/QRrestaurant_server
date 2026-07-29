import express from "express";
import { createMenuWithImages, getMenuItems, updateMenuAvailability , updateMenu , fetchMenuItemById , deleteMenuItem} from "../controllers/menuController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

// Only restaurant owners can create menu items
router.post("/create", verifyToken, upload.array('images', 3), createMenuWithImages);

// Customers can view menu items without login
router.get("/:restaurantId", getMenuItems);

//staff also can update product availability
router.put("/status/:id", verifyToken, updateMenuAvailability);

//staff also can update product details
router.put("/:id", verifyToken, upload.array('images', 3), updateMenu);

// Fetch single menu item by ID (for editing)
router.get("/single/:id", fetchMenuItemById);

// Delete a menu item
router.delete("/single/:id", deleteMenuItem);





export default router;