import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
{
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant"
  },

  name: String
},
{ timestamps: true }
);

export default mongoose.model("Category", categorySchema);