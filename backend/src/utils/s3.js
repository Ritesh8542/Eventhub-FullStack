// S3 upload (AWS SDK v3). Only used when AWS_S3_BUCKET is set.
// Uses the default credential chain — on EC2 that is the IAM role, so
// NO access keys are hardcoded. Returns null when S3 is not configured
// or the upload fails; the caller then falls back to local storage.
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION || 'ap-south-1';

let client = null;
if (bucket) {
  client = new S3Client({ region }); // credentials from env / IAM role / shared config
}

function isS3Configured() { return Boolean(bucket && client); }

async function uploadToS3(buffer, key, contentType) {
  if (!isS3Configured()) return null;
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: buffer, ContentType: contentType,
    }));
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  } catch (err) {
    console.error('[s3] Upload failed, falling back to local storage:', err.message);
    return null;
  }
}

module.exports = { uploadToS3, isS3Configured };
