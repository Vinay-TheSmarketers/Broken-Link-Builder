# Automated Broken Link Building Tool & Link Reclamation Suite — vBB

**vBB (Automated Broken Link Building Suite)** is an enterprise-ready **off-page SEO automation** platform and **dead link finder** engineered to transform broken resources into high-authority backlink opportunities. As a core component of the **Smarketers Off-Page Suite**, vBB streamlines the end-to-end **link reclamation** lifecycle—from bulk prospect ingestion and Domain Rating (DR 50+) authority filtering to deep HTTP validation, historical Wayback Machine analysis, automated replacement content reconstruction, and multi-touch outreach cadences.

---

## Overview & Workflow Architecture

The **broken link building tool** provides search engine optimization specialists with a structured, automated pipeline that replaces tedious manual prospecting with deterministic discovery and content reconstruction.

```
[ Target Ingestion (CSV / Bulk URLs) ]
                 │
                 ▼
[ Authority Threshold Filter (DR 50+) ]
                 │
                 ▼
[ Live HTTP & Soft-404 Validation ]
                 │
                 ▼
[ Wayback Machine Archive Retrieval ]
                 │
                 ▼
[ Automated Replacement Content Drafting ]
                 │
                 ▼
[ 3-Touch 7-Day Email Outreach Cadence ]
```

---

## Key Features

- **CSV Drag-and-Drop & Bulk Ingestion**: Import hundreds of target URLs or domains instantly with case-insensitive CSV header mapping (`url`, `domain`, `target`, `dr`, `da`, `authority`).
- **High-Authority Filtering (DR 50+)**: Focus link acquisition efforts exclusively on authoritative targets. The engine automatically filters out low-authority prospects and generates deterministic estimates when third-party metrics are not provided.
- **Deep HTTP & Soft-404 Validation**: Accurately isolate broken links by testing for hard HTTP failures (`404 Not Found`, `410 Gone`, `5xx Server Errors`), network timeouts, DNS resolution failures, and common soft-404 patterns within response bodies.
- **Wayback Machine Snapshot Retrieval**: Automatically interface with archive.org's Wayback Machine API to pull historical snapshots of broken URLs, preserving original topical context.
- **Automated Replacement Content Reconstruction**: Automatically generate contextually relevant, production-ready replacement content drafts from archived snapshots, providing publishers with immediate replacement value.
- **Three-Touch, Seven-Day Outreach Sequence**: Schedule automated, structured outreach and follow-up templates across an optimized cadence (Day 1 initial pitch, Day 3 value-add follow-up, Day 7 final touch) to maximize conversion rates.
- **Durable Serverless & SQLite Persistence**: Store campaigns, targets, content reconstructions, and outreach steps in Cloudflare D1 / SQLite with indexed queries, prepared statements, and zero configuration setup.
- **High-Throughput BullMQ / Redis Worker (Optional)**: Scale validation horizontally with a dedicated background queue processing up to 8 concurrent targets with strict rate-limiting and graceful shutdown handlers.

---

## Technology Stack

vBB is built on a modern, high-performance TypeScript and React stack:

### Frontend & User Interface
- **Framework**: Next.js (App Router) & React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component System**: shadcn-style accessible UI primitives
- **Icons**: Lucide React
- **Micro-Interactions**: Framer Motion (animated status toasts, system trust bar)

### Backend & Infrastructure
- **Runtime**: Node.js / Cloudflare Workers runtime (Vinext ESM output)
- **Database Layer**: Cloudflare D1 / SQLite (idempotent schema migrations, prepared statements)
- **Background Queue**: BullMQ & ioredis (optional for high-volume worker offloading)

---

## Target Audience & Use Cases

### 1. Off-Page SEO Specialists & Digital Agencies
Automate client link reclamation campaigns at scale. Identify high-DR dead links on top industry resources, draft pitch-ready replacement content, and execute outreach sequences without leaving the dashboard.

### 2. In-House SEO & Growth Teams
Reclaim lost link equity from competitor dead pages, discontinued products, or industry rebrands. Secure editorial backlinks from authoritative websites (DR 50+) relevant to your niche.

### 3. Content Marketers & Link Builders
Discover content gaps where dead resources previously ranked or earned links. Reconstruct modernized, superior replacement guides and pitch publishers directly with automated 3-touch cadences.

---

## Getting Started

### Prerequisites
- Node.js 22.13 or newer
- npm 10 or newer
- (Optional) Redis instance for background worker execution

### Installation & Local Setup

1. **Clone the repository and install dependencies**:
   ```bash
   git clone <repository-url>
   cd "Broken Link Builder"
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   # Windows (PowerShell / Command Prompt)
   copy .env.example .env.local

   # macOS / Linux
   cp .env.example .env.local
   ```

3. **Launch the development server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`. SQLite tables in Miniflare D1 will provision and seed representative records automatically on the first request.

4. **(Optional) Run the BullMQ background worker**:
   ```bash
   # Ensure REDIS_URL is configured in .env.local
   npm run worker
   ```

5. **Build and verify for production**:
   ```bash
   npm run lint
   npm run build
   ```

---

## API Endpoints

- **`GET /api/campaigns`**: Retrieves active campaigns, recent targets, and aggregated dashboard performance statistics.
- **`POST /api/campaigns`**: Accepts JSON payloads (`{ "name": string, "targets": [{ "url": string, "authority"?: number }] }`), normalizes targets, validates HTTP statuses, checks Wayback archives, creates replacement content drafts, and queues 3-touch outreach sequences.

---

## Internal Linking Suggestions

To strengthen SEO taxonomy and internal search architecture across the **Smarketers Off-Page Suite**, link this documentation with:
- `Smarketers Suite Overview`: Central index for all off-page optimization and link building tools.
- `Outreach Sequence Best Practices`: Guide on optimizing 3-touch email cadence subject lines and copy.
- `Content Reconstruction Engine`: Technical breakdown of archive-based content synthesis and draft generation.
- `Cloudflare D1 & BullMQ Architecture`: Infrastructure guide on running distributed SEO crawler workers.

---

## Call to Action

Ready to accelerate your **off-page SEO automation** and convert dead links into high-authority backlinks?
- Launch a new campaign using the drag-and-drop CSV importer.
- Filter by DR 50+ to ensure maximum link equity.
- Deploy the 7-day outreach sequence and start earning editorial backlinks today!

---

## About Smarketers

**Smarketers** builds high-performance, developer-first growth and SEO automation tools. As part of the Smarketers Off-Page Suite, **vBB** delivers robust, data-backed outreach and link building workflows designed to help modern marketing teams capture high-value search visibility efficiently.
