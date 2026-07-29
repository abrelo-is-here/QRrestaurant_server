import MenuItem from "../models/Menu.js";
import cloudinary from "../config/cloudinary.js";

// CREATE ITEM (food or service)
export const createMenuWithImages = async (req, res) => {
  try {
    let imageUrls = [];

    // 1. Only run Cloudinary logic IF files exist
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'restorant_menus' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
      });
      imageUrls = await Promise.all(uploadPromises);
  
    }

    // 2. Create the item. 
    // If imageUrls is empty, it saves as [] in MongoDB
    const newItem = await MenuItem.create({
      ...req.body,
      images: imageUrls, 
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET ITEMS (by Restorant)
export const getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params; // 🔥 changed

    const items = await MenuItem.find({ restaurantId }) // 🔥 changed
      .sort({ createdAt: -1 });

    res.json(items);

  } catch (error) {
    res.status(500).json({
      message: "Fetch items error: " + error.message,
    });
  }
};


// UPDATE ITEM
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      dineInPrice,
      takeawayPrice,
      existingImages,
    } = req.body;

    // 1. Parse existing images safely
    let imagesToSave = [];

    if (existingImages) {
      try {
        imagesToSave =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;
      } catch (e) {
        console.error("JSON Parse Error for existingImages:", e);
        imagesToSave = [];
      }
    }

    // 2. Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map((file) => file.path);
      imagesToSave = [...imagesToSave, ...newImagePaths];
    }

    // 3. Update menu item
    const updatedMenu = await MenuItem.findByIdAndUpdate(
      id,
      {
        name,
        description,
        dineInPrice,
        takeawayPrice,
        images: imagesToSave,
      },
      { new: true }
    );

    if (!updatedMenu) {
      return res.status(404).json({ message: "No item with this ID" });
    }

    return res.json(updatedMenu);
  } catch (error) {
    console.error("Update Menu Error:", error);
    return res.status(500).json({
      message: "Update item error: " + error.message,
    });
  }
};

// UPDATE AVAILABILITY
export const updateMenuAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const updatedMenu = await MenuItem.findByIdAndUpdate(
      id,
      { available: isAvailable },
      { new: true }
    );

    if (!updatedMenu) {
      return res.status(404).json({ message: "No item with this ID" });
    }

    res.sendStatus(200);

  } catch (error) {
    res.status(500).json({
      message: "Update availability error: " + error.message,
    });
  }
};


// GET SINGLE ITEM
export const fetchMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: "No item with this ID" });
    }

    res.json(menuItem);

  } catch (error) {
    res.status(500).json({
      message: "Fetch item error: " + error.message,
    });
  }
};


// DELETE ITEM
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "No item with this ID" });
    }

    res.json({ message: "Item deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Delete item error: " + error.message,
    });
  }
};