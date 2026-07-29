import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  restaurantId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant"
  },

  role: {
    type: String,
    enum: ["owner", "admin","staff"],
    default: "owner"
  }
},
{ timestamps: true }
);

const User =  mongoose.model("User", userSchema);


export default User