import Session from "../models/sessionModel.js";

export const verifyQrSession = async (req, res, next) => {
  try {
    // 🔥 CRITICAL FIX: Check header -> query param -> cookie
    const sessionId =
      req.headers["x-session-id"] ||
      req.query?.sessionId ||
      req.cookies?.qrSession;

    console.log('Session ID resolved:', sessionId);

    if (!sessionId) {
      return res.status(401).json({ message: "No session provided" });
    }

    const session = await Session.findOne({ sessionId });

    if (!session || !session.active || session.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    req.qrSession = session;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
