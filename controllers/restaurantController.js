import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js"; // Restaurant staff/admin
import Category from "../models/Category.js"; // optional: for Restaurant service menu
import cloudinary from "../config/cloudinary.js";
import MenuItem from "../models/Menu.js"; // or whatever your Menu model is named
import Order from "../models/Order.js";

export const createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, active } = req.body;
    let logoUrl = "";

    // 1. Use the Stream logic (same as your Menu controller)
    if (req.file) {
      logoUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'restaurant_logos' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    // 2. Create the Restaurant with the logo URL
    const newRestaurant = await Restaurant.create({
      name,
      address,
      phone,
      logo: logoUrl, // Now this will have the https:// link
      owner: req.user.id,
      status: active === "true" || active === true ? "active" : "inactive",
    });

    res.status(201).json(newRestaurant);
  } catch (error) {
    console.error("Restaurant Logo Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all restaurants with their admins/staff
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().lean();

    const restaurantsWithStaff = await Promise.all(
      restaurants.map(async (restaurant) => {
        const staff = await User.find({ restaurantId: restaurant._id, role: "admin" }).select("name email");
        return { ...restaurant, staff };
      })
    );

    res.json(restaurantsWithStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a restaurant and associated data
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the restaurant first to get the Logo URL (for Cloudinary cleanup)
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    // 2. DELETE FROM CLOUDINARY (Optional but recommended)
    // If the restaurant has a logo, extract the public_id and delete it
    if (restaurant.logo) {
      const publicId = restaurant.logo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`restaurant_logos/${publicId}`);
    }

    // 3. CASCADE DELETE IN DATABASE
    // We use Promise.all to run these deletions in parallel for better performance
    await Promise.all([
      // Delete all staff members and admins linked to this restaurant
      User.deleteMany({ restaurantId: id }), 
      
      // Delete all categories
      Category.deleteMany({ restaurantId: id }),
      
      // Delete all menu items/dishes
      MenuItem.deleteMany({ restaurantId: id }),
      
      // Delete all past and present orders
      Order.deleteMany({ restaurantId: id }),
      
      // Finally, delete the restaurant itself
      Restaurant.findByIdAndDelete(id)
    ]);

    res.json({ 
      success: true, 
      message: "Restaurant, staff, menus, and orders purged successfully." 
    });

  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change restaurant status
export const updateRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    restaurant.status = status;
    await restaurant.save();

    res.json({
      message: `Restaurant is now ${status}`,
      restaurant
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, active } = req.body;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Upload new logo if provided
    if (req.file) {
      // Delete old logo from Cloudinary
      if (restaurant.logo) {
        try {
          const publicId = restaurant.logo
            .split("/")
            .pop()
            .split(".")[0];

          await cloudinary.uploader.destroy(`restaurant_logos/${publicId}`);
        } catch (err) {
          console.log("Old logo delete failed:", err.message);
        }
      }

      const logoUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "restaurant_logos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );

        stream.end(req.file.buffer);
      });

      restaurant.logo = logoUrl;
    }

    restaurant.name = name ?? restaurant.name;
    restaurant.address = address ?? restaurant.address;
    restaurant.phone = phone ?? restaurant.phone;

    if (active !== undefined) {
      restaurant.status =
        active === "true" || active === true
          ? "active"
          : "inactive";
    }

    await restaurant.save();

    res.json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single restaurant
export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get restaurant status 
export const getRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    res.json({ status: restaurant.status });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};