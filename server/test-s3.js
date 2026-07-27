require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.R2_REGION || "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const bucketName = process.env.R2_BUCKET_NAME;

async function test() {
  const command = new ListObjectsV2Command({ Bucket: bucketName, Prefix: 'institutes/' });
  const response = await s3Client.send(command);
  console.log("Files:", response.Contents ? response.Contents.length : 0);
  if(response.Contents) {
     response.Contents.slice(0, 3).forEach(c => console.log(c.Key, c.Size));
  }
}
test().catch(console.error);
