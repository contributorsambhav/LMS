import { Request, Response } from "express";
import { processVideo } from "../services/ffmpegService";
import path from "path";
import fs from "fs";
import { uploadToS3, uploadDirectlyToS3, downloadFromS3, deleteFolderFromS3, generatePresignedUrl } from "../services/s3UploadService";
import { processLowerQualities } from "../services/ffmpegService";
import { progressStore } from "../utils/progressStore";

export const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { instituteId, courseId, videoId, contentType } = req.query;
    if (!instituteId || !courseId || !videoId || !contentType) {
      return res.status(400).json({ message: "Missing required query parameters" });
    }

    const s3Prefix = `institutes/${instituteId}/courses/${courseId}/videos/${videoId}`;
    const s3Key = `${s3Prefix}/raw.mp4`;
    
    const url = await generatePresignedUrl(s3Key, contentType as string);
    
    res.status(200).json({ url, s3Key, videoId });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ message: "Server error generating presigned URL" });
  }
};

export const processDirectUpload = async (req: Request, res: Response) => {
  try {
    const { instituteId, courseId, videoId } = req.body;
    if (!instituteId || !courseId || !videoId) {
      return res.status(400).json({ message: "Missing required body parameters" });
    }

    const s3Prefix = `institutes/${instituteId}/courses/${courseId}/videos/${videoId}`;
    const cdnBase = process.env.R2_PUBLIC_URL || "https://cdn.lumenlms.com";
    const predictedMasterUrl = `${cdnBase}/${s3Prefix}/master.m3u8`;

    res.status(202).json({ 
      message: "Video processing started.",
      videoId: videoId,
      masterUrl: predictedMasterUrl,
    });

    // Run in background
    processVideoFromS3InBackground(videoId, instituteId as string, courseId as string)
      .catch(err => {
        console.error(`Error processing direct upload ${videoId}:`, err);
        progressStore[videoId] = { stage: "error", percent: 0 };
      });

  } catch (error) {
    console.error("Error starting direct upload processing:", error);
    if (!res.headersSent) res.status(500).json({ message: "Server error" });
  }
};

async function processVideoFromS3InBackground(videoId: string, instituteId: string, courseId: string) {
  const s3Prefix = `institutes/${instituteId}/courses/${courseId}/videos/${videoId}`;
  const localRawPath = path.join(__dirname, "../../temp", `raw_${videoId}.mp4`);
  const outputDir = path.join(__dirname, "../../temp", videoId);
  
  try {
    progressStore[videoId] = { stage: "downloading_raw", percent: 0 };
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`[${videoId}] Downloading raw video from S3...`);
    await downloadFromS3(`${s3Prefix}/raw.mp4`, localRawPath);

    console.log(`[${videoId}] Starting FFmpeg processing...`);
    await processVideo(localRawPath, outputDir, videoId);

    console.log(`[${videoId}] FFmpeg processing complete. Uploading chunks to S3...`);
    progressStore[videoId] = { stage: "uploading", percent: 0 };
    
    await uploadToS3(outputDir, s3Prefix);
    
    progressStore[videoId] = { stage: "complete", percent: 100 };
    const cdnBase = process.env.R2_PUBLIC_URL || "https://cdn.lumenlms.com";
    console.log(`[${videoId}] Processing complete! URL: ${cdnBase}/${s3Prefix}/master.m3u8`);
  } finally {
    if (fs.existsSync(localRawPath)) fs.unlinkSync(localRawPath);
    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
  }
}


export const uploadVideo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    const { instituteId, courseId } = req.body;
    if (!instituteId || !courseId) {
      // Clean up the uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Missing instituteId or courseId" });
    }

    const inputPath = req.file.path;
    const videoId = path.basename(req.file.filename, path.extname(req.file.filename));
    
    const s3Prefix = `institutes/${instituteId}/courses/${courseId}/videos/${videoId}`;
    const cdnBase = process.env.R2_PUBLIC_URL || "https://cdn.lumenlms.com";
    const predictedMasterUrl = `${cdnBase}/${s3Prefix}/master.m3u8`;

    // We start processing asynchronously and return a 202 Accepted.
    // In a production system with heavy load, we would push this to a Redis Queue.
    const fileSize = req.file.size;
    res.status(202).json({ 
      message: "Video upload accepted and is now processing.",
      videoId: videoId,
      masterUrl: predictedMasterUrl,
      sizeInBytes: fileSize
    });

    // Fire and forget (processing in background)
    processVideoInBackground(inputPath, videoId, instituteId, courseId)
      .catch(err => {
        console.error(`Error processing video ${videoId}:`, err);
        progressStore[videoId] = { stage: "error", percent: 0 };
      });

  } catch (error) {
    console.error("Upload controller error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error during upload" });
    }
  }
};

async function processVideoInBackground(inputPath: string, videoId: string, instituteId: string, courseId: string) {
  const outputDir = path.join(__dirname, "../../temp", videoId);
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    console.log(`[${videoId}] Starting FFmpeg processing...`);
    await processVideo(inputPath, outputDir, videoId);
    
    console.log(`[${videoId}] FFmpeg processing complete. Starting S3 Upload...`);
    progressStore[videoId] = { stage: "uploading", percent: 0 };
    const s3Prefix = `institutes/${instituteId}/courses/${courseId}/videos/${videoId}`;
    
    // Upload the raw .mp4 for future lower-quality generation
    console.log(`[${videoId}] Uploading raw .mp4 to S3...`);
    await uploadDirectlyToS3(inputPath, `${s3Prefix}/raw.mp4`, "video/mp4");

    // Upload the generated HLS chunks
    await uploadToS3(outputDir, s3Prefix);
    
    progressStore[videoId] = { stage: "complete", percent: 100 };

    const cdnBase = process.env.R2_PUBLIC_URL || "https://cdn.lumenlms.com";
    console.log(`[${videoId}] Upload to S3 complete. URL: ${cdnBase}/${s3Prefix}/master.m3u8`);
    
    // Webhook call to main backend to save the video URL can be placed here!
    
  } finally {
    console.log(`[${videoId}] Cleaning up local temporary files...`);
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  }
}

export const optimizeVideoQualities = async (req: Request, res: Response) => {
  try {
    const { instituteId, courseId, videoId, qualities, existingQualities = [] } = req.body;
    if (!instituteId || !courseId || !videoId || !qualities || !Array.isArray(qualities)) {
      return res.status(400).json({ message: "Missing required fields or qualities array" });
    }

    res.status(202).json({ message: "Optimization started in background" });

    // Run in background
    processOptimizationInBackground(instituteId, courseId, videoId, qualities, existingQualities)
      .catch(err => {
        console.error(`Error optimizing ${videoId}:`, err);
        progressStore[videoId] = { stage: "error", percent: 0 };
      });

  } catch (err) {
    console.error("Optimize controller error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Server error" });
  }
};

async function processOptimizationInBackground(instituteId: string, courseId: string, videoId: string, qualities: string[], existingQualities: string[]) {
  const localRawPath = path.join(__dirname, "../../temp", `raw_${videoId}.mp4`);
  const outputDir = path.join(__dirname, "../../temp", `opt_${videoId}`);
  const s3Prefix = `institutes/${instituteId}/courses/${courseId}/videos/${videoId}`;

  try {
    progressStore[videoId] = { stage: "downloading_raw", percent: 0 };
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`[${videoId} - Opt] Downloading raw video from S3...`);
    await downloadFromS3(`${s3Prefix}/raw.mp4`, localRawPath);

    console.log(`[${videoId} - Opt] Transcoding lower qualities...`);
    await processLowerQualities(localRawPath, outputDir, videoId, qualities, existingQualities);

    progressStore[videoId] = { stage: "uploading", percent: 0 };
    console.log(`[${videoId} - Opt] Uploading new chunks to S3...`);
    await uploadToS3(outputDir, s3Prefix);
    
    progressStore[videoId] = { stage: "complete", percent: 100 };
    console.log(`[${videoId} - Opt] Optimization complete!`);
  } finally {
    if (fs.existsSync(localRawPath)) fs.unlinkSync(localRawPath);
    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
  }
}

export const getProgressStatus = (req: Request, res: Response) => {
  const videoId = req.params.videoId;
  if (!videoId) {
    return res.status(400).json({ message: "No videoId provided" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  
  const interval = setInterval(() => {
    const status = progressStore[videoId] || { stage: "idle", percent: 0 };
    res.write(`data: ${JSON.stringify(status)}\n\n`);
    
    if (status.stage === "complete" || status.stage === "error") {
      clearInterval(interval);
      res.end();
      // Optional: clean up store after some time
      setTimeout(() => delete progressStore[videoId], 5000);
    }
  }, 1000);

  req.on("close", () => clearInterval(interval));
};

export const deleteCourseAssets = async (req: Request, res: Response) => {
  try {
    const { instituteId, courseId } = req.params;
    if (!instituteId || !courseId) {
      return res.status(400).json({ message: "Missing instituteId or courseId" });
    }

    const s3Prefix = `institutes/${instituteId}/courses/${courseId}/`;
    await deleteFolderFromS3(s3Prefix);
    
    return res.status(200).json({ message: "Course assets successfully deleted from S3" });
  } catch (err) {
    console.error("Error deleting course assets:", err);
    return res.status(500).json({ message: "Failed to delete course assets" });
  }
};
