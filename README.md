# Job Tracker

Track job applications on a status board. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** and **Supabase** (Postgres, email/password auth, row-level security).

## Features
- Sign up / log in with Supabase Auth
- Add, edit, delete jobs (CRUD) and move them between Wishlist → Applied → Interview → Offer → Rejected
- Row-level security: every user only sees their own jobs
- Responsive layout, loading and error states

## Setup
1. Create a free project at supabase.com.
2. Run `supabase/schema.sql` in the SQL Editor.
3. `cp .env.example .env.local` and fill in your project URL and anon key (Project Settings → API).
4. `npm install && npm run dev`, open http://localhost:3000.

In Supabase → Authentication → Providers → Email you can turn off "Confirm email" for easier local testing.
