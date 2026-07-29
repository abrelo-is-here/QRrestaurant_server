import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import restaurantRoutes from "./routes/restaurantRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import staffRoutes from './routes/staffRoutes.js'
import rateRoutes from './routes/rateRoutes.js'


dotenv.config();
connectDB();

console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
const frontendUrl = process.env.CLIENT_URL;

// ✅ Create HTTP server (important for socket.io)
const server = http.createServer(app);

// ✅ Setup Socket.io
const io = new Server(server, {
  cors: {
     origin: [
      `${frontendUrl}`
  ], // your frontend
    methods: ["GET", "POST"]
  }
});

// ✅ Make io accessible in controllers
app.set("io", io);

// ✅ Socket connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Restaurant dashboard room
  socket.on("joinRestaurant", (restaurantId) => {
    socket.join(restaurantId);
    console.log(`Socket ${socket.id} joined restaurant ${restaurantId}`);
  });

  // Customer order room
  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined order ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


// Middlewares
app.use(cors({
  origin: [
    `${frontendUrl}`
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());




// Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/users", userRoutes);
app.use("/api/staff" , staffRoutes)
app.use("/api/rates" , rateRoutes)


// Start server
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});