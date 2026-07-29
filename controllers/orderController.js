import Order from "../models/Order.js";
import MenuItem from "../models/Menu.js";

// =========================
// CREATE ORDER (guest)
// =========================
// export const createOrder = async (req, res) => {
//   try {
//     const { restaurantId, items, tableNumber, specialRequests } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: "No items in order" });
//     }

//     // 1. Calculate the raw subtotal
//     let subtotal = 0;
//     items.forEach(item => {
//       subtotal += item.price * item.quantity;
//     });

//     // 2. Add 15% VAT
//     const vat = subtotal * 0.15;
//     const totalPrice = subtotal + vat; // This is the final amount including tax

//     const order = await Order.create({
//       restaurantId,
//       tableNumber,
//       items,
//       specialRequests: specialRequests || "",
//       totalPrice, // Now contains VAT
//       status: "pending"
//     });

//     const io = req.app.get("io");

//     // Notify restaurantId staff dashboard
//     io.to(restaurantId.toString()).emit("newOrder", order);

//     // Notify the guest (order tracking page)
//     io.to(order._id.toString()).emit("orderUpdated", order);

//     res.status(201).json(order);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


//create order with VIP surcharge and VAT

export const createOrder = async (req, res) => {
  try {
    const { items, specialRequests, isTakeaway } = req.body;

    if (!req.qrSession) {
      return res.status(401).json({ message: "Session expired." });
    }

    const restaurantId = req.qrSession.restaurantId;
    const tableNumber = req.qrSession.tableNumber;
    console.log('restaurantId from backend: ', restaurantId);

    let subtotal = 0;
    let totalItemsCount = 0;

    // Build safe order items with DB prices
    const enrichedItems = [];
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "No items in order",
        });
      }

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);

      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item not found: ${item.menuItemId}`,
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          message: `${menuItem.name} is currently unavailable`,
        });
      }

    const price = isTakeaway
            ? (menuItem.takeawayPrice || menuItem.price || 0)
            : (menuItem.dineInPrice || menuItem.price || 0);

          if (!price || price <= 0) {
            return res.status(400).json({
              message: `Invalid price for ${menuItem.name}`
            });
          }

          const quantity = Number(item.quantity);

        if (!quantity || quantity <= 0) {
          return res.status(400).json({
            message: `Invalid quantity for ${menuItem.name}`,
          });
        }

      subtotal += price * quantity;
      totalItemsCount += quantity;

      enrichedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price, // final locked price
        quantity,
      });
    }

    // VIP logic
    const tableStr = String(tableNumber || "");
    const isVIP = tableStr.toUpperCase().startsWith("VIP");

    const vipSurcharge = isVIP ? subtotal * 0.2 : 0;

    const totalPrice = subtotal + vipSurcharge;

    // Create order
    console.log('Creating order with data:', {
      restaurantId,
      tableNumber
    });

    const order = await Order.create({
      restaurantId,
      tableNumber,
      items: enrichedItems,
      totalItemsCount,
      specialRequests: specialRequests || "",
      totalPrice,
      isVIP,
      isTakeaway: !!isTakeaway,
      status: "pending",
    });

    // Emit real-time update
    const io = req.app.get("io");
    if (io && restaurantId) {
          io.to(restaurantId.toString()).emit("newOrder", order);
        }

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// =========================
// GET ORDERS (staff / admin)
// =========================
export const getOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const orders = await Order.find({ restaurantId })
      .sort({ createdAt: -1 }); // newest first

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// GET SINGLE ORDER
// =========================
export const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// UPDATE ORDER STATUS (staff)
// =========================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 🟢 ADD "ready" TO THIS ARRAY
    const validStatuses = ["pending", "preparing", "ready", "delivering", "delivered"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    const io = req.app.get("io");

    // Notify staff dashboard
    io.to(order.restaurantId.toString()).emit("orderUpdated", order);

    // Notify guest tracking page
    io.to(order._id.toString()).emit("orderUpdated", order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// DELETE ORDER (staff)
// =========================
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();

    const io = req.app.get("io");

    // Notify staff dashboard
    io.to(order.restaurantId.toString()).emit("orderDeleted", id);

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};