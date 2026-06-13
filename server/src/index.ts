import express, { Request, Response } from "express";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { Plan } from "./models/Plan";
import authRoutes from "./routes/authRoutes";
import superRoutes from "./routes/superRoutes";
import adminRoutes from "./routes/adminRoutes";
import courseRoutes from "./routes/courseRoutes";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/super", superRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);

// Zoom integration status check
import { isZoomConfigured } from "./services/zoomService";
app.get("/api/zoom/status", (req: Request, res: Response) => {
  res.status(200).json({
    configured: isZoomConfigured(),
    message: isZoomConfigured()
      ? "Zoom Server-to-Server OAuth credentials are configured."
      : "Zoom credentials are not set. Add ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET to your .env file."
  });
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ 
    status: "ok", 
    message: "LumenLMS API is running smoothly." 
  });
});

// Root entrypoint info
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Welcome to the LumenLMS Backend API. Access /api/health for system status.");
});

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();

    // Seed default plans if none exist
    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      console.log("Seeding default pricing plans...");
      await Plan.insertMany([
        { planCode: 'Basic', name: 'Basic Plan', price: '$299/mo', apiLimit: '50k req/mo', details: 'Best for individual training hubs' },
        { planCode: 'Premium', name: 'Premium Plan', price: '$599/mo', apiLimit: '250k req/mo', details: 'Perfect for growing educational institutions' },
        { planCode: 'Enterprise', name: 'Enterprise Plan', price: '$1,450/mo', apiLimit: 'Unlimited', details: 'Full power for university-scale platforms' },
        { planCode: 'Custom', name: 'Custom Plan', price: 'Contact Sales', apiLimit: 'Customized', details: 'Tailored limits and dedicated support' }
      ]);
    }

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`LumenLMS Server is active and listening on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error("Critical: Failed to launch the server:", error);
    process.exit(1);
  }
};

startServer();
