import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid token format",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }


    // Check restaurant status
    if (user.restaurantId) {
      const restaurant = await Restaurant.findById(
        user.restaurantId
      );

      if (!restaurant) {
        return res.status(404).json({
          message: "Restaurant not found",
        });
      }

      if (restaurant.status !== "active") {
        return res.status(403).json({
          message: "Restaurant has been deactivated",
          logout: true,
        });
      }
    }


    req.user = user;

    next();

  } catch (error) {
    console.log("JWT error:", error.message);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};


// role middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};