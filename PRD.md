# Hometown Hub — Product Requirements Document

*A digital community platform connecting people to their hometown — past and present residents of a city or village.*

## 1. Overview

Hometown Hub is a full-stack community platform that lets people find and join a shared space for the city or village they are from — whether they still live there or have since moved away. Members share posts, organize events, and stay connected to local news and each other, moderated by community-level admins and a platform-level admin.

## 2. Goals

- Let anyone create or join a community tied to a specific city or village.
- Give communities a lightweight feed for posts, discussion, and local news.
- Support organizing and RSVPing to community events.
- Keep communities self-moderated, with escalation to platform admins when needed.
- Keep the scope realistic for a single-developer, single-semester build.

## 3. Target users

- Residents of a city/village looking for hyperlocal community and news.
- People who have moved away and want to stay connected to their hometown.
- Community organizers who want a space to post announcements and events.

## 4. Core features (in scope)

| Feature area | Requirement |
|---|---|
| Accounts | Register/login with email + password (JWT-based sessions); editable profile with hometown, current city, bio, and photo. |
| Communities | Create a community tied to a city/village; browse and search communities; join/leave; join requests requiring moderator approval; editable name, description, logo, and cover photo; admin-only permanent deletion. |
| Community feed | Text and image posts within a community; like, comment, and share; moderators can pin posts or mark them as announcements. |
| Events | Create events with a date, time, location, and cover photo; RSVP/attend; a personal "my events" view across all joined communities. |
| News | Cross-community feed of posts marked as announcements by moderators. |
| Notifications | In-app notifications for join approvals, comments, and other relevant activity. |
| Community moderation | Per-community moderator/admin roles; approve or reject join requests; pin/unpin and remove posts. |
| Platform administration | Approve or reject newly created communities; manage user accounts and roles; review and resolve user-submitted reports. |
| Reporting | Users can report posts, comments, or communities for moderator/admin review. |
| Community chat | Lightweight real-time-style chat scoped to a single community, members-only. |

## 5. Out of scope

- Native mobile apps (iOS/Android) — web-only for this version.
- Paid advertising or promoted content.
- AI-based content moderation.
- Government or emergency alert integrations.

## 6. Tech stack

- **Frontend:** React (Vite), React Router, Axios, Bootstrap with a custom theme.
- **Backend:** Node.js, Express, JWT authentication, bcrypt password hashing.
- **Database:** MongoDB (Mongoose ODM), hosted on MongoDB Atlas.
- **Image storage:** Cloudinary.
- **Hosting:** Vercel (frontend), Render (backend).

## 7. Non-functional requirements

- Role-based access control enforced on the backend for every moderation/admin action, not just hidden in the UI.
- Images capped at 5MB, restricted to JPEG/PNG/WEBP/GIF.
- Responsive layout usable on both desktop and mobile browsers.
- A distinct visual identity (custom color palette, typography, and iconography) rather than a generic template look.

## 8. Future enhancements (not built in this version)

- Multi-language support.
- Local marketplace/classifieds within a community.
- Emergency alerts (flagged as needing legal/misuse review before building).
- Native mobile app.
- Government update integration.
