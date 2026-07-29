import crypto from "crypto";
import Session from "../models/sessionModel.js";

const frontendUrl = process.env.CLIENT_URL;

export const activateSession = async (req, res) => {
  try {
    const { tableNumber, restaurantId } = req.query;

    if (!tableNumber || !restaurantId) {
      return res.redirect(`${frontendUrl}/invalid-access`);
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = await Session.create({
      restaurantId,
      tableNumber,
      token,
      expiresAt,
      isActive: true
    });
    console.log('Session ID from cookies: ' , session);

    // IMPORTANT: send token to frontend
   res.redirect(
  `${frontendUrl}/menu/${restaurantId}?table=${table}`
);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};