# EventHub — Project Report Outline

Use this as the skeleton for the final report (fill each section with screenshots and test evidence from `TEST_RESULTS.md` and your AWS Console).

1. **Abstract** — one paragraph: what EventHub is, the problem it solves, the stack (React, Node/Express, MongoDB, AWS ap-south-1), and the outcome (working app, 7 AWS services).
2. **Problem Statement** — event discovery/registration today is fragmented (spreadsheets, WhatsApp, manual lists); organisers have no single place to publish events, manage capacity, or collect registrations securely.
3. **Objectives** — user registration/login, event browsing/search, booking + cancellation, admin event management, image upload to S3, secure cloud deployment, scalability via ALB + Auto Scaling.
4. **Existing vs Proposed System** — existing: manual/social-media-based, no capacity control, no central records. Proposed: EventHub — centralised, authenticated, capacity-checked bookings, admin dashboard, cloud-hosted, scalable.
5. **Technology Stack** — table: React 18 + Vite, Node.js 20 + Express, Mongoose/MongoDB (in-memory fallback for local dev), JWT + bcrypt, Multer, AWS SDK v3, Nginx + PM2, Git/GitHub.
6. **AWS Services (7)** — EC2, S3, IAM, EBS, VPC, ALB, Auto Scaling: one subsection each — what it is, why it was used, exact configuration (see `aws/ARCHITECTURE.md` and `aws/DEPLOYMENT_GUIDE.md`).
7. **System Architecture** — diagram from `aws/ARCHITECTURE.md` + data-flow description + ER summary (User, Event, Booking).
8. **Implementation** — module walkthrough (auth, events, bookings, upload, frontend pages), key code snippets, screenshots of the running app and AWS Console at each step.
9. **Testing & Results** — test table from `TEST_RESULTS.md`: health, events list (6 seeded), register/login, booking, duplicate-booking rejection, cancel, admin CRUD, upload fallback, frontend build. Include actual outputs.
10. **Challenges & Solutions** — e.g. running without MongoDB (in-memory store), S3 without keys (IAM role), ALB cost (delete after demo), CORS/proxy (Vite + Nginx proxying `/api`).
11. **Conclusion & Future Scope** — what was achieved; future: payments (Razorpay/Stripe), email notifications, QR-code tickets, recommendations (fits the Data Science & AI specialisation), CloudFront + HTTPS, private-subnet database.
12. **References** — AWS docs, Express/Mongoose/React docs, MongoDB Atlas docs.
