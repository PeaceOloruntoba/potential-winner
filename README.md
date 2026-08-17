# Vredester Scholify — Frontend

Mobile-first React app for the school portal. **Standalone repo, deployed
independently from the backend** (separate repo, separate Vercel project —
matches the backend's own README).

## Stack

React 18 + TypeScript + Vite, Tailwind CSS, React Router, Zustand (auth
state, persisted to localStorage), Axios, Sonner (toasts), Lucide icons.

## Design system

- **Colors:** deep navy (`navy-700` `#14265E`, trust/authority — this is a
  payments product) as the primary, bright action blue (`action-500`
  `#2F6FED`) reserved for interactive elements, on white/`surface-soft`
  backgrounds. Full token scale in `tailwind.config.js`.
- **Type:** Plus Jakarta Sans (`font-display`) for headings/UI, Inter
  (`font-body`) for dense data — loaded via Google Fonts in `index.html`.
- **Signature motif:** the "balance pill" (`BalancePill` in
  `components/ui/Badge.tsx`) — a consistent amount-owed badge reused on the
  parent dashboard's child cards, the child detail invoice view, and the
  admin billing log, so money-owed state looks the same everywhere it shows up.
- **Mobile-first shell** (`components/layout/AppShell.tsx`): desktop always
  gets a left sidebar; mobile gets a bottom tab bar when a role has 4 or
  fewer destinations (Parent, Teacher), or a slide-out drawer when it has
  more (Admin's 9 sections) — same nav data, the shell picks the layout
  that fits.
- **Interaction states throughout:** every `Button` has a built-in
  `isLoading` state that disables the button and swaps in a spinner (no
  double-submits), every list has a loading skeleton + an `EmptyState` with
  a clear next action, every mutation shows a Sonner toast on success/failure.

## Local setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend (local or deployed)
npm run dev              # http://localhost:5173
```

Requires the backend running (see the backend repo's README) with at least
one admin bootstrapped via `npm run seed:admin` there.

## Structure

```
src/
├── lib/api.ts              # axios instance, JWT interceptor, error-message humanizer
├── store/authStore.ts       # zustand auth state (persisted)
├── types/index.ts           # shared TS interfaces mirroring the backend
├── components/
│   ├── ui/                  # Button, Input, Select, Card, Badge, Modal, Skeleton, EmptyState, PassportUpload...
│   ├── layout/AppShell.tsx  # sidebar / bottom-tabs / drawer, role-aware
│   └── ProtectedRoute.tsx   # auth + role route guard
├── pages/
│   ├── auth/                # Login, Register
│   ├── parent/               # Dashboard, Apply, Child detail, Payment callback
│   ├── teacher/               # Dashboard, Score entry grid
│   └── admin/                 # Dashboard, Approvals, Admissions, Students, Teachers,
│                                 Classrooms, Assessments, Fees & Terms, Billing, Settings
└── App.tsx                  # router, role-gated route groups
```

## Known v1 notes / follow-ups

- **Two backend endpoints were added specifically to support this frontend**
  during the build: `GET /meta/classrooms` and `GET /meta/current-term`
  (any authenticated role — the admin CRUD versions under `/admin/*` are
  ADMIN-only and parents/teachers need read access to the same data), and
  `GET /teacher/my-assignments` (a teacher's own classroom/subject list,
  which didn't exist before — only the admin-facing "list all teachers"
  endpoint did). If your backend zip predates this, make sure you're on the
  latest one.
- **Payment confirmation is webhook-driven, not polled.** `PaymentCallbackPage`
  intentionally doesn't try to detect success itself — the backend webhook is
  the source of truth, so the callback page just tells the parent to check
  back rather than guessing at a status that may not have landed yet.
- **Classroom/subject/teacher management has no edit or delete UI** — you
  can add, but not rename or remove, from the admin pages built here. The
  backend doesn't currently expose those endpoints either (documented as a
  v1 simplification there too).
- **No real end-to-end test pass yet.** This was built and statically
  verified (import/export resolution, bracket balance, route param
  matching) but not run against a live backend or a real `npm run build` —
  the sandbox's npm registry access was unavailable at build time. Worth
  running `npm install && npm run build` yourself before deploying, and
  treating this as a first full-scale-test candidate rather than
  production-verified code.

## Deploying (Vercel)

1. Push this repo to its own Vercel project (separate from the backend's).
2. Set `VITE_API_BASE_URL` in Vercel env vars to your backend's deployed URL + `/api/v1`.
3. `vercel.json` handles SPA routing (`/*` → `/index.html`) so React Router's client-side routes work on refresh/direct load.
