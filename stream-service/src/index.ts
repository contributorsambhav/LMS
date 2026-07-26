import "dotenv/config";
import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure temp directory exists
const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Stream Service is running properly." });
});

app.listen(PORT, () => {
  console.log(`Stream Service running on port ${PORT}`);
});
