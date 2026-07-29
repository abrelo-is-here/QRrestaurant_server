import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  tableNumber: { type: String, required: true },
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      name: String,
      price: Number,
      takeawayprice: Number, // 🟢 ADD THIS LINE: To store the takeaway box fee for this item
      quantity: Number,
    }
  ],
  specialRequests: { type: String, default: "" }, 
  
  // Explicitly store VIP status
  isVIP: { type: Boolean, default: false },

  // 🟢 ADD THIS LINE: To store the Takeaway status
  isTakeaway: { type: Boolean, default: false },

  
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);