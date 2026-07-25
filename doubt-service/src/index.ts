import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { Doubt } from "./models/Doubt";
import { Message } from "./models/Message";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sam:Sambhav1204@atlascluster.ycaagz6.mongodb.net/LumenLMS?retryWrites=true&w=majority&appName=AtlasCluster';
const JWT_SECRET = process.env.JWT_SECRET || 'super_fallback_jwt_secret_lumenlms';

mongoose.connect(MONGO_URI).then(() => {
  console.log("Doubt Service: Connected to MongoDB");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

// Middleware for REST Auth
const authenticateRest = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// REST Endpoints
app.get("/api/doubts/course/:courseId", authenticateRest, async (req: any, res: any) => {
  try {
    const { courseId } = req.params;
    const doubts = await Doubt.find({ courseId }).sort({ updatedAt: -1 });
    res.status(200).json(doubts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doubts" });
  }
});

app.post("/api/doubts", authenticateRest, async (req: any, res: any) => {
  try {
    const { courseId, subject } = req.body;
    const newDoubt = new Doubt({
      courseId,
      studentId: {
        _id: req.user.id || req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      subject
    });
    await newDoubt.save();
    res.status(201).json(newDoubt);
  } catch (err) {
    res.status(500).json({ error: "Failed to create doubt" });
  }
});

app.get("/api/doubts/:threadId/messages", authenticateRest, async (req: any, res: any) => {
  try {
    const { threadId } = req.params;
    const messages = await Message.find({ threadId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/api/doubts/:threadId/messages", authenticateRest, async (req: any, res: any) => {
  try {
    const { threadId } = req.params;
    const { text } = req.body;
    
    const message = new Message({
      threadId,
      senderId: {
        _id: req.user.id || req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      text
    });
    await message.save();

    // Update parent doubt updatedAt
    await Doubt.findByIdAndUpdate(threadId, { updatedAt: new Date() });

    // Emit to room
    io.to(threadId).emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.patch("/api/doubts/:threadId/assign", authenticateRest, async (req: any, res: any) => {
  try {
    const { threadId } = req.params;
    const userId = req.user.id || req.user.userId;
    const name = req.user.name;
    const email = req.user.email;
    const role = req.user.role;

    if (role !== 'Faculty') {
      return res.status(403).json({ error: "Only faculty can assign doubts" });
    }

    const updated = await Doubt.findByIdAndUpdate(
      threadId,
      {
        assignedTo: { _id: userId, name, email, role },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    // Broadcast assignment update to room
    io.to(threadId).emit("doubtAssigned", updated);

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign doubt" });
  }
});

app.patch("/api/doubts/:threadId/status", authenticateRest, async (req: any, res: any) => {
  try {
    const { threadId } = req.params;
    const { status, resolvedByName } = req.body;

    const doubt = await Doubt.findById(threadId);
    if (!doubt) return res.status(404).json({ error: "Doubt not found" });

    // If resolved by student, use the assigned faculty's name
    const finalResolvedBy = resolvedByName || (status === 'resolved' && doubt.assignedTo ? doubt.assignedTo.name : undefined);

    const updated = await Doubt.findByIdAndUpdate(
      threadId,
      { status, resolvedByName: finalResolvedBy, updatedAt: new Date() },
      { new: true }
    );
    
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Endpoint to fetch assigned doubts for a faculty member in a specific course
app.get("/api/doubts/assigned/:courseId", authenticateRest, async (req: any, res: any) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id || req.user.userId;
    const doubts = await Doubt.find({ courseId, "assignedTo._id": userId, status: "open" }).sort({ updatedAt: -1 });
    res.status(200).json(doubts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assigned doubts" });
  }
});

// Socket.IO Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error"));
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (socket as any).user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected to Doubt Service: ${(socket as any).user.email}`);

  socket.on("joinThread", (threadId) => {
    socket.join(threadId);
    console.log(`Socket joined thread: ${threadId}`);
  });

  socket.on("leaveThread", (threadId) => {
    socket.leave(threadId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Doubt Service Microservice running on port ${PORT}`);
});
