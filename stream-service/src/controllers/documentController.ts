import { Request, Response } from "express";
import { uploadDirectlyToS3 } from "../services/s3UploadService";
import path from "path";
import fs from "fs";

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { instituteId, courseId } = req.body;
    if (!instituteId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Missing instituteId" });
    }

    const inputPath = req.file.path;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(originalName);
    const s3Key = courseId 
      ? `institutes/${instituteId}/courses/${courseId}/documents/${uniqueName}`
      : `institutes/${instituteId}/documents/${uniqueName}`;

    console.log(`[Document] Uploading ${originalName} to S3...`);
    const fileUrl = await uploadDirectlyToS3(inputPath, s3Key, req.file.mimetype);

    // Clean up local file immediately after S3 upload
    fs.unlinkSync(inputPath);

    res.status(200).json({
      message: "Document uploaded successfully",
      url: fileUrl,
      sizeInBytes: fileSize,
      originalName: originalName
    });

  } catch (error) {
    console.error("Document upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server error during document upload" });
  }
};
