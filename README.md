# Reallogixs Academy

Course enrolment platform for Reallogixs. Students browse live courses (online or on campus),
optionally enter a teacher's promo code, pay by JazzCash / Easypaisa / SadaPay / NayaPay / bank
transfer, upload the receipt, and receive the Reallogixs WhatsApp community link once an admin
confirms the payment.

> **Status: everything runs on the database.** Zoom is still simulated; see below.

```bash
pnpm install
pnpm dev   # http://localhost:3100
```

## Accounts

Accounts live in the database (see `docs/DATABASE_PLAN.md`). With `pnpm db:seed:demo`, development has
`admin@reallogixs.com` / `admin123`, `sana@example.com` / `teacher123` and `ali@example.com` / `student123`.
Students use `/login`, teachers `/teacher/login`, admins `/admin/login`.
Never run the demo seed on production.

Guest tracking demo: order `RLX-9GUEST` with phone `0344 1112233`.

## The flow

1. **Browse** `/courses`: category tree (any depth), mode filter, search.
2. **Checkout** `/checkout/[slug]` in three steps:
   1. Name, email, WhatsApp number, plus an optional teacher promo code (skippable).
   2. Pick a payment method and see the admin-configured account details (with copy buttons).
   3. Transaction reference and receipt upload (JPG/PNG/WebP/PDF, ≤ 4 MB).
3. **Order number** (e.g. `RLX-4F7K2P`) is shown. Guests track it at `/track` with order number + phone.
   Signing up is optional; signing up later pulls in guest orders with the same email or phone.
4. **Admin verifies** at `/admin/payments`: receipt next to the expected amount, then **Confirm**
   (counts the seat, earns the teacher's commission, unlocks the WhatsApp link) or **Reject** with a
   reason (the student re-uploads from `/track` or their portal).
5. **Teacher** sees which students used their code, for which course, and their commission.

## Portals

- **Student** `/student`: enrolment history and status, re-upload, WhatsApp link, certificates, settings and password.
- **Teacher** `/teacher`: promo code, referred students (name + course only), earnings, payouts, settings and password.
  Teachers can't sign up. Only an admin creates them; they get their promo code and a one-time link to
  choose a password.
- **Admin** `/admin`: dashboard stats, payment verification, all orders, courses (batch dates, seats,
  online/physical, instructor, open/close enrolment), nested categories, instructors, teachers
  (commission % and student discount % per teacher; new rates apply to future sales only), payouts
  ledger, students, certificates, payment methods (logo, any number of detail rows, order, visibility),
  site content (hero, stats, steps, testimonials, FAQs, WhatsApp link, contact, checkout copy, footer),
  and the email log.

## Structure

```
src/
  app/(site)/        public pages (home, courses, checkout, track, login, signup)
  app/admin|teacher|student/   portals (PortalShell + `requirePortal`)
  components/ui/     design-system primitives (Button, Modal, DataTable, Field…)
  components/form/   Formik-bound fields (TextField, SelectField, FileField…)
  components/<feature>/  courses, checkout, orders, payments, admin, teacher, student…
  server/            database access: actions (writes), queries (reads), core building blocks
  lib/portal/        pure selectors over the data the server loaded
  lib/validation/    Yup schemas (shared by forms and the API)
  lib/domain/        pure business rules: pricing, commission, seats, category tree, formatting
  mocks/             development seed data and default site copy (PLACEHOLDER)
  types/domain.ts    data model (mirrors the future database tables)
```

## Business rules

- **Price:** course price minus the teacher's discount % (if a code is applied).
- **Commission:** teacher's % of what the student paid, snapshotted on the order. It becomes due when the
  order is confirmed. **Payouts** bundle all due commission for a teacher with a transfer reference.
- **Seats:** only confirmed orders take a seat. Enrolment closes when the batch is full, when the admin
  closes it, or once the start date has passed.
- **Cancelling** a confirmed order frees the seat and removes the commission (blocked if already paid out).

## Zoom classes and certificates (simulated)

1. Adding a course creates its Zoom meeting.
2. Confirming a payment registers the student's email on it and emails a personal `/join/…` link.
   If registration fails, the payment isn't confirmed. Cancelling an order revokes the link.
3. Entry needs: a personal link, a confirmed order, a Zoom sign-in with the registered email, and the
   host having started the class. Wrong accounts are refused and listed on the class page.
4. Attendance counts any time in the meeting after the host started it. There is no minimum stay.
5. **Mark completed** (Admin → Classes) creates and emails certificates to paid students who attended,
   and shows them in the student portal. Absent students get none.
6. Anyone can check a code at `/verify`. Revoked certificates are reported as no longer valid.

**To connect real Zoom:** a paid plan, a Server-to-Server OAuth app and its webhooks, implemented on
the server in `lib/zoom/client.ts` (the API calls are listed there).

## Assumptions to confirm

- Commission is calculated on the discounted amount the student actually paid.
- Seats are counted on confirmation, not on receipt upload, so pending orders don't hold a seat.
- Wallet logos are not bundled (trademark use); the admin uploads them, and initials show until then.
- Contact phone numbers and stats are placeholders.
