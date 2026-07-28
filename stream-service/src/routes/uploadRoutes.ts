import { Router } from "express";
import { uploadVideo, optimizeVideoQualities, getProgressStatus, deleteCourseAssets, getPresignedUrl, processDirectUpload } from "../controllers/uploadController";
import { uploadDocument } from "../controllers/documentController";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../temp"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadVideoMiddleware = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB limit for videos
});

const uploadDocumentMiddleware = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
});

router.post("/video", uploadVideoMiddleware.single("video"), uploadVideo);
router.post("/document", uploadDocumentMiddleware.single("document"), uploadDocument);

// Direct-to-S3 Upload Routes
router.get("/video/presigned-url", getPresignedUrl);
router.post("/video/process", processDirectUpload);

router.post("/video/optimize", optimizeVideoQualities);
router.get("/video/status/:videoId", getProgressStatus);
router.delete("/course/:instituteId/:courseId", deleteCourseAssets);

export default router;
