@AGENTS.md

# Ashas Dashboard — Project Brief

Personal dashboard untuk agency web development (single-user MVP, data persisted ke browser localStorage key `ashas-dashboard:v1`).

Stack: Next.js 16.2.6 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript. **Read `node_modules/next/dist/docs/` before writing Next.js code** — this Next is not the one in your training data (params is async, PageProps/LayoutProps helpers are global, etc).

---

## Design System — Source of Truth

Tokens are declared in `app/globals.css` under `@theme inline`. Use the Tailwind utilities (e.g. `bg-navy-dark`, `text-cyan-accent`, `border-slate-gray`) — **never hardcode hex values in components**.

### Color palette (flat colors only — no gradients anywhere)
| Token            | Hex       | Purpose                                              |
| ---------------- | --------- | ---------------------------------------------------- |
| `ashas-blue`     | `#3E7FA3` | Primary — buttons, links, active states              |
| `navy-dark`      | `#1C2D3E` | Dark background — sidebar, header, dark surfaces     |
| `off-white`      | `#F4F1EC` | App background — main canvas                         |
| `cyan-accent`    | `#00C2CC` | Accent line before section titles, highlights        |
| `slate-gray`     | `#8A9BAE` | Secondary text, muted borders, inactive states       |

Extra utility tokens (derived, but allowed):
- `border-slate-gray/20` etc. for subtle dividers
- `text-navy-dark/70` for body text on light bg
- Pure `white` for card surfaces on the off-white canvas
- Status colors (success/warning/danger): stick to emerald-600, amber-500, rose-600 — NEVER replace them with gradients.

### Typography
- Single family: **Inter** (loaded via `next/font/google`)
- Weights in use: `400` (Regular), `700` (Bold), `800` (ExtraBold). Do not use other weights.
- Page titles: ExtraBold (800) — `text-2xl sm:text-3xl font-extrabold`
- Section titles: Bold (700) — `text-base sm:text-lg font-bold`
- Body & UI: Regular (400)
- Labels/uppercase eyebrows: Bold (700) `text-xs uppercase tracking-wider`

### Rules (must follow)
1. **No gradients.** Flat color only. `bg-gradient-*` is banned. If you see one, replace it.
2. **Cyan accent line before every section title.** Use `<SectionTitle>` (from `app/_components/SectionTitle.tsx`) — it renders a 4px wide cyan bar before the heading. Width 3-6px range, height matches title.
3. **Generous whitespace.** Page container has `py-20` (80px) vertical padding minimum on desktop. Section blocks separated by `mt-16` minimum. Cards have `p-8` inner padding minimum.
4. **Mood:** Modern · Minimalis · Bernyawa · Profesional · Unik. When unsure, prefer empty space over decoration.

### Layout structure
- `<Header>` — sticky top, navy-dark background. Left: logo (`/public/logo.png` via `next/image`). Right: profile photo (`/public/profile.png`, `rounded-full`, `border-2 border-orange-500`).
- `<Sidebar>` — fixed left on desktop, navy-dark. Holds nav links only (no logo — logo lives in Header).
- `<MobileNav>` — bottom tab bar on mobile.
- Main content sits in `md:pl-64` (left padded for sidebar) and `pt-20` (below header) with `max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20`.

---

## Data Model

Stored in localStorage key `ashas-dashboard:v1` as `DashboardData`:

```ts
{ clients, projects, tasks, transactions, meetingNotes, revisions }
```

### Client
Status options: `active | inactive | lead | negosiasi | revisi | completed | on-hold`. Optional `deadline` (ISO date) for the overall client engagement target. **The client's deadline is the source of truth — projects under a client inherit this deadline** (Project no longer has its own `deadline` field; use `getProjectDeadline(project, clients)` from `app/_lib/derived.ts`).

### Project
No `deadline` field — derived from `client.deadline`. Budget tracking is dynamic via `app/_lib/derived.ts`:

- `getProjectBudgetRemaining` — `budget − committed expenses` (paid + pending, excludes overdue). The headroom you still have to spend.
- `getProjectIncomePaid` / `getProjectExpensesPaid` — actual cash flows (status = paid only).
- `getProjectNetCash` — paid income minus paid expenses. **Can be negative** — that's the case the user explicitly wanted surfaced (e.g. DP 500k masuk, hosting 700k keluar → Net Cash −200k).
- `getProjectBudgetSnapshot` returns the full `ProjectBudgetSnapshot` object (budget, incomePaid, expensesPaid, expensesCommitted, netCash, budgetRemaining).
- `rollupBudgetSnapshots` sums snapshots — used in `/clients/[id]` KPI sidebar to show the client-level rollup across all their projects.

Render the snapshot with `<BudgetSummary>` (`app/_components/BudgetSummary.tsx`) — `variant="panel"` for the full breakdown, `variant="compact"` for the 2×2 grid used inside project list cards.

### MeetingNote
`{ id, clientId, projectId?, title, content, date, createdAt }` — catatan dari pertemuan/diskusi dengan klien.

### Revision
`{ id, clientId, projectId, title, description, status: requested|in-progress|done, requestedDate, completedDate?, notes? }` — track permintaan revisi dari klien per project.

---

## Supabase Integration

**Project URL:** `https://zdcrflagffbdguaioklk.supabase.co`
**Env file:** `.env.local` — never commit this file.

### Auth flow
GitHub OAuth → Supabase → `/auth/callback` → session cookie → dashboard.
`proxy.ts` (Next.js 16 replacement for `middleware.ts`) guards all routes — unauthenticated requests are redirected to `/login`.

### Database
6 tables in `public` schema: `clients`, `projects`, `tasks`, `transactions`, `meeting_notes`, `revisions`.
All rows have `user_id uuid` (references `auth.users`) — RLS ensures users can only access their own data.
Column naming: snake_case in DB, camelCase in TypeScript. Mapper functions live in `app/_lib/supabase/db.ts`.

### Data layer
`DashboardProvider` now uses Supabase instead of localStorage:
- On mount: fetch all 6 tables in parallel via `Promise.all`
- First login (0 clients): auto-inserts seed data from `app/_lib/seed.ts`
- All CRUD operations use optimistic updates — UI updates immediately, Supabase syncs in background, rollback on error

### Key files
- `app/_lib/supabase/client.ts` — `createBrowserClient()` for Client Components
- `app/_lib/supabase/server.ts` — `createServerClient()` for Route Handlers
- `app/_lib/supabase/db.ts` — `fromDb*` / `toDb*` mapper functions
- `proxy.ts` — auth guard (Next.js 16 "proxy" convention, replaces middleware.ts)
- `app/login/page.tsx` — GitHub OAuth login page
- `app/auth/callback/route.ts` — OAuth callback handler
- `supabase-schema.sql` — full schema SQL (run once in Supabase SQL Editor)

## Routes

| Path                | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| `/`                 | Dashboard home — KPI cards, recent projects, upcoming tasks, recent transactions |
| `/clients`          | Client list (cards, search, status filter)                  |
| `/clients/[id]`     | Client detail — info, projects/tasks, invoices, timeline, meeting notes, revisions |
| `/projects`         | Project list with progress + deadline                       |
| `/tasks`            | Kanban 3-column (todo / in-progress / done)                 |
| `/finance`          | Income/expense table + KPI                                  |

---

## Progress log

Update this list after each working block so future sessions know where we are. Append, don't rewrite history.

- **v0.1** — Initial 5-page MVP (dashboard, clients, projects, tasks, finance) with localStorage persistence + seed data.
- **v0.2** — Design system overhaul: Ashas palette (navy/cyan/off-white), Inter typography, flat-color rule, cyan accent on section titles, generous padding. Added top `<Header>` with logo + profile photo (rounded-full, border-orange-500). Sidebar restyled to navy. Smoke test passed: all 7 routes return 200.
- **v0.3** — Client model expanded: `deadline`, statuses `negosiasi/revisi/completed/on-hold`. New data types `MeetingNote` + `Revision`. New route `/clients/[id]` with full detail: info card + KPI sidebar, progress timeline (chronological events), projects + inline to-do list per project, invoice & payment tracker (CRUD), meeting notes (CRUD), revision management (CRUD with status transitions). Clients list cards are now clickable links to the detail page. Smoke test passed: `/clients/c1`, `/clients/c2` return 200.
- **v0.4** — Client ↔ Project integration:
  - `project.deadline` removed; deadline is derived from `client.deadline` (helper: `getProjectDeadline`). All UIs updated (projects list, dashboard home, client detail).
  - Invoice section on `/clients/[id]` now supports **expense** type in addition to income. Expenses linked to a project automatically reduce that project's remaining budget. Modal shows live "Budget · Sudah Keluar · Sisa" preview when adding an expense.
  - Budget remaining (`getProjectBudgetRemaining`) is shown on project cards (both `/projects` and `/clients/[id]`) — red when overspent.
  - Client cards: removed "Lihat detail →" button — entire card is the link.
  - Project list cards: client name is now a `<Link>` to `/clients/[id]`.
  - Seed data: added 4 expense transactions tied to projects so the budget remaining UI is non-empty out of the box. `tr3` reclassified to expense (`tr7` is the new untied "Lisensi Figma").
- **v1.5** — Workspace page (`/workspace`) dengan Excalidraw embedded. Dynamic import (ssr:false) untuk avoid SSR error. Auto-save ke Supabase (debounced 1.5s). Multi-board: buat, rename, hapus board. Left panel = board list (dark sidebar), right = full-canvas Excalidraw. DashboardShell updated: workspace route mendapat full-height tanpa padding (no max-w, no px/py). SQL: tabel `workspace_drawings`. Package: `@excalidraw/excalidraw`.
- **v1.4** — Removed 5 features entirely: Time Tracking, Fase/Sprint, Payment Milestones, File & Link, Piutang A/R system. Cleaned up from types.ts, supabase/db.ts, DashboardProvider (imports, Ctx type, empty state, fetch calls, CRUD functions, value/deps), projects/[id] page (sections + state + handlers), finance page (sections + modals). File `supabase-new-features.sql` tetap ada untuk referensi tapi tables tidak dipakai oleh app.
- **v1.3** — Piutang (A/R) system lengkap: "Tambah Piutang" modal (klien, project, nomor invoice, nominal, tanggal, jatuh tempo), Aging analysis (0-30h/31-60h/>60h dengan warna), modal "Lunasi" yang proper (jumlah diterima, tanggal, metode: transfer/cash/ewallet/giro, catatan), support cicilan/partial payment (buat transaksi paid sebagian + sisa tetap pending dengan summary konfirmasi), tombol "Overdue" untuk flag manual.
- **v1.2** — Tasks page: unified database ALL task + revisi dari semua project. Color stripe kiri = warna project/klien. Filter: type (task/revisi), status (pending/done), per-project. Badge: tipe, prioritas, status. Klik checkbox toggle selesai. Finance page: full redesign — period selector (Bulan/3M/6M/Tahun/Semua), 6 KPI cards, cash flow bar chart 12 bulan + tabel, Laporan Laba Rugi (P&L) dengan margin %, Piutang per klien (tandai lunas), Jadwal Milestone, Utilisasi Budget per project, Profitabilitas per Project, Pendapatan per Klien, tabel transaksi lengkap.
- **v1.1** — 4 fitur baru di `/projects/[id]`: (1) Fase & Sprint — horizontal stepper, template default (Brief→Design→Dev→Review→Launch), klik untuk cycle status. (2) Time Tracking — log jam per hari, total hari ini/minggu/all-time. (3) Milestone Pembayaran — jadwal DP/progress/pelunasan, tandai lunas = auto-buat transaksi. (4) File & Link — simpan URL Figma/GitHub/staging/GDrive dengan ikon per tipe. SQL: `supabase-new-features.sql`.
- **v1.0** — 9 fitur baru: (1) Deadline warning alerts di dashboard + project cards jika deadline ≤7 hari & progress <80%. (2) Tracker harian: toggle "Lihat semua" dengan group by date. (3) Task inline editing: klik Edit → ubah priority + deadline langsung. (4) Task bulk add seperti revision. (5) Project duplication (klone project + tasks). (6) Referral/source field di client. (7) Last contact dari meeting notes terbaru. (8) Status history otomatis tercatat di meeting notes saat status berubah. (9) Global search (Ctrl+K) di header — mencari klien, project, task.
- **v0.9** — Project detail page completed: Progress Timeline (per-project, shows all events chronologically), Task list same style as Revision list (simple checklist + priority dot + bulk add via textarea), Revision bulk add can also create tasks simultaneously (checkbox option). Both lists use same checkbox UX. Fixed: all sections from old client detail (timeline, meeting notes, invoices) are now in project detail.
- **v0.8** — Project detail page: `/projects/[id]` (daily tracker, revision checklist + bulk add, task list, meeting notes, budget, transactions). Client detail stripped to info + KPI + project summary cards (no more meeting/revision/invoice detail in client). Fixed revision text overflow (`break-words`). Format IDR: `Rp7.000.000` (no space). `daily_logs` table added (SQL: `supabase-schema.sql`).
- **v0.7** — Supabase integration: auth (GitHub OAuth via proxy.ts), 6-table schema with RLS, DashboardProvider rewritten from localStorage to Supabase with optimistic updates. Login page at `/login`. Auto-seed on first login.
- **v0.6** — Client color coding + detail simplification:
  - New `app/_lib/colors.ts` — `CLIENT_PALETTE` (8 flat colors, no gradients) + `getClientColor(clientId, clients)` assigns a color per client by insertion order.
  - Client cards (`/clients`) and project cards (`/projects`) now share the same left-border stripe + subtle flat tint background per client. A project card for "Budi Santoso" shows the same color as Budi's client card.
  - Client name on project card uses the client's accent color for the link text.
  - Client detail project subcards simplified: removed `<BudgetSummary>` panel (moved to `/projects`). Now shows a compact 4-cell row (Budget · Diterima · Dikeluarkan · Net Cash) inline. Detailed breakdown lives only in `/projects`.
  - Sidebar KPI rollup (`<BudgetSummary>`) in `/clients/[id]` stays — gives client-level total across all their projects.
- **v0.5** — Net Cash visibility:
  - New helpers: `getProjectIncomePaid`, `getProjectExpensesPaid`, `getProjectNetCash`, `getProjectBudgetSnapshot`, `rollupBudgetSnapshots`. Encapsulates the user-requested math (DP masuk − hosting keluar = net, can be negative).
  - New reusable component `<BudgetSummary>` renders the full panel: Budget · Diterima (+) · Dikeluarkan (−) · **Net Cash** · Sisa Budget. Net Cash and Sisa Budget are emphasized (red when negative/overspent, green when healthy). Compact variant available for tight layouts.
  - `/clients/[id]`: KPI sidebar replaced "Total Dibayar" + "Total Budget Project" with a single `<BudgetSummary>` rollup across all of the client's projects. Each project subcard in "Project & Task Tracking" now renders its own `<BudgetSummary>`.
  - `/projects`: each card shows the compact 2×2 BudgetSummary (Diterima, Dikeluarkan, Net Cash, Sisa Budget) when the project has any money associated.
