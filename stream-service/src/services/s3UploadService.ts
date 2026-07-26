import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT || "https://<ACCOUNT_ID>.r2.cloudflarestorage.com",
  region: process.env.R2_REGION || "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const uploadToS3 = async (localDirPath: string, s3Prefix: string): Promise<void> => {
  const bucketName = process.env.R2_BUCKET_NAME || "";
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME is not defined in environment variables.");
  }

  const files = fs.readdirSync(localDirPath);
  
  const uploadPromises = files.map(async (file) => {
    const filePath = path.join(localDirPath, file);
    
    // Only upload files, skip any accidental directories
    if (fs.statSync(filePath).isFile()) {
      const fileBuffer = fs.readFileSync(filePath);
      let contentType = "application/octet-stream";
      let cacheControl = "public, max-age=31536000"; // Cache segments for 1 year
      
      if (file.endsWith(".m3u8")) {
        contentType = "application/vnd.apple.mpegurl";
        cacheControl = "no-cache, no-store, must-revalidate"; // Playlists must not be cached
      } else if (file.endsWith(".m4s")) {
        contentType = "video/iso.segment";
      } else if (file.endsWith(".mp4")) {
        contentType = "video/mp4";
      }

      const uploadParams = {
        Bucket: bucketName,
        Key: `${s3Prefix}/${file}`,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: cacheControl,
      };

      let retries = 3;
      while (retries > 0) {
        try {
          await s3Client.send(new PutObjectCommand(uploadParams));
          console.log(`Uploaded ${file} successfully to S3`);
          break; // Success, exit retry loop
        } catch (err) {
          retries--;
          console.error(`Error uploading ${file} (${3 - retries}/3 attempts failed):`, err);
          if (retries === 0) throw err;
          // Wait 2 seconds before retrying
          await new Promise(res => setTimeout(res, 2000));
        }
      }
    }
  });

  // Wait for all chunks and playlists to finish uploading
  await Promise.all(uploadPromises);
};

export const uploadDirectlyToS3 = async (localFilePath: string, s3Key: string, mimeType: string): Promise<string> => {
  const bucketName = process.env.R2_BUCKET_NAME || "";
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME is not defined in environment variables.");
  }

  const fileBuffer = fs.readFileSync(localFilePath);
  
  const uploadParams = {
    Bucket: bucketName,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType,
    CacheControl: "public, max-age=31536000", // Cache for 1 year
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`Uploaded ${s3Key} successfully to S3`);
    const cdnBase = process.env.R2_PUBLIC_DEV_URL || "https://cdn.lumenlms.com";
    return `${cdnBase}/${s3Key}`;
  } catch (err) {
    console.error(`Error uploading ${s3Key}:`, err);
    throw err;
  }
};

export const downloadFromS3 = async (s3Key: string, localFilePath: string): Promise<void> => {
  const bucketName = process.env.R2_BUCKET_NAME || "";
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME is not defined in environment variables.");
  }

  const downloadParams = {
    Bucket: bucketName,
    Key: s3Key,
  };

  try {
    const { Body } = await s3Client.send(new GetObjectCommand(downloadParams));
    if (!Body) throw new Error("No body returned from S3");

    // We need to wait for the stream to finish writing
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(localFilePath);
      // Compatibility casting for Node stream from AWS SDK stream
      (Body as any).pipe(writeStream);
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);
    });
    
    console.log(`Downloaded ${s3Key} successfully to ${localFilePath}`);
  } catch (err) {
    console.error(`Error downloading ${s3Key}:`, err);
    throw err;
  }
};

export const deleteFolderFromS3 = async (prefix: string): Promise<void> => {
  const bucketName = process.env.R2_BUCKET_NAME || "";
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  try {
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const listParams: any = {
        Bucket: bucketName,
        Prefix: prefix,
      };
      if (continuationToken) listParams.ContinuationToken = continuationToken;

      const listResponse = await s3Client.send(new ListObjectsV2Command(listParams));

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
          },
        };

        await s3Client.send(new DeleteObjectsCommand(deleteParams));
        console.log(`Deleted ${listResponse.Contents.length} objects from ${prefix}`);
      }

      isTruncated = listResponse.IsTruncated ?? false;
      continuationToken = listResponse.NextContinuationToken;
    }
    console.log(`Successfully deleted entire folder: ${prefix}`);
  } catch (error) {
    console.error("Error deleting folder from S3:", error);
    throw error;
  }
};
