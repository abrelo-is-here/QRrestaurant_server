import Restaurant from "../models/Restauran.js";

export const checkRestaurantStatus = async (req, res, next) => {
  try {
    // Admin should bypass everything
    if (req.user.role === "admin") {
      return next();
    }

    const restaurant = await Restaurant.findById(req.user.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // 🔥 AUTO-SUSPEND if expired
    if (
      restaurant.subscriptionExpiresAt &&
      restaurant.subscriptionExpiresAt < new Date()
    ) {
      if (restaurant.status !== "suspended") {
        restaurant.status = "suspended";
        await restaurant.save();
      }
    }

    // 🚫 BLOCK BASED ON STATUS
    if (restaurant.status === "paused") {
      return res.status(403).json({
        message: "Restaurant is temporarily paused (renovation mode)"
      });
    }

    if (restaurant.status === "suspended") {
      return res.status(403).json({
        message: "Subscription expired. Please renew to continue."
      });
    }

    // optional: attach restaurant to request
    req.restaurant = restaurant;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};