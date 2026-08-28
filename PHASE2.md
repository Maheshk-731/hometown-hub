# Hometown Hub — Phase 2 Plan

Phase 1 (built) covers the PRD's core scope: communities, posts, events, and
moderation on a responsive website. This document plans the five items
listed under the PRD's "Future Enhancements," in a suggested build order,
with what each would actually require on top of the current system.

## Suggested priority order

| # | Feature                        | Why this order |
|---|---------------------------------|-----------------|
| 1 | Multi-language support          | Highest reach-to-effort ratio; no new data model, unlocks the platform for non-English-speaking hometowns |
| 2 | Local marketplace / classifieds | Reuses existing patterns (post-like model, community scoping, moderation) — closest to a natural extension |
| 3 | Emergency alerts                | High value but needs careful design (push delivery, verification) so mistakes don't cause panic |
| 4 | Mobile application               | Big effort; best tackled once the web feature set is stable, so the API doesn't have to change under two clients at once |
| 5 | Government update integration    | Depends on external data-sharing agreements outside engineering's control — sequence last regardless of technical readiness |

## 1. Multi-language support

**Scope**: UI translated into the languages spoken in supported hometowns
(e.g. Hindi, Malayalam, Assamese, given the sample regions used in Phase 1).
User-generated content (posts, comments) stays in whatever language the
author wrote it in — this is UI/chrome translation, not content translation.

**What it needs**:
- An i18n library (e.g. `react-i18next`) and a translation-string extraction pass across all existing pages
- A language switcher, with the choice saved to the user's profile
- Right-to-left layout is not needed for the currently-listed languages, but worth confirming before ruling it out

**Not in scope for this phase**: auto-translating post/comment content between members who speak different languages.

## 2. Local marketplace / classifieds

**Scope**: Members of a community can list items or services for sale within that community — closer to a community bulletin board than a payments platform (the PRD explicitly keeps "paid features" out of scope).

**What it needs**:
- A new `Listing` model: title, description, price (display only, no checkout), category, images, community, seller, status (active/sold/removed)
- Listings scoped to a community, same membership-gating pattern already used for posts and events
- A report/moderation path, reusing the existing `Report` model and admin resolution flow
- No payment processing, escrow, or shipping — contact happens off-platform (e.g. via existing comments or a "contact seller" prompt), consistent with the PRD's "no paid features" constraint

## 3. Emergency alerts

**Scope**: Community moderators or platform admins can broadcast a time-sensitive alert (e.g. a local emergency, a safety notice) to all members of a community, distinct from ordinary posts.

**What it needs**:
- An `Alert` model separate from `Post`, with its own visual treatment (so it doesn't blend into the feed) and expiry
- Restricted creation: moderator/admin only, with a confirmation step given the stakes of a false alarm
- A delivery path beyond the in-app notification bell — likely push notifications or email, which means picking a delivery provider and handling opt-in/opt-out
- Rate-limiting or an approval step to prevent misuse, since this is the one feature with real potential for harm if abused

**Flagged for discussion**: the PRD groups this with "government/emergency alert integration" as out-of-scope for Phase 1, and that caution should probably carry into how conservatively Phase 2 treats it too — this may warrant a legal/liability review before building it, not just an engineering one.

## 4. Mobile application

**Scope**: Native or cross-platform (e.g. React Native) app covering the same core flows — browse/join communities, feed, events, notifications.

**What it needs**:
- The existing Express API already serves JSON and isn't tied to the web frontend, so it can serve a mobile client largely as-is
- Push notifications become viable here in a way the web version can't fully replicate, which also benefits the emergency-alerts feature above
- Realistically the largest single effort in this list — a separate build track, not an incremental add-on

## 5. Government update integration

**Scope**: Surfacing official local-government announcements or updates inside a community's feed.

**What it needs**:
- Identifying a data source per government body (API, RSS, or manual feed) — this varies by city/village and may not exist for most of them
- A trust/verification layer so official content is visually distinguishable from member posts
- This is the item most likely to stall on factors outside the codebase (availability of official data, verification of legitimacy), so it's reasonable to treat as exploratory rather than scheduled

---

**Not making any code changes for this phase yet** — this is a planning reference for when you're ready to scope and prioritize the actual build.
