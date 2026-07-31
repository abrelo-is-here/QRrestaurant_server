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

    await Session.deleteMany({
      restaurantId,
      tableNumber: table,
      active: true
    });

    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const session = await Session.create({
      sessionId,
      restaurantId,
      tableNumber: table,
      expiresAt,
      active: true
    });

   console.log("Created session:", sessionId);

res.cookie("qrSession", sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
});

console.log("Response cookies:", res.getHeaders()["set-cookie"]);

    return res.redirect(
      `https://qr-food-restaurant-client.vercel.app/menu/${restaurantId}?table=${table}`
    );

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
