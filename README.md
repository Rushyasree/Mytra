# Mytra - Your Local Friend in Every City

Mytra is a premium travel platform that connects international travelers with verified local guides (college students) for authentic, safe, and memorable experiences across India.

## Features

- **Personalized AI Itineraries**: Powered by Google Gemini AI, Mytra generates custom travel plans based on real platform data.
- **Verified Local Guides**: Connect with passionate college students who know their cities best.
- **Curated Experiences**: From food walks to heritage tours, discover hidden gems.
- **Modern UI**: A premium, responsive design built with Next.js, Tailwind CSS, and Framer Motion.

## Tech Stack

- **Frontend**: Next.js 15+, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **Database**: PostgreSQL with Prisma migrations
- **Auth**: NextAuth.js

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and set:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GEMINI_API_KEY`
4. Run migrations: `npx prisma migrate dev`
5. Optional demo data: `npx tsx prisma/seed.ts`
6. Start the dev server: `npm run dev`

## Deploying on Vercel

1. Create a PostgreSQL database using Neon, Supabase, Railway, or another hosted provider.
2. Add `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `GEMINI_API_KEY` in Vercel Project Settings.
3. Run production migrations before the first production deployment:

```bash
npx prisma migrate deploy
```

4. Deploy through the Vercel Git integration or run:

```bash
npm install
npm run build
```

The build command runs `prisma generate` automatically before `next build`.

## Branding

- **Domain**: [getmytra.vercel.app](https://getmytra.vercel.app)
- **Tagline**: Your Local Friend in Every City
- **Support**: support@getmytra.com

---
© 2026 Mytra Technologies. All rights reserved.
