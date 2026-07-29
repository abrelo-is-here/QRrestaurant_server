import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
{
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant"
  },

  tableNumber: Number,

  qrCode: String
},
{ timestamps: true }
);

export default mongoose.model("Table", tableSchema);