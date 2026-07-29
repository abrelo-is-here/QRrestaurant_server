// controllers/authController.js
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// =========================
// REGISTER CONTROLLER
// =========================
export const register = async (req, res) => {
  try {
    const { name, email, password, restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if restaurant exists
    const restaurantExist = await Restaurant.findById(restaurantId);
    if (!restaurantExist) {
      return res.status(400).json({ message: "No restaurant registered with this id" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create owner user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      restaurantId,
      role: "owner",
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      restaurantId: restaurantExist._id,
      restaurantName: restaurantExist.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// LOGIN CONTROLLER
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let restaurantName = null;
    const restaurantId = user.restaurantId;

    // Non-admin users must be linked to restaurant
    if (user.role !== "admin") {
      const restaurant = await Restaurant.findById(user.restaurantId);

      if (!restaurant) {
        return res.status(400).json({ message: "Restaurant not found" });
      }

      // BLOCK IF INACTIVE
      if (restaurant.status !== "active") {
        return res.status(403).json({
          message: `Your restaurant is currently inactive (${restaurant.status}). Please contact admin.`,
        });
      }

      // AUTO DEACTIVATE IF EXPIRED
      if (
        restaurant.subscriptionExpiresAt &&
        restaurant.subscriptionExpiresAt < new Date()
      ) {
        restaurant.status = "inactive";
        await restaurant.save();

        return res.status(403).json({
          message: "Subscription expired. Please renew your plan.",
        });
      }

      restaurantName = restaurant.name;
    }

    const token = jwt.sign(
      {
        id: user._id,
        restaurantId,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        restaurantId,
        restaurantName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login Server Error: " + error.message });
  }
};

// =========================
// CREATE STAFF OR OWNER
// =========================
export const createStaffOrOwner = async (req, res) => {
  try {
    const { name, email, password, role, restaurantId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let assignedRestaurantId = restaurantId;

    // Owners can only create users in their own restaurant
    if (req.user.role === "owner") {
      assignedRestaurantId = req.user.restaurantId;
    } else if (!assignedRestaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    let assignedRole = role;

    // Owners can only create staff
    if (req.user.role === "owner") {
      assignedRole = "staff";
    } else if (!["owner", "staff"].includes(assignedRole)) {
      assignedRole = "staff";
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      restaurantId: assignedRestaurantId,
      role: assignedRole,
    });

    const restaurant = await Restaurant.findById(assignedRestaurantId);

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        restaurantId: restaurant?._id,
        restaurantName: restaurant?.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};