import Order from "../models/Order.js";

// =======================
// DASHBOARD SUMMARY
// =======================

export const getDashboardStats = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId; // 🔥 changed

    const orders = await Order.find({ restaurantId });

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.totalPrice;
    }, 0);

    const completedOrders = orders.filter(
      order => order.status === "completed"
    ).length;

    // 🔥 NEW: unique rooms served
    const uniqueRooms = new Set(
      orders.map(order => order.roomNumber)
    ).size;

    res.json({
      totalOrders,
      totalRevenue,
      completedOrders,
      roomsServed: uniqueRooms, // 🔥 restorant-specific insight
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =======================
// ORDERS TODAY
// =======================

export const getTodayOrders = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId; // 🔥 changed

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      restaurantId, // 🔥 changed
      createdAt: { $gte: today },
    });

    res.json({
      todayOrders: orders.length,
      orders,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =======================
// POPULAR ITEMS / SERVICES
// =======================

export const getPopularItems = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId; // 🔥 changed

    const orders = await Order.find({ restaurantId });

    const itemCount = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCount[item.name]) {
          itemCount[item.name] = 0;
        }
        itemCount[item.name] += item.quantity;
      });
    });

    const popularItems = Object.entries(itemCount)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    res.json(popularItems);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};