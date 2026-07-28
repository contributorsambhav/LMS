import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function main() {
  try {
    console.log("Setting CORS on bucket:", process.env.R2_BUCKET_NAME);
    const command = new PutBucketCorsCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: [],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    });

    const response = await s3Client.send(command);
    console.log("CORS configured successfully:", response);
  } catch (error) {
    console.error("Error setting CORS:", error);
  }
}

main();
