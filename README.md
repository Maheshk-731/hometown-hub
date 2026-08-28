# Hometown Hub — Digital Community Platform

A full-stack web platform that connects people from the same city or village — wherever they've moved — through communities, posts, events, and moderation tools. Built with the MERN stack (MongoDB, Express, React, Node.js).

**Github Repo:** https://github.com/Maheshk-731/hometown-hub
**Live app(frontend):** https://hometown-hub-murex.vercel.app
**Live API(backend):** https://hometown-hub-backend-3yuc.onrender.com
*(hosted on Render's free tier — the first request after a period of inactivity may take 20–30 seconds while the server wakes up)*

## Tech stack

| Layer      | Technology                                     |
|------------|-------------------------------------------------|
| Frontend   | React (Vite), React Router, Bootstrap 5, Axios   |
| Backend    | Node.js, Express                                 |
| Database   | MongoDB (Mongoose)                               |
| Auth       | JWT (jsonwebtoken), bcryptjs                     |

## Project structure

```
hometown-hub/
├── backend/
│   ├── src/
│   │   ├── config/        # MongoDB connection
│   │   ├── controllers/   # Route logic
│   │   ├── middleware/    # Auth (JWT) middleware
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routers
│   │   └── server.js      # App entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/             # Axios calls to the backend
    │   ├── components/      # Reusable UI pieces
    │   ├── context/         # AuthContext (global auth state)
    │   ├── pages/           # Route-level pages
    │   └── styles/theme.css # Design tokens
    ├── .env.example
    └── package.json
```

## Features

- **Auth** — register/login with JWT, protected routes, editable profile (hometown, current location, bio)
- **Communities** — create (pending platform approval), browse/search, "My communities" view, join/leave, per-community roles (member/moderator/admin)
- **Posts** — community feed, image attachments, likes, comments, share (native share sheet or copy-link), permalink page, moderation (delete by author or community mod/admin)
- **News / announcements** — community moderators/admins can mark a post as news; shows in a dedicated global News tab across all your communities
- **Events** — create, RSVP, community moderator can cancel/update; global Events tab shows upcoming events across all your communities, filterable to just what you're attending
- **Community chat** — per-community group chat (polling-based), members-only
- **Notifications** — in-app bell for membership decisions and community approval
- **Reports** — users can report posts; platform admins resolve/dismiss
- **Platform admin dashboard** — approve/reject new communities, manage user roles, review reports
- **Community moderator dashboard** — approve/reject join requests

## Running locally

### Prerequisites
- Node.js 18+
- A MongoDB instance — either [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free tier, cloud) or MongoDB installed locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGO_URI to your MongoDB connection string,
# JWT_SECRET to a long random string, and CLOUDINARY_CLOUD_NAME /
# CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET from your (free) Cloudinary
# account — required for image uploads to work, even locally.
npm run dev
```

The API runs at `http://localhost:5000`. Confirm it's up: `GET http://localhost:5000/api/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL defaults to http://localhost:5000/api — adjust if your backend runs elsewhere.
npm run dev
```

Open the local URL Vite prints (typically `http://localhost:5173`).

### 3. Make yourself a platform admin (optional)

New accounts default to the `user` role. To test the admin dashboard, register a user, then update their role directly in the database:

```js
// In a mongo shell or MongoDB Compass, against your database:
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Deploying to production

This app deploys as two separate services: the backend API and the frontend static site, plus a managed MongoDB database.

### Step 1 — Database (MongoDB Atlas, free tier)
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a database user and password.
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) for simplicity, or your host's IP range.
4. Copy the connection string (`mongodb+srv://...`) — this is your `MONGO_URI`.

### Step 2 — Backend (Render, free tier)
1. Push this repo to GitHub.
2. Sign up for a free [Cloudinary](https://cloudinary.com) account (used to store uploaded images so they survive redeploys — see note below). From your Cloudinary Dashboard, copy your Cloud Name, API Key, and API Secret.
3. On [render.com](https://render.com), create a **New Web Service**, connect your repo, and set:
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
4. Add environment variables (from `backend/.env.example`):
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — a long random string
   - `CORS_ORIGIN` — your frontend's URL once deployed (Step 3), e.g. `https://hometown-hub.vercel.app`
   - `NODE_ENV=production`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from your Cloudinary Dashboard
5. Deploy. Note the resulting URL, e.g. `https://hometown-hub-api.onrender.com`.

*(Railway or Fly.io work the same way if you prefer them over Render.)*

### Step 3 — Frontend (Vercel, free tier)
1. On [vercel.com](https://vercel.com), import the same GitHub repo.
2. Set **Root directory** to `frontend`.
3. Add environment variable: `VITE_API_URL=https://hometown-hub-api.onrender.com/api` (your Render URL from Step 2, with `/api` appended).
4. Deploy. Vercel auto-detects the Vite build settings.

*(Netlify works the same way if you prefer it.)*

### Step 4 — Connect them
Go back to Render and set `CORS_ORIGIN` to your final Vercel URL, then redeploy the backend so it accepts requests from the live frontend.

### A note on uploaded images
Post, community, and profile images are uploaded straight to Cloudinary (free tier) rather than the backend's local disk, so they persist across redeploys and restarts — including on free hosts like Render, which use an ephemeral filesystem that would otherwise wipe local files on every deploy.

## Notes on scope

Per the project's PRD, this build covers the Phase 1 in-scope features (web-responsive platform, community creation, posts, events, moderation). Out-of-scope for this phase: native mobile apps, paid features, and government/emergency alert integrations.

-by Mahesh Kumar