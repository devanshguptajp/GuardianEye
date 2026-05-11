# GuardianEye

A parental monitoring web app with real-time visibility into children's digital activity — app time, websites, location, and AI-flagged risks — across Android and iPhone.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080 in dev, reads $PORT)
- `pnpm --filter @workspace/guardianeye run dev` — run the React frontend (reads $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — Clerk auth (server)
- Required env: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PROXY_URL` — Clerk auth (frontend)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v3 (PostCSS, NOT @tailwindcss/vite) + wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (replaces original Supabase auth)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/guardianeye/` — React frontend app
- `artifacts/api-server/` — Express API server
- `lib/db/` — Drizzle schema + migrations (source of truth for DB)
- `lib/api-spec/` — OpenAPI YAML spec (source of truth for API contract)
- `lib/api-client-react/` — Orval-generated TanStack Query hooks
- `lib/api-zod/` — Orval-generated Zod schemas

## Architecture decisions

- Supabase auth replaced with Clerk; `profiles` table uses Clerk user ID (text) as primary key
- react-router-dom replaced with wouter throughout the frontend
- API routes all nested under `/api/` prefix; child-scoped routes use `/children/:childId/...` pattern
- `req.params[x]` must be cast via `String(req.params["key"])` due to Express 5 typing `params` as `string | string[]`
- Orval-generated query hooks require `UseQueryOptions` with `queryKey`; call sites use `{ enabled: ... } as any` to satisfy the type

## Product

- Landing page with feature overview, pricing, and CTA
- Clerk-powered sign-in / sign-up (email + Google OAuth)
- Parent dashboard with sidebar navigation
- Per-child: app time limits with daily caps, web blocklist (domain + category), device pairing via QR code, AI alerts, overview stats
- Child view preview page (what the child sees on their device)
- Premium tier gating for AI alerts, category web filtering, auto-lock
- Parent PIN for sensitive operations (delete child, change settings)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Tailwind v3 uses PostCSS config — do NOT switch to `@tailwindcss/vite` plugin
- `pnpm approve-builds` may be needed after `pnpm install` if `@clerk/shared` build scripts are blocked
- After any DB schema change, run `pnpm --filter @workspace/db run push` then `pnpm --filter @workspace/api-spec run codegen`
- The old Supabase/Lovable integration files (`src/integrations/supabase/client.ts`, `src/integrations/lovable/index.ts`) are stubbed out as `export {}` — do not delete or they may cause import errors in dead code

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Clerk skill at `.local/skills/clerk-auth` for auth configuration details
