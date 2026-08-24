# vBB — Automated Broken Link Building Suite

vBB is the Smarketers Family Off Page Suite workflow for turning dead resources into qualified outreach opportunities. It ingests domains and URLs, applies a DR/authority threshold, validates hard and soft 404s, checks the Wayback Machine, reconstructs replacement content, and schedules a three-touch seven-day sequence.

## What is included

- Next.js App Router dashboard with React, Tailwind CSS, shadcn-style components, Lucide icons, and Framer Motion notifications.
- CSV drag-and-drop and manual bulk target entry, with supplied or deterministic estimated authority filtering above 50.
- Live HTTP validation for hard 404/410/5xx failures, unreachable targets, and common soft-404 language.
- Free Wayback Machine availability lookup and complete rule-based replacement drafts.
- Durable campaigns, targets, reconstructed content, and sequence steps in SQLite-compatible Cloudflare D1.
- Three-touch outreach cadence scheduled for day 1, day 3, and day 7.
- Optional BullMQ worker with Redis for horizontally scaled validation outside the hosted Worker runtime.
- Strict light theme, responsive navigation, campaign metrics, filters, status toasts, and an animated system trust bar.

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer
- No paid API keys are required

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The local Sites runtime provisions D1 through Miniflare; its storage is SQLite-backed and remains project-local. Tables and indexes are created on the first dashboard API request, and representative records are seeded once so every product surface is immediately usable.

On macOS or Linux, replace the `copy` command with `cp .env.example .env.local`.

## Database and migrations

The runtime schema is defined in `db/schema.ts`. The equivalent portable SQLite migration is in `migrations/0001_initial.sql`. Startup uses idempotent `CREATE TABLE IF NOT EXISTS` statements, prepared D1 queries, indexed status lookups, and `PRAGMA optimize`, so no separate local migration command is required.

Core tables:

- `campaigns`: campaign totals and processing state
- `targets`: normalized URLs, authority, validation, archive, and contact details
- `content_reconstructions`: complete replacement-resource drafts
- `sequence_steps`: subjects, bodies, schedule dates, and delivery state

## CSV format

CSV headers are detected case-insensitively. Use `url`, `domain`, or `target` for the target column and `dr`, `da`, `domain rating`, or `authority` for the optional score.

```csv
url,domain rating
https://example.com/old-guide,72
publisher.example/resources,64
```

Rows with authority 50 or lower are excluded. When authority is absent, vBB generates a stable local estimate so the free workflow remains deterministic.

## Optional BullMQ worker

The hosted app works without Redis. For high-volume Node.js deployments, start Redis locally, set `REDIS_URL`, and run:

```bash
npm run worker
```

The worker validates up to eight targets concurrently, rate-limits fetches, reports progress, returns typed results, and shuts down cleanly on `SIGINT` or `SIGTERM`.

## Verification and production build

```bash
npm run lint
npm run build
```

Set `SITE_URL` to the canonical HTTPS origin before building a non-Sites deployment so Open Graph and X image URLs are absolute. The Sites deployment flow provisions the declared `DB` binding from `.openai/hosting.json` and serves the Worker-compatible ESM output produced by Vinext.

## API

- `GET /api/campaigns` returns campaigns, recent targets, and dashboard totals.
- `POST /api/campaigns` accepts `{ "name": string, "targets": [{ "url": string, "authority"?: number }] }`, filters and normalizes targets, validates them, archives broken resources when possible, creates replacement drafts, and queues all outreach steps.

The POST endpoint accepts at most 50 targets per request and uses bounded fetch timeouts to keep scans predictable.
