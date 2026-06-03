# Phase 2: Auth, Signup, and Guide Onboarding

This phase turns Mytra's prototype signup UI into a working user and guide application flow.

## Implemented

- `POST /api/auth/signup`
  - Validates name, email, password, and role.
  - Allows only `TRAVELER` and `GUIDE`.
  - Hashes passwords with bcrypt.
  - Prevents duplicate email registration.
  - Creates a pending guide profile for guide accounts.

- `POST /api/guides/apply`
  - Allows only authenticated guide users.
  - Captures city, bio, languages, interests, hourly rate, university, student ID, government ID placeholder, emergency contact, and availability note.
  - Stores guide applications as `PENDING_APPROVAL`.

- `PATCH /api/admin/guides/[id]/approval`
  - Allows only admins through `requireAdmin()`.
  - Supports `APPROVE`, `REJECT`, and `SUSPEND`.
  - Updates guide verification state and notifies the guide.

- Signup UI now submits to the backend and shows loading, success, and error states.
- Guide onboarding UI added at `/guide-dashboard/profile`.
- Guide dashboard shows pending, rejected, and suspended states.
- Admin guide approval UI uses the new approval endpoint.
- Public guide search excludes unapproved and incomplete guide profiles.

## Prisma Schema Changes

`GuideProfile` now includes:

- `studentId`
- `governmentId`
- `emergencyContact`
- `availabilityNote`

Guide status now uses:

- `PENDING_APPROVAL`
- `APPROVED`
- `REJECTED`
- `SUSPENDED`

## Migration Commands

Run locally after installing dependencies:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name phase-2-guide-onboarding
npm run lint
npm run build
```

For quick local prototyping against the existing SQLite database:

```bash
npx prisma db push
npx prisma generate
```

## Manual Test Checklist

1. Sign up as a traveler.
2. Confirm duplicate traveler email is rejected.
3. Confirm weak password is rejected.
4. Sign up as a guide.
5. Log in as the guide and confirm redirect to `/guide-dashboard`.
6. Open `/guide-dashboard/profile` and submit a guide application.
7. Confirm the guide dashboard shows the review state.
8. Log in as admin and open `/admin/guides`.
9. Approve the guide.
10. Confirm the guide appears in public guide search.
11. Reject or suspend a guide and confirm they disappear from public search.
