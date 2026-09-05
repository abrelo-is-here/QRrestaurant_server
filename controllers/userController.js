import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";// make sure your model is correct

// Fetch all owners (excluding admins) with restaurant names
export const getOwners = async (req, res) => {
  try {
    const owners = await User.aggregate([
      { $match: { role: { $ne: "admin" } } }, // exclude admins
      {
        $lookup: {
          from: "restaurants", // collection name in MongoDB
          localField: "restaurantId",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      {
        $unwind: {
          path: "$restaurant",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          restaurantName: { $ifNull: ["$restaurant.name", "N/A"] },
        },
      },
    ]);

    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an owner by ID (admin only)
export const deleteOwner = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot delete an admin" });

    await User.findByIdAndDelete(id);
    res.json({ message: "Owner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
