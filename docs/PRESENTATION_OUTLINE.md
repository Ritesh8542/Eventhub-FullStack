# EventHub — Presentation Outline (12–15 slides)

1. **Title** — EventHub, name/college, BTech CSE (Data Science & AI), capstone.
2. **Introduction** — what EventHub is, in one line + live URL/QR.
3. **Problem Statement** — fragmented event discovery & manual registration.
4. **Objectives** — the 6 user-facing goals.
5. **Technology Stack** — frontend / backend / database / cloud table.
6. **System Architecture** — diagram (from `aws/ARCHITECTURE.md`) + data flow.
7. **AWS Services Implemented** — all 7, one line each with its role.
8. **Application Workflow** — user journey: register → browse → book → manage; admin journey.
9. **Implementation Screenshots** — Home, Event Details, My Bookings, Admin dashboard.
10. **Security Implementation** — JWT + bcrypt, IAM least-privilege role (no hardcoded keys), security groups, private S3 bucket.
11. **Live Demonstration** — script: login as demo user, book Tech Summit, show duplicate-booking error, cancel; login as admin, create an event, upload an image.
12. **Testing & Results** — test table (see `TEST_RESULTS.md`).
13. **Challenges & Solutions** — 3–4 rows (no-MongoDB fallback, S3 without keys, ALB cost).
14. **Conclusion & Future Scope** — payments, QR tickets, recommendations, HTTPS/CloudFront.
15. **Thank You / Q&A** — repo link, demo accounts (admin@eventhub.in / demo@eventhub.in — passwords on the slide only for the demo, change them after).
