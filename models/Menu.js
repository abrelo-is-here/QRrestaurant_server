import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  description: String,

  dineInPrice: {
    type: Number,
    required: true
  },

  takeawayPrice: {
    type: Number,
    required: true
  },

  images: {
    type: [String],
    default: []
  },

  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("MenuItem", menuItemSchema);