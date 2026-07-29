import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },
  address: String,

  phone: String,

  logo: String,

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // 🔥 MAIN CONTROL FIELD
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
},
{ timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);