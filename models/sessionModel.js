import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    tableNumber: {
      type: String,
      required: true,
      index: true
    },

    active: {
      type: Boolean,
      default: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // 🔥 MongoDB auto-delete after expiry
    }
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;