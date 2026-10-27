# Job Tracker

**Live app:** https://job-tracker-rouge-three.vercel.app
**Try it without signing up:** https://job-tracker-rouge-three.vercel.app/?demo

Track job applications on a Kanban board. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** and **Supabase** (Postgres, email/password auth, row-level security).

## Features
- **Demo mode:** open the app with sample data, no account needed. Demo data is saved only in your browser (localStorage).
- **Kanban board:** Wishlist → Applied → Interview → Offer → Rejected. Drag cards between columns, or use the status menu on each card (works on phones and with the keyboard).
- **Stats:** total applications, in progress, interviews, offers and response rate.
- **Search** across company, role and notes, and **CSV export** for spreadsheets.
- **Auth and privacy:** Supabase Auth, and row-level security so each user can only read and change their own jobs.
- Responsive layout with loading, empty and error states.

## How it's built
- `lib/jobs.ts`: types and pure functions (stats, search, CSV, dates), covered by unit tests.
- `lib/store.ts`: a small `JobStore` interface with two implementations: `supabaseStore` (real data) and `demoStore` (localStorage). The board works the same with either one.
- `supabase/schema.sql`: the `jobs` table and its row-level security policies.

## Setup
1. Create a free project at supabase.com.
2. Run `supabase/schema.sql` in the SQL Editor.
3. `cp .env.example .env.local` and fill in your project URL and anon key (Project Settings → API).
4. `npm install && npm run dev`, then open http://localhost:3000.

In Supabase → Authentication → Providers → Email you can turn off "Confirm email" for easier local testing.

## Scripts
- `npm test`: unit tests (Vitest)
- `npm run lint`: ESLint
- `npm run build`: production build
