import QRCode from "qrcode";
import Session from "../models/sessionModel.js";
import crypto from "crypto";

const frontendUrl = process.env.CLIENT_URL;

//owner generate the QR code for each table then print  so the GUEST can scan 
export const generateQRCode = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { tableNumber } = req.body;

    if (!tableNumber) {
      return res.status(400).json({ message: "Table number is required" });
    }

    // 🔥 IMPORTANT: QR now points to backend scan endpoint
    const url = `https://qrrestaurant-server.onrender.com/api/qr/scan?restaurantId=${restaurantId}&table=${tableNumber}`;

    const qrImage = await QRCode.toDataURL(url);

    res.json({
      qr: qrImage,
      url
    });

  } catch (error) {
    res.status(500).json({ message: `Error generating QR code: ${error.message}` });
  }
};


export const scanQr = async (req, res) => {
  try {
    const { restaurantId, table } = req.query;

    console.log("Restaurant:", restaurantId);
    console.log("Table:", table);

    if (!restaurantId || !table) {
      return res.status(400).json({ message: "Invalid QR scan" });
    }

    const sessionId = crypto.randomBytes(32).toString("hex");
    // Extend expiry from 10 mins to 3 hours for dining sessions
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    await Session.create({
      sessionId,
      restaurantId,
      tableNumber: table,
      expiresAt,
      active: true
    });

    console.log("Created session:", sessionId);

    // Keep cookie for browsers that support it
    res.cookie("qrSession", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3 * 60 * 60 * 1000,
    });

    const clientUrl = process.env.CLIENT_URL || "https://qr-food-restaurant-client.vercel.app";

    // 🔥 CRITICAL FIX: Append sessionId in the redirect URL
    return res.redirect(
      `${clientUrl}/menu/${restaurantId}?table=${table}&sessionId=${sessionId}`
    );

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
