import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === "application/pdf" || path.extname(file.originalname).toLowerCase() === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF attachments are allowed!"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const videoFileFilter = (req: any, file: any, cb: any) => {
  const allowedExts = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith("video/") || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files (.mp4, .webm, .mov, etc.) are allowed!"), false);
  }
};

export const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit for video lectures
});

