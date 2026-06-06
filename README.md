# HealthTrack

HealthTrack is a habit-tracking dashboard built with Next.js, Prisma, and MongoDB.
It helps users log daily habits, visualise streaks, track accuracy, earn badges, and manage account settings securely.

## About this project

HealthTrack was built as a full-stack productivity tool with a focus on consistency and accountability.
It combines client-side habit management, server-side analytics, and transactional email workflows so users can track habits, recover accounts, and stay motivated with badges and streaks.

The project is designed for easy deployment and development using modern tools like Next.js App Router, Prisma with MongoDB, and NextAuth for secure credential-based authentication.

## Features

- User authentication with email and password
- Daily habit tracking (boolean, timed, or page-count habits)
- Habit analytics, streaks, calendar heatmap, and monthly reports
- Password reset, email verification, and email change workflows
- Avatar upload support via Cloudinary
- Secure transactional email delivery using SMTP / Nodemailer

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma + MongoDB
- NextAuth credentials provider
- Nodemailer for email
- Cloudinary for avatar uploads

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env` file at the project root with the following values:

```env
DATABASE_URL="your-mongodb-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-long-random-secret"

EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password
EMAIL_FROM="HealthTrack <noreply@yourdomain.com>"

# Optional: only required for profile/avatar uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> For local development with MongoDB Atlas, use a connection string like `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`.

### 3. Initialize Prisma

```bash
pnpm prisma generate
pnpm prisma db push
```

### 4. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — start the development server
- `pnpm build` — build the production version
- `pnpm start` — start the production server
- `pnpm lint` — run ESLint

## Recommended Workflow

1. Register a new user via `/register`
2. Create and manage habits in the dashboard
3. Log habits daily and watch streaks + analytics update
4. Use settings to manage email, password, and profile uploads

## Notes

- Email delivery requires valid SMTP credentials.
- Avatar upload works only if Cloudinary environment variables are configured.
- `NEXTAUTH_SECRET` is strongly recommended for secure session signing in production.

## Project Structure

- `app/` — Next.js app routes and UI pages
- `app/api/` — API routes for auth, habits, stats, and settings
- `app/dashboard/` — authenticated dashboard pages, calendar, analytics, settings, and habit management
- `app/login/`, `app/register/`, `app/reset-password/` — auth and account recovery pages
- `lib/` — shared helpers for Prisma, email, and Cloudinary
- `prisma/` — Prisma schema and migrations
- `public/` — static assets
- `context/` — client-side user session state
- `types/` — custom TypeScript declarations and dotenv config types

## Folder structure

```
app/
  api/
    auth/
    badges/
    habits/
    settings/
    stats/
  dashboard/
    analytics/
    calendar/
    habits/
    insights/
    settings/
  login/
  register/
  reset-password/
  SessionProvider/
context/
lib/
  cloudinary.js
  email.js
  prisma.js
prisma/
public/
types/
README.md
package.json
pnpm-lock.yaml
tsconfig.json
next.config.mjs
``` 

## Deployment

This app can be deployed to Vercel or any Node-compatible hosting environment.
Ensure the production environment variables are set and the database is reachable from the deployment platform.
