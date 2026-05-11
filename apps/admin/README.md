# ContentFlow Admin App

Separate owner/admin panel for ContentFlow.

## Run

From repository root:

```bash
npm run dev:admin
```

This starts the admin app on `http://localhost:3001`.

## Required environment variables

Set these in the **root** `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PANEL_EMAIL`
- `ADMIN_PANEL_PASSWORD_HASH`
- `ADMIN_PANEL_SESSION_SECRET`

Optional:

- `ADMIN_PANEL_SESSION_TTL_SECONDS` (default: `43200`)

`npm run dev:admin` auto-syncs these values into `apps/admin/.env.local`.
