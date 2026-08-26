# vBB — Automated Broken Link Building Suite Architecture & Guide

> **Smarketers Off-Page Suite** — Local-first Next.js application that ingests target domains, filters for DR/DA 50+ authority, performs HTTP 404/410 validation, fetches Wayback Machine archives to reconstruct replacement content, and manages a three-touch seven-day outreach sequence.

---

## 🏗️ System Architecture Overview

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

## 🔍 Validation Engine & Archive Reconstruction

### 1. HTTP Link Validation Engine
vBB inspects submitted links through strict network checks:
- **Hard 404/410 Status**: Detects dead pages explicitly reported by target servers.
- **Server Faults (5xx)**: Detects persistent server-side timeouts and unreachable targets.
- **Soft 404 Analysis**: Inspects response body text for phrases like *"page not found"*, *"resource moved"*, and *"article archived"* to detect fake 200 OK statuses.

### 2. Wayback Machine Reconstruction API
For every validated broken link, vBB fetches historical snapshots via the public Internet Archive Availability API (`http://archive.org/wayback/available?url=...`):
- Reconstructs original article titles, main subheadings, and core target topics.
- Generates a tailored **Replacement Content Outline** that modernizes the lost resource.

### 3. Three-Touch Automated Cadence (Day 1, 3, 7)
Outreach targets progress through a scheduled 7-day lifecycle:
- **Day 1**: Initial broken link notification featuring the dead resource URL and your replacement resource.
- **Day 3**: Soft reminder highlighting a specific data point or takeaway from your replacement content.
- **Day 7**: Final follow-up before auto-archiving the lead.

---

## 💾 Persistence & Scalability

- **Local Storage Engine**: Persists campaigns, validated targets, reconstructed outlines, and outreach steps in a local SQLite file (or Cloudflare D1).
- **Horizontal Worker Option**: Includes an optional BullMQ + Redis queue setup for scaling validation and crawling jobs outside the Next.js process.

---

## 📊 Tech Stack

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn-style components, Lucide Icons, Framer Motion
- **Database**: SQLite / Cloudflare D1
- **Scaling**: Optional BullMQ + Redis worker support

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
