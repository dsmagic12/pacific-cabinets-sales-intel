# Pacific Cabinets Sales Intelligence

An AI-powered sales intelligence platform for Pacific Cabinets Door & Cabinet sales representatives. The app synthesizes customer order history, project data, and territory context into real-time pre-call briefs and market intelligence digests using Claude.

---

## What It Does

Sales reps use this tool to walk into every customer call prepared. The core workflow:

1. **Browse the customer list** — search by name, filter by segment or tier
2. **Open a customer hub** — review order history, project timeline, revenue trend, and relationship notes
3. **Generate an AI pre-call brief** — Claude reads the full customer context and produces a structured brief with talking points, upsell opportunities, and relationship flags, streamed token-by-token
4. **Consult territory intelligence** — generate a digest of territory-level patterns, seasonal trends, and product momentum across all accounts

Additional tools include a **product catalog browser** (doors, cabinets, hardware, trim) and a **settings page** to verify API key status.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.2 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.0.0 |
| AI SDK | @anthropic-ai/sdk | 0.36.3 |
| Styling | Tailwind CSS | 4.2.2 |
| Component Primitives | Radix UI / shadcn-style | ^1.x |
| Charts | Recharts | 2.15.0 |
| State Management | Zustand | 5.0.2 |
| Icons | lucide-react | 0.469.0 |
| Markdown Rendering | react-markdown + remark-gfm | 9.0.1 / 4.0.0 |
| Transpiler (optional) | @swc/core | 1.15.24 |
| Node.js | — | ≥ 20 recommended |

---

## Prerequisites

- **Node.js 20 or later** (the project uses `@types/node@22`; Node 18 may work but is untested)
- **An Anthropic API key** — obtain one at [console.anthropic.com](https://console.anthropic.com)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

> **Note:** No lock file is committed to this repository. Dependency resolution is controlled by the `^` ranges in `package.json`. If you need reproducible installs across machines, generate and commit a lock file after your first install:
> ```bash
> npm install          # generates package-lock.json
> git add package-lock.json
> ```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

The API key is read server-side only (in Next.js Route Handlers). It is never sent to the browser. The Settings page (`/settings`) shows the current key status at runtime.

### 3. Start the development server

```bash
npm run dev
```

The app runs on **port 3002** (not the Next.js default of 3000):

```
http://localhost:3002
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev -p 3002` | Start dev server with hot reload on port 3002 |
| `build` | `next build` | Compile production build |
| `start` | `next start -p 3002` | Serve the production build on port 3002 |
| `lint` | `next lint` | Run ESLint |

---

## Application Structure

```
pacific-cabinets-sales-intel/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Dashboard (stats, upcoming contacts)
│   ├── layout.tsx              # Root layout with AppShell
│   ├── globals.css             # Tailwind imports + custom theme tokens
│   ├── customers/
│   │   ├── page.tsx            # Customer list with search/filter
│   │   └── [id]/page.tsx       # Customer hub (tabs: brief, history, catalog)
│   ├── catalog/page.tsx        # Product catalog with category/style filters
│   ├── intelligence/page.tsx   # Territory intelligence digest
│   ├── upload/page.tsx         # Data upload (Phase 2 — not yet implemented)
│   ├── settings/page.tsx       # API key status and configuration
│   └── api/
│       ├── ai/brief/route.ts   # POST — streaming pre-call brief generation
│       ├── ai/territory/route.ts  # POST — streaming territory digest
│       └── customers/          # GET — customer list and detail endpoints
│
├── components/
│   ├── layout/                 # AppShell, Sidebar
│   ├── brief/                  # BriefPanel, BriefSection, BriefSkeleton
│   ├── history/                # OrderTable, ProjectTimeline, RevenueChart
│   ├── customers/              # CustomerCard
│   ├── catalog/                # ProductCard
│   ├── intelligence/           # TerritoryDigest
│   └── ui/                     # shadcn-style base components (Button, Card, Badge, etc.)
│
├── lib/
│   ├── ai/
│   │   ├── client.ts           # Anthropic SDK singleton (lazy-initialized)
│   │   ├── prompts.ts          # System prompts for brief and territory routes
│   │   └── context-builders.ts # Assembles XML-structured context for LLM calls
│   ├── data/mock/
│   │   ├── customers.ts        # 5 realistic customer records
│   │   ├── projects.ts         # 15+ projects across customers
│   │   ├── orders.ts           # 50+ orders with line items
│   │   ├── catalog.ts          # 80+ product SKUs
│   │   ├── reps.ts             # 3 sales rep records
│   │   └── index.ts            # Query functions (getCustomer, getOrders, etc.)
│   ├── hooks/
│   │   └── use-streaming.ts    # Generic hook for consuming streaming API responses
│   └── utils.ts                # Shared utilities (cn, formatCurrency, etc.)
│
└── types/index.ts              # Shared TypeScript interfaces
```

---

## AI Integration

All AI calls go through two Next.js Route Handlers (`/api/ai/brief` and `/api/ai/territory`). Both use **streaming responses** via `@anthropic-ai/sdk`'s `messages.stream()` API:

- The Route Handler opens a `ReadableStream` and pipes tokens to the client as they arrive
- The client-side `useStreaming` hook reads the stream and appends chunks to state
- `BriefPanel` parses section headers in the streamed markdown to progressively reveal structured content

The model used is **`claude-sonnet-4-6`** with a 1,500-token output limit for briefs and 2,000 tokens for territory digests. Context is assembled in `lib/ai/context-builders.ts` using an XML-structured template that includes customer profile, order history, project list, and rep territory data.

---

## Data Layer

This is a **Phase 1 MVP with no database**. All data is hard-coded in-memory mock objects under `lib/data/mock/`. The data is realistic in structure and scale (customer tiers, order history, revenue figures, project types) but is not persisted — it resets on every server restart.

Available query functions from `lib/data/mock/index.ts`:

```typescript
getCustomers(query?)                  // Search/filter customer list
getCustomer(id)                       // Single customer record
getProjects(customerId)               // Projects for a customer
getOrders(customerId)                 // Full order history
getRecentOrders(customerId, n)        // Last N orders
getMonthlyRevenue(customerId, months) // Revenue trend array
getCustomerStats(customerId)          // Aggregate KPIs
getProducts(filters)                  // Catalog search/filter
getRep(id)                            // Sales rep record
```

---

## Routes

| URL | Page |
|---|---|
| `/` | Dashboard — summary stats, upcoming scheduled contacts |
| `/customers` | Customer list with search and segment/tier filters |
| `/customers/[id]` | Customer hub — AI brief, order history, project timeline, revenue chart |
| `/catalog` | Product catalog — filter by category, style, and species |
| `/intelligence` | Territory intelligence digest |
| `/upload` | Data upload (Phase 2 — stub only, not functional) |
| `/settings` | API key status |

---

## Known Limitations & Dependency Notes

### `eslint-config-next` version mismatch

`eslint-config-next` is pinned to `^15.5.14` while the app runs on `next@16.2.2`. The ESLint config package is one minor version behind the framework. Linting still works, but some Next.js 16-specific rules may not be enforced and the `npm install` step will produce a peer dependency warning. If you see unexpected lint behavior, upgrade `eslint-config-next` to match the Next.js version:

```bash
npm install --save-dev eslint-config-next@16
```

### `@swc/core` is optional and platform-dependent

`@swc/core` is listed under `optionalDependencies` to accelerate Next.js compilation. It ships pre-built native binaries and **may fail to install or run on**:

- Alpine Linux / musl libc environments (Docker, some CI runners)
- Older ARMv7 hardware
- Platforms where the prebuilt binary target is unavailable

If `@swc/core` fails to install, Next.js falls back to Babel automatically. You can safely add it to `.npmrc` to suppress the install error:

```
optional=true
```

Or skip it explicitly:

```bash
npm install --ignore-optional
```

### Tailwind CSS 4 — breaking changes from v3

This project uses **Tailwind CSS 4**, which has a substantially different configuration model than v3:

- CSS is imported with `@import "tailwindcss"` instead of the old `@tailwind base/components/utilities` directives
- Theme customization uses `@theme {}` blocks in CSS, not `tailwind.config.js`
- There is no `tailwind.config.js` in this project — that is intentional
- The `@tailwindcss/postcss` package replaces the old PostCSS plugin setup
- Many online tutorials and AI-generated snippets reference v3 patterns that will not work here

If you add new theme tokens, do so in `app/globals.css` inside the `@theme {}` block, not in a config file.

### Recharts peer dependency on React 18

`recharts@2.15.0` declares a peer dependency on React 18, but this project uses **React 19**. The library functions correctly at runtime, but `npm install` will emit a peer dependency warning. This is a known upstream issue in the Recharts ecosystem — a React 19-compatible release is expected in Recharts v3.

### No lock file

No `package-lock.json` is committed. Package versions are controlled by `^` semver ranges. Dependency trees may differ between install environments, especially over time as packages publish patch releases. For consistent CI or team builds, commit a lock file.

### All data is mock — no persistence

There is no database, no filesystem persistence, and no backend service. All customer, order, project, and product data lives in-memory and resets on every server start. This is intentional for the Phase 1 MVP. See the Phase Roadmap below.

### Port 3002

The dev and production servers run on port **3002**, not the Next.js default of 3000. If you have a local service already using 3002, update the `-p` flag in both the `dev` and `start` scripts in `package.json`.

### Next.js 16 App Router only

This project uses the **App Router** exclusively. The Pages Router is not configured or used. If you reference Next.js documentation or examples for the Pages Router (`getServerSideProps`, `getStaticProps`, `pages/` directory), they will not apply here.

### Upload page is a stub

The `/upload` route exists but is not functional. It is scaffolded for Phase 2 (see roadmap below).

---

## Phase Roadmap

**Phase 1 (current):** Core intelligence features on mock data
- [x] Dashboard with KPI stats and upcoming contacts
- [x] Customer list with search and tier/segment filters
- [x] Customer hub with tabbed interface
- [x] Streaming AI pre-call brief generation
- [x] Order history table and revenue trend chart
- [x] Project timeline
- [x] Product catalog browser
- [x] Territory intelligence digest (streaming)
- [x] Settings page with API key status

**Phase 2 (planned):** Real data and extended intelligence
- [ ] Document and Excel upload with parsing
- [ ] Estimate builder with AI-powered line-item validation
- [ ] Chat assistant with customer context awareness
- [ ] Real-time notifications and contact reminders
- [ ] Database persistence (replacing mock data layer)
- [ ] Market intelligence feed with external data grounding

---

## Deployment

Build for production:

```bash
npm run build
npm run start     # serves on port 3002
```

The `ANTHROPIC_API_KEY` environment variable must be available in the production environment. Set it via your hosting platform's secrets manager or environment configuration — do not commit it to the repository.

The app has no special infrastructure requirements beyond a Node.js 20+ runtime. It does not require a database, cache layer, or external service other than the Anthropic API.
