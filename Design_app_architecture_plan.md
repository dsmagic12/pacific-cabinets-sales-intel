# Frontier Door & Cabinet — Sales Intelligence Tool: Implementation Plan
## 1. Tech Stack & Rationale
### Core Framework: Next.js 14+ (App Router)
Next.js App Router is the right choice here for several reasons. API keys for the Anthropic SDK never touch the client bundle because all LLM calls happen in Route Handlers (`app/api/...`). Server Components allow data fetching without waterfalls. The file-based routing maps cleanly to the application's navigation model. Streaming responses from Claude are handled natively via the Web Streams API that Next.js Route Handlers support.
### Full Stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API routes, streaming |
| Language | TypeScript (strict) | Type safety across data models |
| Styling | Tailwind CSS | Utility-first, consistent spacing |
| Components | shadcn/ui | Headless, accessible, copy-paste ownership |
| LLM | Anthropic SDK (`@anthropic-ai/sdk`) | Required per constraints |
| Excel Parsing | `xlsx` (SheetJS) | Reads .xlsx/.csv order history |
| State Management | Zustand | Lightweight, no boilerplate |
| Data Fetching | TanStack Query (React Query) | Caching, background refresh, loading states |
| Icons | Lucide React | Ships with shadcn/ui |
| Charts | Recharts | Revenue/order history visualizations |
| Markdown | `react-markdown` + `remark-gfm` | Renders Claude's structured output |
| Date handling | date-fns | Lightweight, tree-shakeable |
### Why Not a Separate Backend
Keeping everything in Next.js reduces operational complexity for a demo/MVP. The mock data layer is just TypeScript modules. When real integrations are needed, each Route Handler becomes the integration point — no separate service to deploy.
---
## 2. Application Architecture
### Page Map (App Router)
```
/                          → Dashboard / Home
/customers                 → Customer list with search
/customers/[id]            → Customer detail (hub page)
/customers/[id]/brief      → Pre-interaction AI brief
/customers/[id]/history    → Order & project history
/customers/[id]/estimate   → Estimate builder + validator
/catalog                   → Product catalog browser
/catalog/[productId]       → Product detail
/intelligence              → Market intelligence feed
/upload                    → Data source upload (Excel, docs)
/settings                  → API key config, rep profile
```
### Route Handlers (API Layer)
```
/api/ai/brief              → POST: Generate customer brief
/api/ai/validate-estimate  → POST: Validate estimate against catalog
/api/ai/market-intel       → POST: Generate market intelligence
/api/ai/chat               → POST: General assistant chat (streaming)
/api/ai/project-summary    → POST: Summarize project history
/api/customers             → GET: List/search customers
/api/customers/[id]        → GET: Single customer + related data
/api/catalog               → GET: Product catalog with filters
/api/catalog/[productId]   → GET: Product detail
/api/upload/excel          → POST: Parse Excel file, return structured data
/api/upload/document       → POST: Store document reference
```
### Component Architecture
**Layout Components**
- `AppShell` — sidebar nav, top bar, breadcrumbs
- `Sidebar` — navigation links, rep profile badge
- `TopBar` — search, notifications, settings link
**Feature Components**
- `CustomerCard` — summary card for list view
- `BriefPanel` — streaming AI brief display with skeleton
- `ProjectTimeline` — visual order/project history
- `EstimateBuilder` — line-item table with catalog lookup
- `ValidatorPanel` — shows validation results, warnings, suggestions
- `ProductCard` — catalog item with specs, availability
- `IntelFeed` — market intelligence cards
- `ChatDrawer` — slide-out contextual AI assistant
- `DataSourceBadge` — shows which sources informed an insight
- `StreamingText` — handles token-by-token rendering
**Shared UI Components (shadcn/ui base)**
- `Button`, `Card`, `Badge`, `Dialog`, `Sheet`, `Tabs`
- `Table`, `Input`, `Select`, `Textarea`, `Skeleton`
- `Progress`, `Alert`, `Separator`, `ScrollArea`
---
## 3. Data Model
### Customer
```typescript
interface Customer {
  id: string;
  name: string;            // "Riverside Construction Co."
  contactName: string;     // "Mike Harrington"
  contactEmail: string;
  contactPhone: string;
  territory: string;       // "Pacific Northwest"
  assignedRepId: string;
  segment: 'builder' | 'remodeler' | 'architect' | 'dealer';
  tier: 'platinum' | 'gold' | 'silver' | 'prospect';
  annualRevenue: number;   // YTD revenue in dollars
  lifetimeRevenue: number;
  preferredStyles: string[];  // ["shaker", "craftsman", "contemporary"]
  preferredFinishes: string[]; // ["painted", "stained", "thermofoil"]
  notes: string;
  lastContactDate: string; // ISO date
  nextScheduledContact: string | null;
  createdAt: string;
}
```
### Project
```typescript
interface Project {
  id: string;
  customerId: string;
  name: string;           // "Lakewood Estates Phase 2"
  type: 'new_construction' | 'remodel' | 'commercial';
  status: 'estimating' | 'ordered' | 'in_production' | 'delivered' | 'complete';
  addressCity: string;
  addressState: string;
  unitCount: number | null;   // for tract builders
  estimatedValue: number;
  actualValue: number | null;
  orderIds: string[];
  startDate: string;
  deliveryDate: string | null;
  completionDate: string | null;
  notes: string;
  documents: DocumentRef[];
}
```
### Order
```typescript
interface Order {
  id: string;
  customerId: string;
  projectId: string | null;
  orderDate: string;
  deliveryDate: string | null;
  status: 'quote' | 'confirmed' | 'in_production' | 'shipped' | 'delivered';
  repId: string;
  lineItems: OrderLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string;
}
interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  extendedPrice: number;
  style: string;
  finish: string;
  species: string | null;   // for wood products
  customOptions: Record<string, string>;
}
```
### Product / Catalog
```typescript
interface Product {
  id: string;
  sku: string;
  category: 'door' | 'cabinet' | 'hardware' | 'trim' | 'accessory';
  subcategory: string;    // "interior door", "base cabinet", "pull", etc.
  name: string;
  description: string;
  availableStyles: Style[];
  availableFinishes: Finish[];
  availableSpecies: Species[];  // null if not wood
  dimensions: {
    widths: number[];     // inches
    heights: number[];
    depths: number[] | null;
  };
  basePrice: number;
  pricingTier: 'standard' | 'premium' | 'luxury';
  leadTimeDays: number;
  inStock: boolean;
  compatibleProducts: string[];  // product IDs
  images: string[];
  specSheet: string | null;   // URL
  isActive: boolean;
  discontinuedDate: string | null;
}
type Style = 'shaker' | 'craftsman' | 'raised_panel' | 'flat_panel' | 
             'beadboard' | 'inset' | 'contemporary' | 'arch_top';
type Finish = 'painted' | 'stained' | 'thermofoil' | 'laminate' | 
              'acrylic' | 'glazed' | 'distressed';
type Species = 'maple' | 'cherry' | 'oak' | 'hickory' | 'alder' | 
               'mdf' | 'birch';
```
### Estimate
```typescript
interface Estimate {
  id: string;
  customerId: string;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'validated' | 'sent' | 'accepted' | 'rejected';
  lineItems: EstimateLineItem[];
  validationResult: ValidationResult | null;
  total: number;
  notes: string;
}
interface EstimateLineItem {
  id: string;
  rawDescription: string;   // what the rep typed
  resolvedProductId: string | null;
  quantity: number;
  unitPrice: number | null;
  style: string | null;
  finish: string | null;
  species: string | null;
  customOptions: Record<string, string>;
  validationStatus: 'valid' | 'warning' | 'error' | 'unresolved';
  validationMessages: string[];
}
interface ValidationResult {
  overallStatus: 'valid' | 'has_warnings' | 'has_errors';
  lineItemResults: LineItemValidation[];
  suggestions: string[];
  estimatedLeadTime: number;  // days
  pricingConfidence: 'high' | 'medium' | 'low';
}
```
### Rep (HRIS)
```typescript
interface Rep {
  id: string;
  name: string;
  email: string;
  territory: string;
  region: string;
  managerName: string;
  specialties: string[];   // ["multifamily", "luxury remodel"]
  customerIds: string[];
  ytdRevenue: number;
  ytdQuota: number;
  hireDate: string;
}
```
### Market Intelligence
```typescript
interface IntelCard {
  id: string;
  customerId: string | null;   // null = territory-wide
  type: 'trend' | 'competitor' | 'opportunity' | 'risk' | 'insight';
  title: string;
  summary: string;
  supportingData: string[];
  confidence: 'high' | 'medium' | 'low';
  generatedAt: string;
  expiresAt: string;
  sources: DataSourceRef[];
}
interface DataSourceRef {
  type: 'erp' | 'crm' | 'excel' | 'document' | 'catalog';
  label: string;
}
```
### DocumentRef
```typescript
interface DocumentRef {
  id: string;
  customerId: string;
  projectId: string | null;
  filename: string;
  type: 'spec' | 'contract' | 'drawing' | 'photo' | 'other';
  uploadedAt: string;
  sizeBytes: number;
  extractedText: string | null;  // from PDF/doc parsing
}
```
---
## 4. LLM Integration Approach
### Architecture Principle
All Anthropic SDK calls happen exclusively in Route Handlers. The client never holds an API key. Each feature has a dedicated Route Handler that assembles context, crafts a prompt, and either streams or returns a complete response.
### Context Assembly Strategy
Each LLM call uses a **context assembly function** that pulls relevant mock data and formats it into a structured XML-like context block. This approach (which Claude handles well) makes it easy to control token budgets and clearly delineate data sections.
```typescript
// lib/ai/context-builders.ts pattern
function buildCustomerContext(customer: Customer, projects: Project[], orders: Order[]): string {
  return `
<customer_profile>
  <name>${customer.name}</name>
  <segment>${customer.segment}</segment>
  <tier>${customer.tier}</tier>
  <territory>${customer.territory}</territory>
  <preferred_styles>${customer.preferredStyles.join(', ')}</preferred_styles>
  <preferred_finishes>${customer.preferredFinishes.join(', ')}</preferred_finishes>
  <annual_revenue>$${customer.annualRevenue.toLocaleString()}</annual_revenue>
  <notes>${customer.notes}</notes>
</customer_profile>
<project_history count="${projects.length}">
${projects.map(p => `  <project name="${p.name}" status="${p.status}" value="$${p.estimatedValue.toLocaleString()}" />`).join('\n')}
</project_history>
<recent_orders count="${orders.slice(0, 10).length}">
${orders.slice(0, 10).map(o => `  <order date="${o.orderDate}" total="$${o.total.toLocaleString()}" status="${o.status}" />`).join('\n')}
</recent_orders>
  `.trim();
}
```
### Feature-Specific Prompting
**1. Pre-Interaction Brief (`/api/ai/brief`)**
System prompt focuses on the role of a seasoned sales strategist. The user message includes the assembled customer context plus any recent news/activity. The response is requested as structured markdown with fixed sections: Executive Summary, Key Talking Points, Risk Flags, Recommended Products to Mention, Questions to Ask.
Model: `claude-opus-4-5` (highest quality for strategic synthesis)
Mode: Non-streaming, complete response (brief is pre-fetched before the call)
Max tokens: 1500
**2. Project History Summary (`/api/ai/project-summary`)**
System prompt positions Claude as a data analyst summarizing order patterns. Context includes full order line-item history. Asks for patterns in styles, finishes, price points, seasonal ordering behavior, and trajectory.
Model: `claude-sonnet-4-5` (balance of speed and quality)
Mode: Streaming (history can be long)
Max tokens: 800
**3. Estimate Validation (`/api/ai/validate-estimate`)**
This is the most structured prompt. Context includes the raw estimate line items AND the full product catalog (or a filtered subset). The prompt asks Claude to:
1. Match each line item description to a specific SKU
2. Flag items where the combination of style/finish/species is not valid per catalog
3. Identify discontinued products
4. Suggest the closest valid alternative for any invalid items
5. Return a structured JSON response
Model: `claude-sonnet-4-5`
Mode: Non-streaming (result must be parsed as JSON)
Response format: Ask Claude to return JSON matching the `ValidationResult` interface. Use `tool_use` / function calling for reliable JSON extraction.
Max tokens: 2000
**4. Market Intelligence (`/api/ai/market-intel`)**
System prompt establishes Claude as a market analyst for interior finish materials. Context includes territory data, the customer's order history trends, competitor product mentions from CRM notes, and seasonal trends. Generates 3-5 intelligence cards.
Model: `claude-sonnet-4-5`
Mode: Streaming
Max tokens: 1200
**5. Contextual Chat Assistant (`/api/ai/chat`)**
A general assistant that knows about the current customer/project context (passed in request body). Uses a sliding window of conversation history (last 10 turns) stored in Zustand, sent with each request. The system prompt includes the current page context so Claude can answer questions like "what's the lead time on this customer's preferred finish?"
Model: `claude-haiku-4-5` (speed matters for chat)
Mode: Streaming (token-by-token to `ChatDrawer`)
Max tokens: 600 per turn
### Streaming Implementation
Route Handlers return a `ReadableStream`. The client uses `fetch` with a reader loop, appending chunks to React state. The `StreamingText` component renders markdown progressively.
```typescript
// Route Handler pattern
export async function POST(req: Request) {
  const body = await req.json();
  const context = buildContext(body);
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: context }],
    system: SYSTEM_PROMPT,
  });
  return new Response(stream.toReadableStream());
}
```
```typescript
// Client hook pattern (hooks/use-streaming.ts)
async function streamResponse(url: string, payload: object) {
  const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    setContent(prev => prev + decoder.decode(value));
  }
}
```
### Token Budget Management
- Always include customer context (small, ~300 tokens)
- Include only last 10 orders, not full history (prevents runaway context)
- Catalog lookups: filter to relevant category before including (~50 products max)
- For estimate validation: include only SKUs in relevant categories
- Never pass raw Excel data directly — always pre-process to structured summaries
---
## 5. File & Folder Structure
```
frontier-sales-intel/
├── app/
│   ├── layout.tsx                    # Root layout with AppShell
│   ├── page.tsx                      # Dashboard
│   ├── customers/
│   │   ├── page.tsx                  # Customer list
│   │   └── [id]/
│   │       ├── page.tsx              # Customer hub
│   │       ├── brief/
│   │       │   └── page.tsx          # AI brief
│   │       ├── history/
│   │       │   └── page.tsx          # Order history
│   │       └── estimate/
│   │           └── page.tsx          # Estimate builder
│   ├── catalog/
│   │   ├── page.tsx                  # Catalog browser
│   │   └── [productId]/
│   │       └── page.tsx              # Product detail
│   ├── intelligence/
│   │   └── page.tsx                  # Market intelligence feed
│   ├── upload/
│   │   └── page.tsx                  # Data source upload
│   ├── settings/
│   │   └── page.tsx                  # Settings
│   └── api/
│       ├── ai/
│       │   ├── brief/route.ts
│       │   ├── validate-estimate/route.ts
│       │   ├── market-intel/route.ts
│       │   ├── chat/route.ts
│       │   └── project-summary/route.ts
│       ├── customers/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── catalog/
│       │   ├── route.ts
│       │   └── [productId]/route.ts
│       └── upload/
│           ├── excel/route.ts
│           └── document/route.ts
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── Breadcrumbs.tsx
│   ├── customers/
│   │   ├── CustomerCard.tsx
│   │   ├── CustomerList.tsx
│   │   └── CustomerSearch.tsx
│   ├── brief/
│   │   ├── BriefPanel.tsx
│   │   ├── BriefSection.tsx
│   │   └── BriefSkeleton.tsx
│   ├── history/
│   │   ├── ProjectTimeline.tsx
│   │   ├── OrderTable.tsx
│   │   ├── RevenueChart.tsx
│   │   └── StyleBreakdown.tsx
│   ├── estimate/
│   │   ├── EstimateBuilder.tsx
│   │   ├── EstimateLineItem.tsx
│   │   ├── ValidatorPanel.tsx
│   │   └── ProductLookup.tsx
│   ├── catalog/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductDetail.tsx
│   ├── intelligence/
│   │   ├── IntelFeed.tsx
│   │   ├── IntelCard.tsx
│   │   └── IntelFilters.tsx
│   ├── chat/
│   │   ├── ChatDrawer.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   └── ui/                           # shadcn/ui components (auto-generated)
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── ...
│
├── lib/
│   ├── ai/
│   │   ├── client.ts                 # Anthropic SDK singleton
│   │   ├── context-builders.ts       # Context assembly functions
│   │   ├── prompts.ts                # All system prompts as constants
│   │   └── streaming.ts              # Streaming utility helpers
│   ├── data/
│   │   ├── mock/
│   │   │   ├── customers.ts          # 10-15 realistic mock customers
│   │   │   ├── projects.ts           # 20-30 mock projects
│   │   │   ├── orders.ts             # 50+ mock orders with line items
│   │   │   ├── products.ts           # 80-100 mock catalog products
│   │   │   ├── reps.ts               # 5 mock reps
│   │   │   └── index.ts              # Re-exports + query helpers
│   │   └── excel-parser.ts           # xlsx parsing utilities
│   ├── hooks/
│   │   ├── use-streaming.ts          # Streaming fetch hook
│   │   ├── use-brief.ts              # Brief generation hook
│   │   ├── use-estimate.ts           # Estimate state management
│   │   └── use-chat.ts               # Chat state + history
│   ├── store/
│   │   ├── chat-store.ts             # Zustand: chat history
│   │   ├── estimate-store.ts         # Zustand: current estimate
│   │   └── session-store.ts          # Zustand: current rep session
│   └── utils/
│       ├── currency.ts
│       ├── dates.ts
│       └── cn.ts                     # shadcn classname utility
│
├── types/
│   ├── customer.ts
│   ├── product.ts
│   ├── order.ts
│   ├── estimate.ts
│   ├── intelligence.ts
│   └── index.ts                      # Re-exports all types
│
├── public/
│   └── images/
│       └── products/                 # Mock product images
│
├── .env.local                        # ANTHROPIC_API_KEY
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
---
## 6. Implementation Phases
### Phase 1: Foundation (Days 1-2)
**Goal: Running app shell with navigation and mock data layer**
1. Initialize Next.js 14 project with TypeScript and Tailwind
2. Install and configure shadcn/ui (`npx shadcn@latest init`)
3. Add required shadcn components: card, button, badge, table, input, select, sheet, dialog, tabs, skeleton, scroll-area, separator, alert
4. Build `AppShell`, `Sidebar`, and `TopBar` components
5. Create all TypeScript type definitions in `/types`
6. Build the complete mock data layer — this is foundational. Invest time making the mock data realistic: real-sounding company names (Riverside Construction, Blue Ridge Homes, etc.), realistic order histories, a full product catalog with actual door/cabinet terminology (shaker, raised panel, inset, full overlay, soft-close, dovetail drawer box, etc.)
7. Implement all mock API Route Handlers (customers, catalog) that serve mock data
8. Build Dashboard page with summary stats (revenue cards, recent activity)
9. Build Customer List page with search
**Deliverable:** Navigable app with real-looking data, no AI yet
### Phase 2: Customer Intelligence Core (Days 3-4)
**Goal: Customer detail hub + AI brief generation**
1. Build Customer Hub page (`/customers/[id]`) — the central page of the app. Tabs for Overview, History, Estimates, Documents
2. Build `ProjectTimeline` and `OrderTable` components with real mock data
3. Build `RevenueChart` using Recharts (monthly revenue over 12 months)
4. Set up Anthropic SDK singleton in `lib/ai/client.ts`
5. Build context assembly functions for customer data
6. Write system prompts for the brief feature
7. Implement `/api/ai/brief` Route Handler with streaming
8. Build `BriefPanel` component with `StreamingText` and skeleton loading state
9. Implement `use-streaming` hook
10. Build `BriefSection` components (collapsible sections for each brief part)
11. Implement `/api/ai/project-summary` and wire to History tab
**Deliverable:** Complete customer view with live AI brief generation
### Phase 3: Estimate Builder + Validation (Days 5-6)
**Goal: Estimate workflow with AI validation**
1. Build `EstimateBuilder` — a spreadsheet-like interface where reps type line item descriptions
2. Build `ProductLookup` — inline catalog search (typeahead) for resolving items
3. Implement estimate state management with Zustand
4. Build `/api/ai/validate-estimate` with structured output (tool use / JSON mode)
5. Build `ValidatorPanel` — shows validation results with color-coded status per line item
6. Wire validation to display: green checkmarks, yellow warnings, red errors
7. Implement "Fix Suggestion" UI — clicking a suggestion replaces the line item
8. Build Product Catalog pages (`/catalog` and `/catalog/[productId]`)
9. Build `ProductGrid` with filter sidebar (category, style, finish, species, price range)
**Deliverable:** Full estimate-to-validation workflow
### Phase 4: Market Intelligence + Chat (Days 7-8)
**Goal: Intelligence feed and contextual chat assistant**
1. Build Market Intelligence page with `IntelFeed`
2. Implement `/api/ai/market-intel` Route Handler
3. Build `IntelCard` component with confidence indicator, source badges, expandable detail
4. Implement the "refresh intel" flow (re-generate cards for a customer)
5. Build `ChatDrawer` — slide-out panel (uses shadcn Sheet component)
6. Set up Zustand chat store with conversation history
7. Implement `/api/ai/chat` Route Handler with streaming + conversation history
8. Build `ChatMessage` component with markdown rendering
9. Wire chat context to current page (customer/project context injected automatically)
10. Add "Ask about this customer" button to Customer Hub that pre-populates a question
**Deliverable:** Intelligence feed + contextual AI chat
### Phase 5: Data Upload + Polish (Days 9-10)
**Goal: Excel upload, final polish, demo-ready**
1. Build Upload page with drag-and-drop file zone
2. Implement `/api/upload/excel` Route Handler using `xlsx` library
3. Parse uploaded Excel files into the Order/Customer data structures
4. Show parsed data preview before "importing"
5. Implement Settings page (API key check, rep profile selection)
6. Global search (Cmd+K command palette using shadcn Command component)
7. Toast notifications for async actions
8. Loading states everywhere — skeletons, spinners
9. Empty states (no orders yet, no brief generated)
10. Error boundaries and graceful error states for API failures
11. Mobile responsiveness pass
12. Final data polish — ensure mock data tells a coherent story per customer
**Deliverable:** Complete, demo-ready application
---
## 7. Key UI Screens
### Dashboard (`/`)
- Top stats bar: Today's customer meetings, Open estimates, Pipeline value, YTD revenue vs quota
- "Your customers this week" — cards for upcoming contacts with quick-action buttons
- Recent activity feed (last orders, last briefs generated)
- Quick-generate brief button for next scheduled call
### Customer List (`/customers`)
- Search bar (live filter)
- Filter chips: tier, segment, territory
- Customer cards showing: name, tier badge, last contact, YTD revenue, 3-month trend sparkline
- Sort by: revenue, last contact, next contact
### Customer Hub (`/customers/[id]`)
The most important page. Split layout:
- **Left column (40%):** Customer profile card (contact info, tier, segment, preferences), Quick stats (lifetime revenue, project count, avg order size), "Generate Brief" CTA button prominent at top
- **Right column (60%):** Tab panel
  - **Brief tab:** `BriefPanel` — streaming AI brief, sections collapse/expand
  - **History tab:** `ProjectTimeline` + `RevenueChart` + `OrderTable`
  - **Estimates tab:** List of estimates with status badges, "New Estimate" button
  - **Documents tab:** File list with type icons
### AI Brief (`/customers/[id]/brief` or inline tab)
- Header: Customer name, "Generated X minutes ago", "Regenerate" button
- Brief sections (each collapsible card):
  1. Executive Summary (2-3 sentences)
  2. Key Talking Points (bulleted)
  3. Recent Activity (what's changed since last contact)
  4. Products to Mention (with reasoning)
  5. Risk Flags (late payments, competitor mentions, etc.)
  6. Questions to Ask
- Source attribution strip at bottom: "This brief drew from 23 orders, 4 projects, 12 CRM notes"
- Streaming skeleton animation during generation
### Estimate Builder (`/customers/[id]/estimate`)
- Header row: Customer name, project selector dropdown, estimate status badge
- Line item table: Description (free text), Qty, Style, Finish, Species, Unit Price, Extended
- Each row has a "Resolve" button that triggers catalog lookup
- "Validate with AI" button — sends full estimate to validation endpoint
- Validation sidebar slides in: overall status badge, per-line results, suggestions list
- "Export to PDF" placeholder button
### Product Catalog (`/catalog`)
- Left: filter panel (category tree, style checkboxes, finish checkboxes, price range slider, in-stock toggle)
- Right: product grid (3 columns desktop, 2 tablet, 1 mobile)
- Product cards: image placeholder, name, SKU, base price, lead time badge, style/finish chips
- Quick-add to current estimate (if estimate is open)
### Market Intelligence (`/intelligence`)
- Filter bar: customer selector, intel type chips, date range
- Card grid — each `IntelCard`:
  - Type icon + color (trend = blue, opportunity = green, risk = red)
  - Title + summary
  - Confidence badge (high/medium/low)
  - Supporting data bullets
  - Source badges (ERP, CRM, Orders)
  - Expand for full detail
- "Refresh All" button at top
---
## 8. Claude API Usage by Feature
### Brief Generation — Full Detail
**System Prompt (`lib/ai/prompts.ts`):**
```
You are an expert sales strategist for Frontier Door & Cabinet, a manufacturer 
of interior finish materials including doors, cabinets, and hardware. You help 
sales representatives prepare for customer interactions by synthesizing order 
history, project data, and relationship context into actionable briefs.
Your briefs are concise, specific, and immediately useful. You avoid generic 
advice. Every recommendation references specific data from the customer's 
history. You write in a professional but direct tone — these are busy sales 
professionals who need to scan quickly.
Format your response in markdown with these exact sections:
## Executive Summary
## Key Talking Points  
## Recent Activity
## Products to Mention
## Risk Flags
## Questions to Ask
```
**User Message assembly:** Customer context XML block + "Generate a pre-call brief for the upcoming interaction with this customer."
**Why this works:** Structured XML context gives Claude clear data boundaries. Mandatory section headers make the response predictable for the `BriefSection` component to parse and render independently.
### Estimate Validation — Structured Output via Tool Use
Use the Anthropic SDK's `tools` parameter to guarantee JSON output structure:
```typescript
const tools = [{
  name: "submit_validation_result",
  description: "Submit the completed validation of all estimate line items",
  input_schema: {
    type: "object",
    properties: {
      overallStatus: { type: "string", enum: ["valid", "has_warnings", "has_errors"] },
      lineItemResults: {
        type: "array",
        items: {
          type: "object",
          properties: {
            lineItemId: { type: "string" },
            resolvedSku: { type: "string" },
            status: { type: "string", enum: ["valid", "warning", "error", "unresolved"] },
            messages: { type: "array", items: { type: "string" } },
            suggestedAlternative: { type: "string" }
          }
        }
      },
      suggestions: { type: "array", items: { type: "string" } },
      estimatedLeadTimeDays: { type: "number" }
    }
  }
}]
```
The Route Handler calls `messages.create` with `tool_choice: { type: "tool", name: "submit_validation_result" }` to force structured output, then parses `content[0].input` as the validated result. This is far more reliable than asking Claude to "return JSON."
**Context sent:** Estimate line items in plain text + catalog subset filtered to relevant categories (if estimate has door items, send only door SKUs). Include discontinued flag and valid combination matrix.
### Market Intelligence — Generating Grounded Cards
**Key prompt technique:** Provide explicit data points in the context and instruct Claude to cite them. This prevents hallucination and makes the intel feel grounded.
```
Based on the following data for [customer name] and their territory, generate 
4-5 market intelligence insights. Each insight must:
1. Reference specific numbers from the provided data
2. Be actionable (suggest what the rep should do)
3. Be categorized as: trend, opportunity, risk, or insight
<territory_data>...</territory_data>
<customer_order_trends>...</customer_order_trends>
<crm_notes>...</crm_notes>
<competitor_mentions>...</competitor_mentions>
```
Return format: Ask for a JSON array of insight objects (using tool use for reliability).
### Contextual Chat — Dynamic System Prompt Injection
The chat system prompt is dynamically constructed per request to include current page context:
```typescript
function buildChatSystemPrompt(context: ChatContext): string {
  return `You are a sales intelligence assistant for Frontier Door & Cabinet. 
You are currently helping a rep with ${context.pageType === 'customer' 
  ? `customer ${context.customerName}` 
  : 'general questions'}.
${context.customerContext ? `<current_customer>\n${context.customerContext}\n</current_customer>` : ''}
Answer questions concisely. When referencing products, include SKU numbers. 
When discussing pricing, always note that prices are subject to current quote. 
Keep responses under 200 words unless detail is explicitly requested.`;
}
```
Conversation history is passed as the `messages` array, capped at the last 10 turns to stay within context budget.
---
## Mock Data Strategy
The mock data should tell a coherent story. Recommended customers to create:
1. **Riverside Construction Co.** — High-volume tract builder, platinum tier, 200+ units/year, loves painted shaker, price-sensitive, orders quarterly
2. **Blue Ridge Custom Homes** — Luxury custom builder, gold tier, small volume but high ASP, cherry and hickory specialist, very particular about lead times
3. **Summit Remodeling Group** — Mid-size remodeler, silver tier, eclectic mix of styles, frequent small orders, strong relationship
4. **Pacific Architectural Studio** — Architect firm, gold tier, specifies product for clients, contemporary and inset styles, needs spec sheets constantly
5. **Harbor View Cabinet Dealers** — Dealer/reseller, silver tier, buys for inventory, thermofoil and laminate focus, watches pricing closely
Each customer should have 3-8 projects and 10-30 orders across 18-24 months, with a realistic arc (growing, steady, declining, returning after a gap). This narrative richness makes the AI briefs genuinely interesting and non-generic.
---
### Critical Files for Implementation
- `/app/customers/[id]/page.tsx` — The customer hub is the central feature; all other pages radiate from it
- `/lib/ai/prompts.ts` — All system prompts and prompt-building logic live here; getting these right determines the quality of every AI feature
- `/lib/ai/context-builders.ts` — Assembles structured context for each LLM call; controls token budget and data quality passed to Claude
- `/lib/data/mock/index.ts` — The mock data query layer; everything in the app depends on this being realistic and comprehensive
- `/app/api/ai/validate-estimate/route.ts` — The most technically complex Route Handler; uses tool use for structured output and integrates catalog data with estimate line items