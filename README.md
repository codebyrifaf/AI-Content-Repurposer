# ContentFlow

Production-ready AI content repurposing SaaS built with Next.js App Router,
TypeScript, Tailwind CSS, Supabase, and Gemini.

## Quick Start

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Structure

- `src/app` routes and API handlers
- `src/components` reusable UI, landing, and dashboard components
- `src/lib` core utilities and AI helpers
- `src/types` shared TypeScript types
