# EventHub — Test Results (local verification)

**Date:** 2026-11-26 (system time 2026-11-25 UTC) · **Environment:** Node v24.22.1, npm 10.9.4 · **Mode:** no MongoDB, no AWS — in-memory store + local upload fallback (the intended local defaults).

## 1. Backend install

```
cd backend && npm install
added 156 packages in 13s   (exit 0)
```
One warning only: `multer@1.4.5-lts.2` deprecated (vulnerabilities patched in Multer 2.x) — noted as a future upgrade, does not block the demo.

## 2. Backend startup

```
$ PORT=5000 node server.js
[db] No MONGODB_URI set — using in-memory store (no MongoDB needed).
[seed] Admin created: admin@eventhub.in / Admin@123
[seed] Demo user created: demo@eventhub.in / Demo@123
[seed] Seeded 6 events
[server] EventHub API running on http://localhost:5000
```

## 3. API tests (20 checks, all passed)

Script: `/tmp/test_api.sh` run against `http://localhost:5000/api`. Summary:

| # | Check | Result |
| --- | --- | --- |
| 1 | `GET /api/health` | ✅ `{"status":"ok","service":"eventhub-backend",...}` |
| 2 | `GET /api/events` | ✅ count: **6** — Startup Pitch Night, AI & ML Workshop, Data Science Bootcamp, CodeSprint Hackathon 2027, Tech Summit 2027, Mumbai Music Fest |
| 3 | `GET /api/events?category=Workshop` | ✅ workshop count: 2 |
| 4 | `POST /api/auth/register` (test@eventhub.in) | ✅ 201, user returned, token present |
| 5 | Register duplicate email | ✅ 400 `Email already registered` |
| 6 | `POST /api/auth/login` (admin@eventhub.in) | ✅ token present |
| 7 | Login wrong password | ✅ 401 `Invalid email or password` |
| 8 | `GET /api/auth/me` (admin token) | ✅ `{"id":"1","name":"Admin","email":"admin@eventhub.in","role":"admin"}` |
| 9 | Demo login | ✅ token present |
| 10 | `POST /api/bookings` (demo, Startup Pitch Night) | ✅ 201, booking id 10, status `confirmed` |
| 11 | Duplicate booking | ✅ 400 `You are already registered for this event` |
| 12 | `GET /api/bookings/my` | ✅ 1 booking, status `confirmed` |
| 13 | Booking without token | ✅ 401 `No token provided` |
| 14 | `DELETE /api/bookings/10` (cancel) | ✅ status `cancelled` |
| 15 | `GET /api/bookings/my` after cancel | ✅ booking listed as `cancelled` |
| 16 | `POST /api/events` as non-admin | ✅ 403 `Admin access required` |
| 17 | `POST /api/events` as admin | ✅ 201, event id 11 created |
| 18 | `POST /api/events/11/upload` (image) | ✅ `storage: local`, `imageUrl: /uploads/11-…-test-image.png` (S3 not configured locally, as designed) |
| 19 | `DELETE /api/events/11` as admin | ✅ 200 `Event deleted` |
| 20 | `GET /api/events` final count | ✅ count: 6 (back to seeded set) |

## 4. Frontend install & build

```
cd frontend && npm install
added 90 packages in 24s   (exit 0)

$ npm run build
vite v5.4.21 building for production...
✓ 102 modules transformed.
dist/index.html                   0.39 kB
dist/assets/index-D4JSrU5z.css    2.76 kB
dist/assets/index-BoM9LgfV.js   235.13 kB
✓ built in 1.91s   (exit 0)
```

## 5. Frontend preview smoke test

```
npx vite preview --port 4173
curl http://localhost:4173/  →  HTTP 200, served dist/index.html (EventHub title + JS/CSS assets)
```

## 6. Not tested here (needs AWS / real credentials)

- Actual AWS deployment (EC2, VPC, ALB, ASG, S3 upload to a real bucket, IAM role on EC2) — **not done**: no AWS account/credentials were available. The AWS part is guides + scripts only (`aws/`). Follow `aws/DEPLOYMENT_GUIDE.md` on a real account.
- Real MongoDB (Atlas/local) connection — code path exists (`src/config/db.js` + Mongoose models) but was not exercised; local run used the in-memory fallback.
- Browser end-to-end click-through — API + build + preview verified; UI was not driven in a live browser in this run.

## 7. Cleanup after testing

- Test upload file removed from `backend/uploads/` (only `.gitkeep` remains).
- Backend server stopped; no servers left running. In-memory test data (test user, test booking) disappears on restart by design.
