# EventHub — AWS Cloud-Based Full-Stack Event Management System

BTech CSE (Data Science & AI) capstone project. React + Vite frontend, Node.js + Express backend, MongoDB (Mongoose) with a graceful in-memory fallback so it runs **without any database credentials**, and AWS deployment in Mumbai (`ap-south-1`).

## What it does

- Register / log in (JWT, bcrypt-hashed passwords, `user` / `admin` roles)
- Browse, search and filter events by category; view event details
- Register for events (bookings), view My Bookings, cancel a booking
- Admin dashboard: create / edit / delete events, upload event images
- Image upload: Amazon S3 when `AWS_S3_BUCKET` is set, otherwise local `backend/uploads/` (served at `/uploads/…`) — never crashes without AWS
- Bookings enforce capacity and prevent duplicate registration for the same event

## Demo accounts (seeded on startup)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@eventhub.in` | `Admin@123` |
| User | `demo@eventhub.in` | `Demo@123` |

## Run locally

```bash
# 1. Backend (terminal 1)
cd backend
npm install
cp .env.example .env        # optional; defaults work with no MongoDB / no AWS
npm start                   # http://localhost:5000  — /api/health

# 2. Frontend (terminal 2)
cd frontend
npm install
npm run dev                 # http://localhost:5173
npm run build               # production build (must succeed)
```

No MongoDB needed: with `MONGODB_URI` blank the app uses an in-memory store seeded with 6 events. To use a real database, set `MONGODB_URI` in `backend/.env` (MongoDB Atlas or local MongoDB) and restart — the same routes and Mongoose models are used.

## API

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/register` | — | `{name, email, password}` → `{token, user}` |
| POST | `/api/auth/login` | — | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/events?category=&search=` | — | List events |
| GET | `/api/events/:id` | — | Event details |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Delete event |
| POST | `/api/events/:id/upload` | Admin | Image upload (field `image`) → S3 or local |
| POST | `/api/bookings` | JWT | `{eventId, tickets?}` |
| GET | `/api/bookings/my` | JWT | My bookings |
| DELETE | `/api/bookings/:id` | JWT | Cancel own booking |

## Project structure

```
eventhub/
  backend/   Express API, Mongoose models, in-memory store, S3 util, seed data
  frontend/  React + Vite app (pages: Home, EventDetails, Login, Register, MyBookings, Admin)
  aws/       ARCHITECTURE.md, DEPLOYMENT_GUIDE.md, EC2 user-data, Nginx, PM2, IAM policy
  docs/      REPORT_OUTLINE.md, PRESENTATION_OUTLINE.md
  TEST_RESULTS.md  — actual local verification outputs
```

## AWS deployment summary

Region: `ap-south-1` (Mumbai). Full step-by-step guide in `aws/DEPLOYMENT_GUIDE.md` and architecture in `aws/ARCHITECTURE.md` — VPC, EC2 + EBS, IAM role (least-privilege S3), S3, Application Load Balancer, Auto Scaling Group. **Cost warning:** ALB + a second EC2 instance are not free-tier; create them only for the demo, then delete them. EC2 `t2.micro`/`t3.micro` + EBS 8 GB are free-tier eligible.

## Security notes

- Never commit `.env` or AWS keys. Use `.env.example` as the template.
- On EC2, S3 access comes from an **IAM role attached to the instance**, not hardcoded keys.
- Change `JWT_SECRET` in production. Demo passwords above are for local/demo use only.
- See `TEST_RESULTS.md` for the verified local test run.
