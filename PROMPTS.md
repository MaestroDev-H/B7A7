# Nestly Frontend: Antigravity Prompt Playbook (B7A7)

Domain: **Housing & Roommate Platform** (matches your B7A6 backend: `MaestroDev-H/B7A6`).
Roles: **ADMIN**, **OWNER** (the assignment's "provider"), **TENANT**.

> **Heads-up on the domain table.** The assignment table maps a student-ID ending in 7 to *Field Service Management*, but your backend is *Housing & Roommate* (the row for 6). The assignment says the frontend domain **must match your B7A6 backend**, so this playbook builds Housing. If your mentor wants Field Service, tell me and I'll redo the prompts.

> **Keep this README outside the project folder** (or rename it `PROMPTS.md`). The last prompt makes Antigravity write the project's real README.

---

## 0. Read this first

### Timeline reality check
The deadline is **October 10, 2026, 11:59 PM**. The 5-day plan doesn't fit, so the prompts are ordered so that the marks that are hardest to recover come first: setup → auth + demo login → **deploy early** → payments. Run roughly: **Day 1** prompts 1–5, **Day 2** prompts 6–10, **Day 3** prompts 11–15 plus the video. `AGENTS.md` has a "cut in this order" list if you run short.

### How to use these with Antigravity
1. Create an empty folder `nestly-frontend`, open it in Antigravity.
2. Copy **`AGENTS.md`** into the folder root. (If your build doesn't auto-read it, save the same text as `.agent/rules/project.md`, or paste it as your very first message.)
3. Paste prompts **one at a time, in order**. Wait for each to finish and verify before the next.
4. Use **Planning mode** for prompts 1–5 and 10–12 (they touch many files). Let the browser agent verify each flow.
5. After every prompt, you should see a green `lint`, `tsc` and `build`, and new commits in `git log`. If not, reply: *"Fix lint/tsc/build errors, then commit."*

### Backend pre-flight (do this BEFORE prompt 1; it affects the frontend)
Your backend README admits it was never run against a live DB or Stripe, so verify it. These are changes in the **backend** repo:

| # | Check | Why it matters |
|---|---|---|
| 1 | Backend is **deployed** (Vercel) with a Postgres DB, migrations applied and `npm run prisma:seed` run. Note the URL: `https://<backend>.vercel.app/api/v1` | Everything depends on it |
| 2 | Add `app.set('trust proxy', 1)` in `src/app.ts` right after `const app = express()` | Behind Vercel every user shares one IP, so the rate limiter (auth 20 / 300 per 15 min) would lock **all** evaluators out after a few demo-logins |
| 3 | Set `CLIENT_SUCCESS_URL=https://<frontend>.vercel.app/payment/success` and `CLIENT_CANCEL_URL=https://<frontend>.vercel.app/payment/cancel` (backend appends `?invoiceId=`) | Stripe redirects users to these |
| 4 | Stripe test keys set, and a webhook endpoint `https://<backend>.vercel.app/api/v1/payments/webhook` created in the Stripe dashboard (events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`), with its `whsec_…` in `STRIPE_WEBHOOK_SECRET` | Without the webhook, invoices never flip to PAID |
| 5 | Cloudinary vars set | Image uploads |
| 6 | SMTP vars set (Gmail app password / Resend) | Registration OTP email. If you skip this, new sign-ups can't verify, and only demo accounts work |
| 7 | Optional: raise `authLimiter` `max` to ~60 | Safety margin while evaluators click around |

Local development: also fine to run the backend locally on `http://localhost:5000/api/v1` and use `stripe listen`.

### Stripe test card for your demo/video
`4242 4242 4242 4242`, any future expiry, any CVC, any postal code.

---

## PROMPT 1: Bootstrap, env, and API smoke test

```text
Read AGENTS.md fully. We are building the Nestly frontend.

1. Scaffold: `npx create-next-app@latest .` with TypeScript, Tailwind, ESLint, App Router, `src/` dir, import alias `@/*`, Turbopack, pnpm. Initialise git and make the first commit.
2. Install: @tanstack/react-query, zustand, react-hook-form, @hookform/resolvers, zod, sonner, recharts, next-themes, jose, date-fns, lucide-react, server-only. Dev: prettier, prettier-plugin-tailwindcss, @next/bundle-analyzer.
3. Init shadcn/ui (neutral base, CSS variables). Add components: button, input, label, textarea, select, checkbox, radio-group, switch, form, dialog, alert-dialog, sheet, dropdown-menu, popover, command, tabs, table, badge, card, skeleton, separator, avatar, tooltip, sonner, pagination, calendar, input-otp, progress, scroll-area, sidebar (if available), breadcrumb.
4. Create the folder structure from AGENTS.md section 7 (empty folders get a .gitkeep only if needed). Configure `tsconfig` strict + `noUncheckedIndexedAccess`. Add scripts: `typecheck` (tsc --noEmit), `analyze`. Configure `next.config.ts` with images.remotePatterns for res.cloudinary.com, images.unsplash.com, lh3.googleusercontent.com.
5. Create `.env.example` per AGENTS.md section 7 and a local `.env.local` (git-ignored). I will fill API_BASE_URL.
6. Write `scripts/smoke.mjs` (plain Node, no deps) that reads API_BASE_URL and, against the REAL backend, checks: GET /properties (envelope + meta), login for all 3 demo accounts, GET /users/me with each token, GET /admin/dashboard-stats (admin), GET /properties/my-properties (owner), GET /tenancies/my-invoices (tenant), POST /auth/refresh-token rotation (the old refresh token must then fail), and prints a pass/fail table plus the sample JSON shape of properties[0], an invoice, and a tenancy.
7. Run the smoke test. Report any endpoint that does not match AGENTS.md section 3. If the shape differs, update AGENTS.md and tell me what changed. Stop and tell me if the backend is unreachable.

Commits (separate): chore: scaffold Next.js app; chore: add dependencies and shadcn/ui; chore: configure strict TypeScript, image domains and env template; test: add backend smoke-test script.
```

**Check:** smoke table is all green; `pnpm dev` shows the default page.

---

## PROMPT 2: Design system and shared UI kit

```text
Follow AGENTS.md section 6 exactly (palette, fonts, shape, copy rules). Do not use cream/terracotta/purple-gradient defaults.

1. `globals.css`: CSS variables for light + dark (ink, tea green primary, mist background, surface, brass, signal red, semantic success/warning/info, border, ring), mapped into Tailwind/shadcn tokens. Verify text/background pairs are at least 4.5:1 and fix any that are not. Add `next-themes` ThemeProvider and a ThemeToggle.
2. Fonts via next/font: Bricolage Grotesque (display) and Figtree (body); expose as CSS variables and Tailwind `font-display` / `font-sans`. Define a type scale (h1–h4, body, small) as utility classes.
3. Build these reusable components in `src/components/shared/` (typed props, accessible, documented with a short JSDoc):
   - `DoorPlate` (room number as an engraved brass plate; this is the product's signature element)
   - `StatusBadge` (one component mapping every enum value in AGENTS.md section 6 to a color + icon + readable label)
   - `StatCard` (label, value, optional delta/icon, loading state)
   - `MoneyText` (Decimal-string safe, USD)
   - `EmptyState`, `PageHeader` (title, description, actions, breadcrumbs), `SearchInput` (debounced, clearable, labelled)
   - `Pagination` (URL-driven, built on shadcn pagination, shows "Showing x–y of z")
   - `DataTable` (generic `<T>`, columns config, responsive: table on md+, stacked cards on mobile, built-in skeleton rows and empty state)
   - `ConfirmDialog` (AlertDialog wrapper with async confirm + pending state)
   - `ImageFallback` (tinted surface + lucide Home icon, used when an entity has no images)
   - `FormField` wrappers over shadcn Form for text, textarea, select, number, date, checkbox-group, and tag input
   - `Skeletons`: CardGridSkeleton, TableSkeleton, StatGridSkeleton, DetailSkeleton, FormSkeleton
4. Create `src/lib/format.ts` (formatMoney, formatDate, formatDateTime, relativeTime, toISODateTime that always returns a UTC `Z` string, enumLabel e.g. UNDER_MAINTENANCE → "Under maintenance").
5. Create a temporary, git-ignored `/dev/kit` page that renders every component in every state at 375px and 1280px, in light and dark. Screenshot it with the browser agent, critique spacing/contrast/hierarchy, and fix issues. Delete the page before committing, or keep it behind `process.env.NODE_ENV === 'development'`.

Commits: style: add Nestly design tokens, fonts and dark mode; feat: add DoorPlate, StatusBadge, StatCard, MoneyText; feat: add DataTable, Pagination, SearchInput; feat: add EmptyState, ConfirmDialog, ImageFallback and skeletons; feat: add form field wrappers; feat: add formatting utilities.
```

**Check:** kit page looks coherent in light/dark; `StatusBadge` handles every enum.

---

## PROMPT 3: API layer, TanStack Query and shared hooks

```text
Implement AGENTS.md sections 3 and 5.3–5.4. Everything fully typed, no `any`.

1. `src/lib/api/types.ts`: ApiResponse<T>, Paginated<T> (data + meta), `type Decimal = string`, enum string unions (Role, PropertyType, RoomStatus, ViewingStatus, ApplicationStatus, TenancyStatus, InvoiceType, InvoiceStatus, PaymentStatus, MaintenanceStatus, MaintenancePriority, NotificationType) and interfaces for User, Property, Room, RoommatePreference, RoommateMatch, ViewingRequest, Application, Tenancy, Invoice, Payment, MaintenanceRequest, Notification, AuditLog, AdminStats. Include the relation shapes each endpoint returns (e.g. `ApplicationWithRoom`, `TenancyWithInvoices`, `InvoiceWithTenancy`), exactly as in AGENTS.md section 3.2.
2. `errors.ts` with `ApiError` (status, message, errors[], code?). `http.server.ts` (import 'server-only', reads the accessToken cookie, calls API_BASE_URL, supports `next: {revalidate, tags}`) and `http.client.ts` (calls `/api/proxy/*`, redirects to /login on SESSION_EXPIRED, supports FormData with XHR progress callback for uploads).
3. `src/app/api/proxy/[...path]/route.ts`: forwards GET/POST/PUT/PATCH/DELETE to the backend, attaches Bearer from cookie, streams/forwards body (including multipart), and on 401 performs ONE refresh-and-retry using a shared `refreshSession()` helper in `src/lib/auth/refresh.ts` (module-level Map dedupes concurrent refreshes because the refresh token rotates), writes new cookies, and returns `{success:false, code:'SESSION_EXPIRED'}` with 401 if refresh fails.
4. `src/lib/api/services/*.ts`: one file per resource (auth, users, properties, rooms, roommates, viewings, applications, tenancies, payments, maintenance, admin, uploads, notifications) exposing typed functions `(http, params) => Promise<T>` for every endpoint in section 3.2.
5. `src/lib/queries/keys.ts` key factories; `src/hooks/use-*.ts` wrappers bound to http.client for each resource (queries + mutations). Mutations that need optimistic updates (AGENTS.md 5.3) implement `onMutate/onError/onSettled` via one reusable `useOptimisticMutation` helper.
6. `src/components/providers/query-provider.tsx` (client): QueryClient defaults from 5.3, QueryCache/MutationCache global `onError` → Sonner toast with `ApiError.message` (skip when `meta.silent`). Mount in root layout with `<Toaster richColors closeButton />`.
7. `src/lib/query/prefetch.ts`: `prefetchAndDehydrate(queries)` for Server Components (uses http.server) and a tiny `<Hydrate>` usage example in a comment.
8. Hooks: `useDebounce`, `useListParams(zodSchema)` (URL ↔ typed params, resets page on filter change, debounced text), `usePagination`, plus utils `paginate()` and `applyFilters()` for array endpoints.
9. `applyServerErrors(form, error)` helper that maps backend `errors[].field` onto RHF fields.
10. Write unit tests (Vitest) only for pure utils: paginate, applyFilters, toISODateTime, applyServerErrors, formatMoney. Add `test` script.

Commits: feat: add typed API models; feat: add server and client http layers; feat: add authenticated proxy route with single-flight refresh; feat: add resource services; feat: add query keys, hooks and optimistic helper; feat: add QueryProvider with global error toasts; feat: add URL-state and pagination hooks; test: cover pagination and formatting utilities.
```

**Check:** `pnpm test` passes; no `any` (`grep -R ": any" src` is empty).

---

## PROMPT 4: Authentication, proxy guard, demo login

```text
Implement AGENTS.md section 5.2 and the login layout from the assignment (Email, Password, [Login], "OR", "Quick Demo Login", Admin / Tenant / Owner cards each with a [Demo Login] button).

1. `src/lib/auth/*`: cookie helpers (set/clear tokens; maxAge from JWT exp via `jose.decodeJwt`), `getSession()` (decodes cookie token, no network), `getCurrentUser()` (React `cache` + GET /users/me), `requireRole(role | role[])` server guard (redirect /login or /forbidden), `roleHome(role)`, `safeNext(path)` (same-origin relative only), and role/prefix map.
2. `src/actions/auth.ts` Server Actions: `login`, `demoLogin(role)` (reads DEMO_* from server env), `register`, `verifyEmail` (logs user in on success), `resendOtp`, `logout` (calls POST /auth/logout, clears cookies even if the call fails). Return typed `{ok:true,...} | {ok:false,message,errors}` results; do not throw for expected failures.
3. `src/proxy.ts` (or middleware.ts if Next ≤15) exactly as in 5.2: protect /admin, /owner, /dashboard, /payment; bounce authed users away from /login and /register to their role home; refresh tokens when missing/expired with forwarded-cookie technique; enforce role→prefix; redirect wrong roles to their home with `?denied=1` (the shell shows a toast). Use a precise `matcher` that excludes `_next`, static files and `/api`.
4. `GET /api/auth/session` route handler returning `{ user: {id,name,email,role} | null }` from the cookie (no backend call).
5. Zustand `stores/auth-store.ts`, `hooks/use-auth.ts` (`user, role, isAdmin, isOwner, isTenant, isRole()`), `components/shared/RoleGate.tsx`, and an `<AuthHydrator user>` client component that seeds the store from server layouts.
6. Pages in `app/(auth)`: 
   - `/login`: split-screen layout (left: brand panel with real copy about finding a room and a roommate, no stock-photo placeholder; right: form). RHF + Zod (email valid, password required). Show the three demo cards (icon, role name, one-line description of what that role can do, [Demo Login] button with its own pending state). Handle `?next=` and `?denied=1`. 403 "Email is not verified" → link to /verify-email?email=.
   - `/register`: role chooser (two selectable cards: "I'm looking for a room" → TENANT, "I list properties" → OWNER), name, email, phone (optional), password with strength hint, confirm password. Zod mirrors backend (name≥2, password≥8). On success go to `/verify-email?email=`.
   - `/verify-email`: 6-digit `InputOTP`, resend with 60 s cooldown, success → role home.
   - Each with `metadata`, `loading.tsx` not needed for static forms but add `error.tsx` for the group.
7. Temporary minimal `/dashboard`, `/owner`, `/admin` pages that print the user's name and role so we can verify guards. They will be replaced.
8. Verify with the browser agent: demo-login each role; hit another role's URL (expect redirect + toast); delete the accessToken cookie and reload a protected page (expect silent refresh, no logout); delete both cookies (expect /login?next=); log out. Confirm the refresh token rotation works (no logout after 15 min: shorten via devtools by deleting only accessToken).

Commits: feat: add cookie session helpers and requireRole; feat: add auth server actions; feat: add proxy with role guard and token refresh; feat: add session endpoint, auth store and RoleGate; feat: add login page with one-click demo login; feat: add register and email verification flow; test: verify role redirects and silent refresh.
```

**Check:** all three demo buttons work; silent refresh works; wrong-role redirect works.

---

## PROMPT 5: App shells, navigation, error/loading scaffolding → then DEPLOY

```text
1. `components/layout/Navbar` (public): logo, links (Properties, Rooms, Services, FAQ, About, Contact), theme toggle, `NavAuthButtons` client component using `useQuery(['session'])` against /api/auth/session (guest: Log in / Sign up; authed: "Go to dashboard" + avatar menu). Mobile: Sheet menu. `Footer` with real links and real contact copy (no fake numbers).
2. `components/layout/DashboardShell`: collapsible sidebar (state in `ui-store`, persisted), on mobile it becomes a Sheet triggered from the Topbar. Topbar: breadcrumb, theme toggle, `NotificationBell` (unread count from GET /notifications?unread=true, `refetchInterval` 60 s, dropdown with latest 5 + "Mark all read" optimistic + link to the role's notifications page; for ADMIN no "view all" link), `UserMenu` (profile/settings, logout). Sidebar header shows the role chip. Skip-to-content link.
3. `lib/nav-config.ts`: role → nav items (icon, label, href, optional badge key). Use the route map in AGENTS.md section 4. Active-link highlighting via `usePathname`.
4. Group layouts: `app/(public)/layout.tsx`; `app/dashboard/layout.tsx` (requireRole('TENANT')), `app/owner/layout.tsx` (OWNER), `app/admin/layout.tsx` (ADMIN), each wrapping `DashboardShell` + `AuthHydrator` and reading `?denied=1` to toast once. All dashboard layouts export `metadata.robots = { index: false }`.
5. Scaffold ALL routes from AGENTS.md section 4 as real files with `PageHeader` and a skeleton-based `loading.tsx` each (so the structure and nav work); pages say "Coming together in the next step" ONLY temporarily and will be replaced in later prompts. Add `error.tsx` per route group, root `error.tsx`, `global-error.tsx`, `not-found.tsx` (designed, with a way back), and `/forbidden`.
6. Verify the shells at 375/768/1280 for all three roles. Fix overflow, focus order and contrast issues.
7. Then prepare deployment: add `vercel.json` only if needed, document env vars in `.env.example`, and give me exact step-by-step instructions to push to GitHub and deploy on Vercel (set API_BASE_URL, NEXT_PUBLIC_APP_URL, DEMO_* vars). Wait for me to confirm the live URL, then run the smoke script against production login and test demo login on the live URL with the browser agent.

Commits: feat: add public navbar and footer; feat: add role-aware dashboard shell with sidebar and topbar; feat: add notification bell with optimistic mark-read; feat: add role navigation config; feat: scaffold all routes with loading and error boundaries; feat: add custom 404, forbidden and global error pages; chore: add deployment configuration.
```

**Check:** deploy now. Test live demo login. Tell your backend `CLIENT_SUCCESS_URL` the live URL (pre-flight #3).

---

## PROMPT 6: Public pages and SEO

```text
Build the public marketing pages as **Server Components** (static or ISR). All copy must be real, written for Nestly's actual features (viewings → applications → tenancies → Stripe invoices, roommate matching by budget/city/lifestyle, maintenance requests, admin audit logs). No Lorem ipsum, no invented testimonials, user counts or logos.

1. `/` Home: hero that leads with the product's world (room-number door-plates and a search bar for city + type that submits to `/properties?...`); this is the ONE place for a single orchestrated entrance animation (respect prefers-reduced-motion). Sections: "Featured properties" (real data via server `fetch` with `revalidate: 60`, using the PropertyCard from prompt 7, so build a minimal version of PropertyCard now in `components/features/properties/` and extend later), "How Nestly works" (a true sequence of 4 steps, so numbered markers are legitimate here), "Roommate matching" explainer, role-specific value blocks (tenants, owners), live platform numbers ONLY from `GET /properties` `meta.total` (hide the block if the API fails), CTA band. Handle empty (no properties) and API-error gracefully on the server.
2. `/about`, `/services` (feature breakdown per role with real capabilities), `/faq` (accordion; real answers about viewings, applications, deposits, how payments work with Stripe test mode, ending a tenancy, maintenance), `/contact` (RHF + Zod form: name, email, subject, message; submit via Web3Forms using `NEXT_PUBLIC_WEB3FORMS_KEY`, success/error toasts; if the key is missing show a mailto fallback instead of a dead form).
3. Each page: `export const metadata` (title template, description, openGraph, twitter), `metadataBase` in root layout, `app/sitemap.ts` (static routes + property ids fetched from the API, tolerate failure), `app/robots.ts` (disallow /admin, /owner, /dashboard, /payment, /api). Add JSON-LD `Organization` on home.
4. Hero imagery: use `next/image` with real photography stored in `public/images` or from images.unsplash.com (set `priority`, `sizes`, meaningful `alt`). No grey boxes.
5. Run Lighthouse-style checks with the browser agent (mobile): fix any CLS, missing alt/labels, contrast failures.

Commits: feat: add home page with featured properties; feat: add about and services pages; feat: add FAQ page; feat: add contact form with validation; feat: add metadata, sitemap and robots; perf: optimise hero imagery.
```

---

## PROMPT 7: Property & room discovery, role-aware details

```text
Public discovery is the SEO/performance showcase. Server Components + URL state.

1. `/properties` (Server Component): read `searchParams` (async), validate with the same Zod schema used by `useListParams` (page, limit=12, city, type, minRent, maxRent, search, sortBy ∈ {createdAt,title}, order), fetch `GET /properties` server-side with `revalidate: 30`, render `PropertyCard` grid + `Pagination`. A client `FilterBar` island (search, city, type select, rent range, sort) updates the URL via `useListParams` with a transition and shows an active-filter chips row with "Clear all". Wrap in `<Suspense>` with `CardGridSkeleton`. Empty state: "No properties match these filters" with a Clear filters action. Never allow sortBy outside the two allowed values.
2. `PropertyCard`: `next/image` cover (ImageFallback when none), title, city/area, type badge, "from $X/mo" computed from available rooms (Number(Decimal)), count of available rooms, DoorPlate chips for up to 3 rooms.
3. `/properties/[id]` (Server Component + `generateMetadata` with OG image from first image): image gallery (client island, keyboard accessible), description, amenities, owner name/phone, rooms list (RoomCard with DoorPlate, rent, deposit, capacity, `occupancy x/y`, StatusBadge). `notFound()` on 404.
   **Role-aware actions** (client island `PropertyActions` using `useAuth`): guest → "Log in to request a viewing" (links to /login?next=); TENANT → per-room "Request viewing" and "Apply" buttons; OWNER who owns this property → "Manage property" link; other OWNER → read-only; ADMIN → "Unpublish" and "Delete" with ConfirmDialog (optimistic + invalidate).
4. `/rooms` (browse available rooms, server-paginated with `city` filter in the URL, sorted by rent as the API does) and `/rooms/[id]` (full detail via GET /rooms/:id, `generateMetadata`, same role-aware actions).
5. Dialogs (client, RHF + Zod): `RequestViewingDialog` (date + time picker → `toISODateTime`, must be in the future, optional note; handles 409 conflict message from the backend as a field/toast) and `ApplyDialog` (moveInDate ≥ today, optional message ≤ 500 chars). On success toast + invalidate `viewings.mine` / `applications.mine`, and link "View my requests".
6. Add `loading.tsx` and `error.tsx` for `/properties`, `/properties/[id]`, `/rooms`, `/rooms/[id]` (skeletons shaped like the real layout).

Commits: feat: add property listing with URL-synced filters; feat: add property card and gallery; feat: add property detail with role-aware actions; feat: add rooms browse and detail pages; feat: add request-viewing and apply dialogs; feat: add loading and error states for discovery routes.
```

---

## PROMPT 8: Tenant dashboard I (activity, roommates, profile, uploads, notifications)

```text
Tenant area `/dashboard/*`. Pattern for every page: server `page.tsx` calls `prefetchAndDehydrate`, wraps a client component in `HydrationBoundary`; client uses `useQuery` with the same key; `loading.tsx` skeleton mirrors the final layout.

1. `ImageUploader` (shared, client): drag-drop + click, previews, per-file progress bar (XHR progress through `/api/proxy/uploads?folder=…`), compresses/resizes images client-side to ≤ 4 MB / 1600 px (canvas) BEFORE upload, validates type (jpeg/png/webp/avif) and max files via props, remove/reorder, returns `string[]` of URLs to the form, accessible (keyboard, aria-live status). Used by profile avatar now, and by wizard + maintenance later.
2. `/dashboard` overview: StatCards (active tenancy, pending viewings, pending applications, unpaid invoices total), "Next payment due" card (nearest PENDING invoice with Pay button linking to /dashboard/invoices), recent activity lists from the real endpoints, quick links. Empty onboarding state if the tenant has nothing yet ("Find your first room").
3. `/dashboard/viewings`: table (DataTable) with URL-driven status filter, search by property/room, pagination (client-side via paginate/applyFilters). Columns: property, DoorPlate room, requested date, status, note. Tenants can't cancel (backend forbids), so show no cancel action.
4. `/dashboard/applications`: same table pattern; "Withdraw" (PENDING only) with ConfirmDialog and **optimistic** status flip + rollback on error; show tenancy link when APPROVED.
5. `/dashboard/roommates`: tabs "My preferences" / "Matches" / "Rooms for me". Preferences form (budgetMin/Max as numbers with `budgetMax ≥ budgetMin` refinement, preferredCity, area, gender preference, lifestyle tags via tag input with suggestions like non-smoker/early-riser/pet-friendly, moveInFrom date → ISO, bio) using PUT. Treat 404 on GET preference/me as "no preference yet", not an error. Matches list with matchScore ring and shared-tag chips; matching rooms use RoomCard. If no preference, matches/rooms tabs show an EmptyState prompting to set preferences (the API returns 400).
6. `/dashboard/notifications`: list, unread styling, mark one/mark all as read (optimistic), filter unread/all in the URL.
7. `/dashboard/profile`: profile form (name≥2, phone, avatar via ImageUploader folder=avatars → PATCH /users/me), and a change-password form (old, new≥8, confirm). On password success: toast, call logout action, redirect to /login (backend revoked the refresh token). Share this as `ProfileSettings` component reused by owner and admin.

Commits: feat: add ImageUploader with compression and progress; feat: add tenant overview; feat: add tenant viewings and applications with optimistic withdraw; feat: add roommate preferences, matches and matching rooms; feat: add notifications page; feat: add shared profile and password settings.
```

---

## PROMPT 9: Tenancies, invoices, STRIPE payments, success/cancel, maintenance

```text
Mandatory Stripe flow. The backend creates a hosted Checkout Session; we redirect and then confirm via polling (the webhook is async). Never mark anything paid on the frontend.

1. `/dashboard/tenancies`: card list of tenancies (property, DoorPlate, rent, start/end, StatusBadge, outstanding invoices count). `/dashboard/tenancies/[id]`: details, invoice table with `payments[]` history, "End tenancy" with ConfirmDialog + optional end date (ISO), ACTIVE only. Only link to tenancies from the user's own list.
2. `/dashboard/invoices`: DataTable (type, property + DoorPlate, amount, due date with overdue highlight, StatusBadge) with URL filters (status, type) and pagination. "Pay $X.XX" button on PENDING/OVERDUE rows → `POST /payments/initiate` → `window.location.assign(checkoutUrl)`; button shows a pending state, double-click safe; errors toast (e.g. already paid). Add a small note "Test mode: use card 4242 4242 4242 4242" visible only when `NODE_ENV !== 'production'` OR an env flag `NEXT_PUBLIC_SHOW_TEST_HINT=true`.
3. `/payment/success?invoiceId=`: Server shell + client `PaymentConfirmation`. Poll `GET /tenancies/my-invoices` every 2 s (max ~30 s) until that invoice status is PAID, then show a success state (amount, property, receipt-style summary, buttons to invoices and dashboard). While waiting: "Confirming your payment with Stripe…" with a progress indicator. If it times out: calm message that the payment may still be processing, with a Refresh button and link to payment history. If `invoiceId` is missing/invalid: friendly error state. Invalidate invoice/payment/tenancy/notification queries on PAID.
4. `/payment/cancel?invoiceId=`: shows that no money was taken, the invoice summary, "Try again" (re-initiate) and "Back to invoices".
5. `/dashboard/payments`: payment history (date, invoice type, amount, StatusBadge for INITIATED/SUCCEEDED/FAILED/REFUNDED), URL-synced status filter + pagination, empty state.
6. `/dashboard/maintenance`: list with status/priority filters in the URL; "New request" dialog (select from ACTIVE tenancies only, title≥3, description≥5, priority, up to 4 images via ImageUploader folder=maintenance). If the tenant has no active tenancy, show an EmptyState explaining why instead of the button.
7. Verify end-to-end on the browser agent with demo tenant: approve an application as owner first (or use data from the smoke script), pay a deposit with the Stripe test card, land on /payment/success, watch it flip to PAID. Also test cancel. Report if the webhook isn't updating invoices (that is a backend env issue, see pre-flight #4).

Commits: feat: add tenancies list and detail; feat: add invoices table with Stripe checkout initiation; feat: add payment success page with webhook polling; feat: add payment cancel page; feat: add payment history; feat: add maintenance requests with image upload.
```

**Check:** a real Stripe test payment flips an invoice to PAID. This is the mandatory item. Do not move on until it works.

---

## PROMPT 10: Owner I: the property wizard and management

```text
Owner area `/owner/*`.

1. `/owner/properties`: grid/table of `GET /properties/my-properties` with URL-driven search + type filter + pagination (client-side), per-property occupancy bar (sum currentOccupancy / sum capacity), status pill (published/hidden), actions (Manage, Unpublish/Publish toggle with **optimistic** update, Delete with ConfirmDialog). Empty state → "List your first property".
2. `/owner/properties/new`: **5-step wizard** with a stepper, per-step Zod schemas, back/next, progress, and unsaved-draft protection:
   1) Basics (title≥3, type, description) 2) Location & amenities (address≥3, city≥2, area, amenities as selectable chips + custom) 3) Photos (ImageUploader folder=properties, ≤6) 4) Rooms (repeatable room rows: roomNumber, capacity≥1 int, rentAmount>0, depositAmount≥0, description; at least one room; unique room numbers) 5) Review & publish (full summary with edit links back to each step).
   Draft persists in `stores/property-wizard-store.ts` (Zustand `persist` → sessionStorage, images are URLs so it's serializable) and is cleared on success. Submit: `POST /properties`, then `POST /rooms/property/:id` for each room **sequentially** with a progress list ("Property created ✓, Room A-101 ✓ …"); if a room fails, keep the created property, show which rooms failed with retry buttons, and don't duplicate. Numeric inputs must be sent as numbers. Lazy-load steps with `next/dynamic`. On success → toast + redirect to `/owner/properties/[id]`.
3. `/owner/properties/[id]`: tabs "Details" (edit form: title, description, address, city, area, amenities, images, isPublished; PATCH only documented fields), "Rooms" (table with edit dialog for rent/deposit/capacity/description/status, add room dialog, delete with confirm; DoorPlate everywhere), "Activity" (applications and viewings filtered to this property from the incoming endpoints). Ownership failures (403) show a forbidden state.
4. Loading skeletons + error boundaries for every route; mobile layout for the wizard (stepper collapses to "Step 2 of 5").

Commits: feat: add owner property list with optimistic publish toggle; feat: add property wizard store and step schemas; feat: add wizard steps and submission with per-room progress; feat: add property edit tabs; feat: add room management dialogs.
```

---

## PROMPT 11: Owner II: operations, earnings, overview

```text
1. `/owner/viewings`: DataTable of `GET /viewings/incoming` with URL filters (status, property, search) + pagination; row actions Approve / Reject (PENDING), Complete / Cancel (APPROVED) with **optimistic** status change, rollback on error, and a clear toast on the backend's 409 conflict message.
2. `/owner/applications`: `GET /applications/incoming` with status filter in the URL (pass `status` to the API too), applicant name/email, room DoorPlate, move-in date, message, StatusBadge. Approve/Reject with ConfirmDialog; approve explains in the dialog what happens ("Creates a tenancy and a deposit invoice due in 7 days"). Optimistic flip, then invalidate tenancies, properties, rooms, my-properties keys. Handle 409 "Room at full capacity".
3. `/owner/tenancies`: table of `GET /tenancies` (tenant, room, rent, start/end, status), filters in the URL. Actions: "Generate invoice" dialog (type RENT|UTILITY, amount (required for UTILITY, with helper text explaining the even split among active roommates), dueDate → ISO) and "End tenancy" (ConfirmDialog). `/owner/tenancies/[id]`: invoices with payments for that tenancy (this is how the owner sees paid/unpaid).
4. `/owner/maintenance`: Kanban-style board by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED) on desktop, tabs on mobile; moving a card = status PATCH with **optimistic** update; priority badges; images via `next/image`; filter by priority/property in the URL.
5. `/owner/earnings`: StatCards: projected monthly rent (sum of active tenancies' rentAmount), occupancy rate, active tenancies, collected to date. "Collected" is computed from `GET /tenancies/:id` for up to 20 active tenancies via `useQueries` (PAID invoices' amounts), with a visible "based on your 20 most recent tenancies" note when capped. Recharts (lazy via `next/dynamic`, `ssr:false` inside a client wrapper): occupancy by property (bar) and invoices by status (donut). Label projected vs collected honestly. Empty state when no tenancies.
6. `/owner` overview: StatCards (properties, rooms available/occupied, pending applications, open maintenance), a "Needs your attention" list (pending viewings/applications, urgent maintenance), recent activity. All from real endpoints, prefetched on the server.
7. `/owner/notifications` and `/owner/profile` reuse the shared components.

Commits: feat: add owner viewings with optimistic status; feat: add owner applications review; feat: add owner tenancies and invoice generation; feat: add maintenance board; feat: add earnings analytics with charts; feat: add owner overview; feat: add owner notifications and profile pages.
```

---

## PROMPT 12: Admin console

```text
Admin area `/admin/*` (ADMIN only; double-checked by proxy and `requireRole`).

1. `/admin` overview: from `GET /admin/dashboard-stats`: StatCards (users, owners, tenants, properties, rooms, active tenancies, pending applications, total revenue (Number(Decimal) as USD)). Charts (Recharts, lazy-loaded): (a) users by role (donut: admins = totalUsers − owners − tenants), (b) platform inventory (bar: properties, rooms, active tenancies, pending applications), (c) "Recent activity" area/bar chart built from `GET /admin/audit-logs?limit=100` grouped by day (client-side). State clearly in the UI that charts reflect current totals (the API has no history). Skeletons, error with retry, and empty states.
2. `/admin/users`: server-paginated `GET /users` with URL state (search, role, page, limit); table with avatar, role badge, verified/active status, created date. Row actions: change role (select in a dialog; **optimistic** update; block an admin from changing their own role), deactivate (ConfirmDialog with typed confirmation of the user's email). Show role-change impact copy.
3. `/admin/properties`: moderation table from public `GET /properties` (note in-UI that only published listings appear) with URL filters (search, city, type), owner name, rooms count, actions: View, Unpublish, Delete (ConfirmDialog). Optimistic removal with rollback.
4. `/admin/applications`: all applications across the platform from `GET /applications/incoming` (admin sees everything) with status filter in the URL, and Approve/Reject like the owner (reuse the feature components).
5. `/admin/audit-logs`: server-paginated `GET /admin/audit-logs` with URL state (page, limit, entityType select), columns: time (relative + absolute tooltip), actor (name + role badge), action (humanised, e.g. APPLICATION_APPROVED → "Application approved"), entity type/id (copy button), metadata in an expandable row (formatted JSON, safe rendering). Export visible rows as CSV (client-side Blob download).
6. `/admin/settings`: `ProfileSettings` plus an "About this console" card listing the API base host (hostname only) and app version.
7. Loading/error/empty states everywhere; DataTable collapses to cards on mobile.

Commits: feat: add admin overview with stats and lazy charts; feat: add admin user management with optimistic role change; feat: add admin property moderation; feat: add admin applications oversight; feat: add audit log viewer with CSV export; feat: add admin settings.
```

---

## PROMPT 13: Performance, accessibility, responsive and error-state audit

```text
Audit and fix against the rubric. Report findings as a table (issue → file → fix), then fix them.

1. **Server vs Client audit**: list every file with "use client" and justify it; move anything that doesn't need interactivity back to a Server Component. Ensure no client component imports server-only code. Public pages must remain static/ISR (check the `next build` route table: public marketing pages should show ○ or ISR, not ƒ, except searchParams-driven ones).
2. **Loading/Error coverage script**: write `scripts/check-routes.mjs` that walks `src/app`, and fails if a data-fetching route segment lacks `loading.tsx` or its group lacks `error.tsx`. Run it in CI later.
3. **Images**: every `<img>` replaced with `next/image` (with width/height or fill+sizes, alt); hero uses `priority`; no layout shift.
4. **Bundle**: run `pnpm analyze`; make sure Recharts, the wizard steps, and the gallery are code-split; remove unused deps; confirm no large library lands in the shared chunk. Report before/after First Load JS for 3 key routes.
5. **Hydration & console**: browse every route as each role with the console open; fix all hydration warnings (dates/timezones: render with a fixed locale/timezone or on the client), React key warnings, and 4xx/5xx noise.
6. **Request efficiency**: in the Network tab verify navigating between dashboard pages reuses cache (no duplicate calls for the same key within staleTime), no refetch storms, polling limited to the bell (60 s). Report request counts for one dashboard session against the 300/15 min limit.
7. **Responsive**: test every page at 375, 768, 1280, 1536. Fix horizontal scroll, truncated tables, tap targets < 44 px, sidebar/sheet behaviour, wizard on mobile.
8. **Accessibility**: keyboard-only pass on login, wizard, dialogs, DataTable actions, notification bell; visible focus; labels/aria for icon buttons; `aria-live` for async status; heading hierarchy; colour contrast of all StatusBadge variants in light and dark (fix those under 4.5:1); `prefers-reduced-motion`.
9. **Empty/Error states**: manually trigger each: empty list, API 500 (temporarily point API_BASE_URL at a bad host), network offline, 403 and 404 resources. Ensure no blank screens and that toasts/`error.tsx` appear.
10. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, all must pass.

Commits (as applicable): perf: code-split charts, wizard and gallery; perf: migrate remaining images to next/image; fix: resolve hydration warnings; fix: responsive layout issues on mobile; a11y: improve keyboard navigation and contrast; chore: add route coverage check for loading and error boundaries.
```

---

## PROMPT 14: Realistic demo data, CI, README, production QA

```text
1. `scripts/seed-demo-data.mjs`: uses the REAL backend API (no direct DB) to make the live demo meaningful and idempotent (skip if titles already exist): log in as the demo owner and create 6 properties across 2–3 cities (varied types, amenities, real `images.unsplash.com` photo URLs of interiors/buildings, 2–4 rooms each with realistic rents), then as the demo tenant: set a roommate preference, request viewings, submit applications for several rooms; back as owner: approve some viewings, approve one application (creating a tenancy + deposit invoice), reject one, and generate a RENT and a UTILITY invoice; as tenant submit one maintenance request. Print what it created. Never hardcode passwords: read from env (DEMO_*) and API_BASE_URL. Add `pnpm seed:demo`.
   Run it against the live backend and confirm the dashboards now look rich.
2. `.github/workflows/ci.yml`: on push/PR: install (pnpm cache), lint, typecheck, test, check-routes, build (with dummy env). Add the status badge to the README. (Deployment CI/CD bonus.)
3. Write the project **README.md**: what Nestly is, screenshots (take with the browser agent, store in `docs/screenshots`), live URLs (placeholders I'll fill), demo credentials table (the three seed accounts), role capabilities matrix, architecture overview (server vs client split, auth/BFF flow diagram in Mermaid, data layer, URL-state approach), route list, tech stack, env vars, local setup, Stripe test-card instructions, scripts, and known limitations (no time-series API, Google OAuth not implemented, etc.).
4. Production QA on the live URL with the browser agent: demo login ×3, a full tenant → owner → tenant journey (viewing → application → approval → deposit payment with Stripe test card → PAID), image upload in the wizard (compressed), URL-synced filters (copy a filtered URL into a new tab), logout/login, mobile viewport. Report any prod-only failure (CORS, env, cookies `secure`, redirects) and fix.
5. Confirm `git log --oneline | wc -l` ≥ 40 and that messages follow conventional commits. If any commits are vague, tell me, don't rewrite history without asking.

Commits: feat: add demo data seeding script using the live API; ci: add lint, typecheck, test and build workflow; docs: add project README with architecture and demo credentials; docs: add screenshots; fix: production environment issues (if any).
```

---

## PROMPT 15: Final rubric audit (earn the last marks)

```text
Act as a strict grader with the assignment rubric. Create `docs/REQUIREMENTS_CHECKLIST.md` that, for EVERY item below, states PASS/FAIL, the exact file path(s) as evidence, and (for FAIL) fixes it immediately:

Mandatory: App Router with justified Server/Client split + layout/page/loading/error/not-found/global-error · Tailwind + shadcn · Auth with httpOnly cookies, proxy/middleware protection, role-based UI for 3 roles · One-click demo login for all 3 roles · TanStack Query + Zustand + skeletons + error boundaries · RHF + Zod on ALL forms (list every form and its schema file) · Stripe test-mode flow incl. success and cancel · 100% real API data (grep for Lorem, "TODO", hardcoded arrays, "placeholder") · URL state for all filters/sort/search/pagination (list each page) · 18+ pages (list all with their roles) · multi-step wizard · file upload with progress and preview · charts on admin dashboard · optimistic updates (list each) · toast notifications · reusable components and custom hooks (list them) · TypeScript strict with zero `any` (`grep -R "any" src` evidence) · metadata on public pages · next/image everywhere · 20+ meaningful commits · deployed URL works · env vars documented.

Then: run the complete production QA once more on the live URL and give me (a) a final submission block in the exact template from the assignment (leave my URLs as placeholders), and (b) a 7-minute video script with timestamps that follows the assignment's video guide and names the exact files/pages to show for each section.

Commit: docs: add requirements checklist and final audit fixes.
```

---

## Submission template (fill after deployment)

```text
Project Name            : Nestly: Housing & Roommate Management Platform
Backend Repo            : https://github.com/MaestroDev-H/B7A6
Frontend Repo           : https://github.com/<you>/nestly-frontend
Live Backend URL        : https://<backend>.vercel.app
Live Frontend URL       : https://<frontend>.vercel.app
API Documentation       : Postman collection in the backend repo (postman/Housing-Platform.postman_collection.json)
Demo Video              : <Loom or Drive link>
Demo Admin Email        : admin@housing.com
Demo Admin Password     : Admin@12345
(Also: Owner owner@housing.com / Owner@12345, Tenant tenant@housing.com / Tenant@12345, or just use the one-click buttons)
```
The assignment warns against sharing personal passwords. These are seed demo accounts, which is fine, but never reuse them anywhere else.

---

## Video outline (5–10 min, maps to the grading guide)

| Time | Show | Say |
|---|---|---|
| 0:00 | Home page, design tokens, door-plate motif, dark mode | The problem, the design system, the 3 roles |
| 1:00 | VS Code: `app/(public)/layout.tsx`, `dashboard/layout.tsx`, `loading.tsx`, one page with `HydrationBoundary` | Server Components for public SEO pages (ISR), server shell + client islands for dashboards, why |
| 2:30 | Login → Demo **Tenant**, tour; logout → Demo **Owner**; logout → Demo **Admin**; try `/admin` as tenant (redirect + toast) | Cookies + `proxy.ts` + `requireRole` + `RoleGate`; silent token refresh |
| 4:00 | A data-heavy page (admin audit logs or properties): throttle network to show skeleton, then data; DevTools Network showing cache reuse, URL params changing | TanStack Query staleTime, prefetch/hydration, URL state, optimistic update demo |
| 5:30 | Wizard with invalid input (Zod errors), then a backend error (bad data / offline) → toast + `error.tsx` | RHF + Zod mirrors backend rules, `applyServerErrors` |
| 6:30 | Pay an invoice with the Stripe test card → success page flipping to PAID; show cancel page | Redirect flow + webhook polling |
| 8:00 | DevTools device mode at 375/768/1280 | Mobile-first sidebar → sheet, DataTable → cards |
| 8:45 | `git log`, deployed URL, wrap-up | |

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Login returns 429 | Backend rate limiter and no `trust proxy` (pre-flight #2) |
| Invoice stays PENDING after paying | Stripe webhook missing/wrong secret (pre-flight #4) |
| Register works but no OTP arrives | SMTP not configured (pre-flight #6); use demo accounts |
| `/properties?sortBy=rentAmount` → 500 | Backend only supports `createdAt`/`title`; the UI already restricts this |
| Dates rejected with 400 "Invalid datetime" | Missing `Z`: always send `toISOString()` |
| Rents render as `"150"` strings or `NaN` | Prisma Decimal comes back as a string; use `Number()` / `MoneyText` |
| Image upload fails on Vercel with 413 | File > ~4.5 MB through the proxy; the uploader must compress first |
| Users get logged out randomly | Concurrent refresh with rotating token: check the single-flight `Map` in `refresh.ts` |
| Build error about `useSearchParams` | Missing `<Suspense>` boundary around the component |
