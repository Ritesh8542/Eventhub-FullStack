# S3 bucket notes

- **Block all public access: ON.** Event images are not public objects.
- No bucket policy is needed for the app: the EC2 instance role (see `iam-role-policy.json`) grants `PutObject`/`GetObject`/`ListBucket` on this bucket only. The backend generates the URL after upload; the frontend displays it.
- If you later want public image display without signed URLs, add a CloudFront distribution in front of the bucket (out of scope for this capstone) — do **not** make the bucket public.
- Versioning: optional; enable it if you want to keep overwritten uploads.
- Lifecycle: optional rule to move old uploads to S3 Standard-IA after 90 days.
- Replace `eventhub-images-<your-name>-ap-south-1` in `iam-role-policy.json` and `backend/.env` (`AWS_S3_BUCKET`) with your real bucket name.
