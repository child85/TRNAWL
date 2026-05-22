# Supabase

This folder contains TRNAWL database migrations.

## Required Environment Values

Frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Backend only:

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
ANTHROPIC_API_KEY=
```

## Applying Migrations

Apply migrations with the Supabase CLI or a direct Postgres connection.

The publishable and secret API keys can call Supabase APIs, but they cannot create tables. Schema changes require database credentials.

## Current Schema Direction

The database starts with:

- ticket board tables
- workflow stages
- workflow templates
- New SOW workflow task templates
- customer action register
- operational brief storage
- readiness and blocker fields on tickets
