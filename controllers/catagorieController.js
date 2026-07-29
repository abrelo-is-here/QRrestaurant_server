import Category from "../models/Category.js";
import MenuItem from "../models/Menu.js"; 

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, restaurantId } = req.body; // 🔥 changed

    if (!name || !restaurantId) {
      return res.status(400).json({
        message: "Name and restaurantId are required",
      });
    }

    // Prevent duplicate category per restaurant
    const existingCategory = await Category.findOne({
      name: name.trim().toLowerCase(),
      restaurantId, // 🔥 changed
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists for this restaurant",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      restaurantId, // 🔥 changed
    });

    res.status(201).json(category);

  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      message: "Server error while creating category",
    });
  }
};


// GET CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const { restaurantId } = req.params; // 🔥 changed

    if (!restaurantId) {
      return res.status(400).json({
        message: "restaurantId is required",
      });
    }

    const categories = await Category.find({ restaurantId }) // 🔥 changed
      .sort({ createdAt: -1 });

    if (categories.length === 0) {
      return res.status(200).json({
        message: "No categories found",
        data: [],
      });
    }

    res.status(200).json({
      count: categories.length,
      data: categories,
    });

  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      message: "Server error while fetching categories",
    });
  }
};


// UPDATE CATEGORY
export const updateCatagories = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required!" });
    }

    const isExist = await Category.findById(id);
    if (!isExist) {
      return res.status(404).json({ message: "No category with this ID" });
    }

    const update = await Category.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    res.json(update);

  } catch (error) {
    console.error("Update Categories Error:", error);
    res.status(500).json({
      message: "Server error while updating categories",
    });
  }
};


// GET SINGLE CATEGORY
export const fetchSingleCatagorie = async (req, res) => {
  try {
    const { id } = req.params;

    const cat = await Category.findById(id);
    console.log('id: ' , id)

    if (!cat) {
      return res.status(404).json({
        message: "No category with this ID",
      });
    }

    res.json(cat);

  } catch (error) {
    console.error("Fetching Single Category Error:", error);
    res.status(500).json({
      message: "Server error while fetching category",
    });
  }
};

// DELETE CATEGORY
// Ensure you import your Menu model

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find and delete the category
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 2. Cascade Delete: Remove all menu items linked to this category ID
    // We use deleteMany to clear the entire group of items at once
    await MenuItem.deleteMany({ categoryId: id });

    res.json({ 
      message: "Category and all associated menu items deleted successfully" 
    });
    
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      message: "Server error while deleting category and its items",
    });
  }
};
