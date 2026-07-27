const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function test() {
  const s3Client = new S3Client({
    endpoint: process.env.R2_ENDPOINT,
    region: process.env.R2_REGION,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  const bucketName = process.env.R2_BUCKET_NAME;
  const command = new ListObjectsV2Command({ Bucket: bucketName });
  try {
    const response = await s3Client.send(command);
    response.Contents?.forEach(c => console.log(c.Key, c.Size));
  } catch (err) {
    console.error(err);
  }
}
test();
