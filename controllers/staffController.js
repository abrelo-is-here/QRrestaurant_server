import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// Get all staff for a specific restaurant
export const myStaffs = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurantExist = await Restaurant.findById(restaurantId);
    if (!restaurantExist)
      return res.status(404).json({ message: "Restaurant Not Found" });

    const staffList = await User.find({
      restaurantId: restaurantId,
      // Just a tip: if you want both staff and owners,
      // you can use role: { $in: ["staff", "owner"] }
      role: "staff",
    });

    // Change 'staffList' to 'myStaff' to match your original frontend logic
    // OR change the frontend to match this. Let's stick to 'staffList' for clarity.
    res.status(200).json({ staffList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetch Staff Server Error: " + error.message });
  }
};

// Delete a staff member
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const removedStaff = await User.findByIdAndDelete(id);
    if (!removedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res
      .status(200)
      .json({ message: "Staff deleted successfully", staff: removedStaff });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Deleting Staff Server Error: " + error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, restaurantId , role } = req.body;

    // Check restaurant exists
    const restaurantExist = await Restaurant.findById(restaurantId);

    if (!restaurantExist) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await User.create({
      name,
      email,
      password: hashedPassword,
      restaurantId,
      role: role,
    });

    res.status(201).json({
      message: "Staff created successfully",

      staff: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Create Staff Server Error: " + error.message,
    });
  }
};
