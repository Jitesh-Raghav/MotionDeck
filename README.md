# Motiondeck — landing page

Marketing site and waitlist for Motiondeck. Built with Next.js (App Router), Tailwind CSS v4 and `motion`. The hero demo, charts and loops are code, not video.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Supabase keys, `npm run dev` saves waitlist signups to `.data/waitlist.dev.json` so you can test the form.

## Waitlist setup (Supabase)

1. Create a Supabase project.
2. Run `supabase/migrations/0001_waitlist.sql` in the SQL editor. It creates the `waitlist` table with row-level security on and no policies, so only the server key can write.
3. Copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API. The key is only read on the server.
4. On Vercel, add the same variables plus `NEXT_PUBLIC_SITE_URL`.

In production without keys, `/api/waitlist` returns an error rather than silently dropping emails.

Rate limiting is in memory (5 requests per 10 minutes per IP), so each serverless instance counts separately. If the form gets abused, move it to a shared store such as Upstash Redis.

## Before launch

- Replace the placeholder contact email in `src/lib/site.ts`.
- Set `NEXT_PUBLIC_SITE_URL` to the real domain.

## Where things live

- `src/app/globals.css` — design tokens (light and stage colors, type scale, radii, shadows), the reveal rules, grain and reduced-motion overrides
- `src/app/layout.tsx` — fonts, and the inline script that adds `.js` and the 1.5s reveal safety net
- `src/components/sections/` — one file per page section
- `src/components/deck/` — the pre-scripted example decks and the slide renderer. Slides size themselves from `--u`, so one slide works at 16:9, 1:1 and 9:16
- `src/components/hero/HeroShowcase.tsx` — the example chips and the product window (typing prompt, thumbnail rail, playhead, scroll tilt)
- `src/components/story/` — the pinned "How it works" story and its three scenes
- `src/components/anim/` — animation primitives (count-up, bars, line, timeline, list, compare, type reveal, section wipe). Each reads a clock `MotionValue`; `useLoopClock` loops them and pauses off screen
- `src/components/sections/MakerNote.tsx` — **placeholders to replace** (photo, name, role, note)
- `src/lib/waitlist/` — validation, rate limit, Supabase store, and the public count (shown only above 50)
- `src/app/api/waitlist/route.ts` — waitlist endpoint (validation, honeypot, rate limit)

## Checks

```bash
npm run lint
npm run build
```
