# CLAUDE.md — Rules for Reallogixs Academy (e-learning)

Reallogixs Academy is the learning initiative of Reallogixs: live courses (online or on campus),
paid by local transfer with a receipt upload, verified by an admin. It must look and feel like
the main site (`../reallogixs-web-nextjs`): same tokens, fonts, logo, circuit-line motif.

Read `README.md` first (flows, structure, demo accounts, backend migration map).

## 1. Decisions that differ from the main site
- **Currency PKR, locale `en-PK`.** Payment methods are Pakistani wallets/banks. (The main site uses AUD.)
- **Forms: Formik + Yup only.** Every rule lives in a Yup schema in `src/lib/validation/`.
  No hand-written validation (`if (!value) setError…`) in components, and no react-hook-form or zod.
  Server actions re-run the same schema.
- **All data is in Supabase through Prisma** (`docs/DATABASE_PLAN.md`). Prisma is pinned to 7.10.1.
- **Database rules.** Structure changes only through migrations; never edit an applied one or use
  `db push`. New tables must enable row-level security. Server actions use `publicAction` /
  `roleAction` from `src/server/core/action.ts`; never log personal data or return database errors.
- **Courses are single online masterclasses** (`startsAt` + `durationMinutes`, Pakistan time). Every
  course has one Zoom meeting, created with it. `lib/domain/meeting.ts` is the only door and
  attendance policy; `lib/zoom/client.ts` is the only file that talks to Zoom (simulated).
  Certificates are created only by `completeClass()`, never by hand.
- **Three logins** (`lib/account/loginPath.ts`): students at `/login`, teachers at `/teacher/login`, admins at
  `/admin/login`. Each accepts only its own role. Never link the staff ones from the public site.
- **Accounts are real** (`src/server/actions/account.ts`). Portal pages and layouts call
  `requirePortal(role)`; the proxy is only a first check. Forms with passwords or personal data use
  `method="post"`, so a submit before JavaScript loads can't put them in the address bar.
- **Lighter motion.** GSAP `Reveal` (fade-up on scroll) for content below the fold. Above the fold
  (hero, page intros) use the CSS `rl-stagger` / `animate-fade-up` entrance so nothing is hidden
  waiting for JS. The home page borrows the main site's signatures: dark `bg-hero-night` hero with the
  CSS `globe-horizon` and a transparent header (`data-header-tone="dark"`), the scroll-linked outline
  `ScrollMarquee`, `Counter` stats and `Grain` on gradient bands. No Lenis, 3D, cursor or parallax here.
- **Dashboard look.** Portals use **Plus Jakarta Sans** (scoped by `.portal-theme`; the public site
  keeps Sora/Inter to match reallogixs.com.au), the `bg-canvas` background, `DashCard` panels,
  `StatCard` KPIs and the fixed `text-dash-*` sizes — not the fluid marketing scale.
- **Charts** (`src/components/charts/`) follow the dataviz rules: series colour `--rl-chart-1`
  (logo sky, validated), single series = no legend, crosshair/hover + arrow-key readout, a
  "View as table" for every chart, and status colours only with an icon and label.
- **Mobile patterns.** Every menu and filter panel on small screens is a side `<Drawer>` (native
  dialog: focus trap, Esc, focus returns). Filters show a `FilterButton` (with count) plus removable
  `FilterChip`s. `DataTable` renders cards on phones; keep laptop tables from scrolling by moving
  secondary columns to `hideBelow: "xl"`/`"2xl"`. A page's main action on phones goes in
  `MobileActionBar`. Control heights: 44px small, 48px default, 56px large — never under 44px.
- **Section rhythm.** Every public band uses `<Section>` + `<SectionHeading>` (`py-section`,
  `gap-section-gap`, tones `white | mist | dark | mesh`). Alternate tones; don't hand-roll padding.

## 2. Stack
Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS v4 (tokens copied from the
main site) · GSAP + `@gsap/react` · Formik + Yup · lucide-react ·
pdf-lib (certificates) · bcrypt · pnpm.
Ask before adding any other dependency.

## 3. Code conventions
- No `any`; explicit return types on exported functions. One component per file, < ~200 lines.
- `"use client"` only where needed. Pages in `src/app` stay thin and render a component.
- Colours, sizes and eases come from tokens/Tailwind theme only. Use `cn()` for conditional classes.
- **Reads:** server queries (`src/server/queries`) load data for a viewer; screens read it with
  `usePortalData()` + pure selectors (`src/lib/portal/selectors.ts`). **Writes** are server actions only.
- **Loading:** the top `LoadingBar` follows link clicks by itself; call `startLoading(PAGE)` before a
  `router.push`. `useAction` holds it until fresh data arrives. Portal layouts don't await their data: they
  pass the promise to `PortalDataProvider`, and `PortalLoading` shows meanwhile. Links to files need
  `data-file` and `prefetch={false}`.
- Forms are built from `src/components/form/*` (`TextField`, `SelectField`, `SwitchField`,
  `FileField`, `SubmitButton`, `FormStatus`). API errors go in Formik `status` or `setFieldError`.
- **All public copy is admin-managed** (`SiteContent` in `types/domain.ts`, edited in Admin → Site
  content). Never hard-code marketing copy in a component: add a field, a default in
  `mocks/content.ts`, a Yup schema in `validation/content.ts` and an editor field. Only interface
  text (form labels, button states, errors) lives in components. New fields fall back to the default
  until saved.
- **Yup + Formik:** optional text fields use `.default("")`, never `.defined()`. Formik sends empty
  inputs as `undefined`, so `.defined()` fails on a blank optional field.
- Site content, categories, instructors and courses come from the database: write through
  `src/server/actions/`, read through `src/server/queries/`. Public components use `useContent()` and
  `useCatalogue()`, never the demo store. Orders, payouts and payment methods are in the database too;
  what each role may see is decided in `server/queries/orderShape.ts`. Never put order data in
  `localStorage`, and never link to a receipt except through `/api/receipts/[id]`. Check ids with `uuidSchema`, not Yup's `uuid()`.
- Placeholder data is in `src/mocks/` and marked `PLACEHOLDER` / `isPlaceholder: true`.
- No `console.log`, no dead code, no commented-out blocks.

## 4. Accessibility and performance
WCAG 2.2 AA: one `<h1>` per page, labelled fields with errors on `aria-describedby`, visible focus
ring, 44×44 px targets, native `<dialog>` for modals, reduced motion respected. Content is visible
without JS (GSAP sets the hidden state, never CSS). No horizontal scroll from 360 to 1920 px.

## 5. Brand
Name **Reallogixs** (capital R only). Fonts Sora / Inter / JetBrains Mono. Teal `#1B6A85`,
sky `#3D93C2`, navy `#2A4373`, dark `#0B1428`. Voice: confident, friendly, plain words.

## 6. Commands
```bash
pnpm dev        # http://localhost:3100
pnpm lint
pnpm typecheck
pnpm build
```
Verify each change with lint, typecheck and build, and click through the flow in the browser.
