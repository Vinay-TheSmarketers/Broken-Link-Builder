# vBB — Automated Broken Link Building Suite Architecture & Strategy Guide

> **Smarketers Off-Page Suite** — Local-first Next.js application that ingests target domains, filters for DR/DA 50+ authority, performs HTTP 404/410 validation, fetches Wayback Machine archives to reconstruct replacement content, and manages a three-touch seven-day outreach sequence.

---

## 🤖 Automation Matrix: Automated vs. Human Operator Boundaries

To maximize outreach conversion and ensure natural link replacement, vBB enforces clear operational boundaries:

```
┌─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┐
│ ⚡ 100% AUTOMATED BY vBB ENGINE                        │ 👤 HUMAN OPERATOR GATEWAY & REPLACEMENT AUDIT           │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ • CSV domain drag-and-drop ingestion & deduplication    │ • Reviewing historical Wayback Machine snapshots        │
│ • DR/DA 50+ authority filtering gate                    │ • Publishing original replacement content on your site  │
│ • Live HTTP 404/410 status & soft-404 text analysis     │ • Reviewing generated outreach pitch templates          │
│ • Internet Archive / Wayback Machine API snapshot lookup│ • Sending outreach email via webmaster / editor contact │
│ • Replacement content outline reconstruction            │ • Handling webmaster responses & confirming replacement │
│ • Three-touch 7-day cadence scheduling (Days 1, 3, 7)   │ • Submitting linking page to Google Search Console      │
└─────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 🎯 Intricate Marketing & Strategy Playbook

### 1. Target Prospecting & Qualification Criteria
- **Target Selection**: Search for industry resource hubs and roundup pages (`inurl:resources "niche"`, `inurl:links "niche"`). Resource pages link out frequently and webmasters actively maintain them.
- **Authority Gate (DR/DA ≥ 50)**: Focus exclusively on high-authority domains where a single replacement backlink delivers substantial PageRank equity.
- **Link Status Classification**:
  - **Hard 404 / 410**: Dead pages explicitly returning error codes. Top conversion priority.
  - **Soft 404s**: Pages returning 200 OK but displaying *"page no longer available"* or *"archived entry"*.

### 2. Replacement Content Reconstruction Standard
Never pitch a thin replacement. Your replacement content must be **strictly superior** to the dead resource:
- **1,500+ Words**: Match or exceed the depth of the archived Wayback snapshot.
- **Updated Data & Visuals**: Modernize outdated calculations, broken images, or old statistics from the original 2018–2022 snapshot.
- **Topical Parity**: Retain the core topic and primary keywords so the linking site's editorial context remains 100% relevant.

### 3. High-Converting Outreach Formula
- **Helpful Framing**: Frame your pitch as a user experience fix: *"I was reading your guide on [Topic] and noticed the link to [Dead Target] returns a 404 error..."*
- **Low-Friction Replacement Offer**: *"We recently published an updated, comprehensive guide covering [Topic] with fresh 2026 data. If helpful, it might make a great replacement for your readers: [Your URL]"*
- **No Commercial Pitching**: Never mention SEO, PageRank, or link building.

---

## 🏗️ End-to-End System Architecture

```mermaid
flowchart TD
    User([User Input: Target URLs / CSV Drag-and-Drop]) --> UI[Next.js Dashboard UI]
    UI -->|POST Upload| Ingest[Domain Ingestion Pipeline]
    
    subgraph Target Filtering & Validation
        Ingest --> FilterDA{DR / Authority >= 50?}
        FilterDA -->|No| Exclude[Discard Target]
        FilterDA -->|Yes| HTTPCheck[HTTP Live Status Validator]
        
        HTTPCheck -->|200 OK| ActivePage[Mark Active / No Broken Link]
        HTTPCheck -->|Hard 404 / 410 / 5xx| DeadLink[Broken Link Detected]
        HTTPCheck -->|Soft 404 Language| Soft404[Flag Soft 404]
    end
    
    subgraph Content Reconstruction & Archive Lookup
        DeadLink --> Wayback[Wayback Machine Archive API Lookup]
        Soft404 --> Wayback
        Wayback --> Snapshot[Historical Content Snapshot]
        Snapshot --> Reconstruction[Replacement Content Outline Generator]
    end
    
    subgraph Outreach Cadence & Persistence
        Reconstruction --> Cadence[Three-Touch Cadence Scheduler]
        Cadence -->|Touch 1| Day1[Day 1: Initial Outreach]
        Cadence -->|Touch 2| Day3[Day 3: Follow-Up Check]
        Cadence -->|Touch 3| Day7[Day 7: Final Outreach Touch]
        
        Day1 --> DB[(SQLite / Cloudflare D1 Store)]
        Day3 --> DB
        Day7 --> DB
        DB --> Dashboard[Campaign Monitoring Dashboard]
    end
```

---

## 💻 Code Internals & Technical Deep Dive

### 1. HTTP Validation Engine
Inspects targets for 404/410/5xx errors, timeouts, and soft 404 text patterns (*"not found"*, *"resource moved"*, *"archived"*).

### 2. Wayback Machine Availability API Integration
Fetches historical snapshots from `http://archive.org/wayback/available?url=...` to extract historical headings and title tags.

### 3. Cadence Scheduler (Days 1, 3, 7)
- **Day 1**: Initial broken link alert + replacement recommendation.
- **Day 3**: Soft reminder referencing a key takeaway.
- **Day 7**: Final check-in before marking task inactive.

---

## 📊 Tech Stack

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn-style components, Lucide Icons, Framer Motion
- **Database**: SQLite / Cloudflare D1

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 🌐 Part of Smarketers Off-Page Suite
vBB is part of the Smarketers Off-Page Suite — open-source, local-first marketing applications designed for privacy, speed, and reliability without SaaS dependencies.
