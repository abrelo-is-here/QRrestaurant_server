import Session from "../models/sessionModel.js";

export const verifyQrSession = async (req, res, next) => {
  // console.log("COOKIES RECEIVED:", req.cookies);
  // console.log("SESSION COOKIE:", req.cookies?.qrSession);
  try {
    const sessionId = req.cookies?.qrSession;

    console.log('Session ID from cookies:', sessionId);

    if (!sessionId) {
      return res.status(401).json({ message: "No session" });
    }

    const session = await Session.findOne({ sessionId });

    if (!session || !session.active || session.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid session" });
    }

    req.qrSession = session;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const verifyQr = (req, res) => {
  return res.status(200).json({
    valid: true,
    restaurantId: req.qrSession.restaurantId,
    tableNumber: req.qrSession.tableNumber
  });
};