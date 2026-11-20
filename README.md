# Reallogixs Academy

Course enrolment platform for Reallogixs. Students browse live courses (online or on campus),
optionally enter a teacher's promo code, pay by JazzCash / Easypaisa / SadaPay / NayaPay / bank
transfer, upload the receipt, and receive the Reallogixs WhatsApp community link once an admin
confirms the payment.

> **Status: demo on mock data.** Everything runs in the browser (`localStorage`). No real
> payments, emails or uploads leave the machine. Use the **Demo** button (bottom left) to switch
> roles or reset the data.

```bash
pnpm install
pnpm dev   # http://localhost:3100
```

## Demo accounts

| Role    | Email                 | Password     |
| ------- | --------------------- | ------------ |
| Admin   | admin@reallogixs.com  | admin123     |
| Teacher | sana@example.com      | teacher123   |
| Student | ali@example.com       | student123   |

Guest tracking demo: order `RLX-9GUEST` with phone `0344 1112233` (a rejected receipt to re-upload).

## The flow

1. **Browse** `/courses`: category tree (any depth), mode filter, search.
2. **Checkout** `/checkout/[slug]` in three steps:
   1. Name, email, WhatsApp number, plus an optional teacher promo code (skippable).
   2. Pick a payment method and see the admin-configured account details (with copy buttons).
   3. Transaction reference and receipt upload (JPG/PNG/WebP/PDF, ≤ 4 MB).
3. **Order number** (e.g. `RLX-4F7K2`) is shown. Guests track it at `/track` with order number + phone.
   Signing up is optional; signing up later pulls in guest orders with the same email or phone.
4. **Admin verifies** at `/admin/payments`: receipt next to the expected amount, then **Confirm**
   (counts the seat, earns the teacher's commission, unlocks the WhatsApp link) or **Reject** with a
   reason (the student re-uploads from `/track` or their portal).
5. **Teacher** sees which students used their code, for which course, and their commission.

## Portals

- **Student** `/student`: enrolment history and status, re-upload, WhatsApp link, certificates, settings and password.
- **Teacher** `/teacher`: promo code, referred students (name + course only), earnings, payouts, settings and password.
  Teachers can't sign up. Only an admin creates them, and a welcome email with a temporary password and
  promo code is sent (shown in the admin **Email outbox** while mocked).
- **Admin** `/admin`: dashboard stats, payment verification, all orders, courses (batch dates, seats,
  online/physical, instructor, open/close enrolment), nested categories, instructors, teachers
  (commission % and student discount % per teacher; new rates apply to future sales only), payouts
  ledger, students, certificates, payment methods (logo, any number of detail rows, order, visibility),
  site content (hero, stats, steps, testimonials, FAQs, WhatsApp link, contact, checkout copy, footer),
  and the email outbox.

## Structure

```
src/
  app/(site)/        public pages (home, courses, checkout, track, login, signup)
  app/admin|teacher|student/   portals (PortalShell + RequireRole)
  components/ui/     design-system primitives (Button, Modal, DataTable, Field…)
  components/form/   Formik-bound fields (TextField, SelectField, FileField…)
  components/<feature>/  courses, checkout, orders, payments, admin, teacher, student…
  lib/api/           mock API: the only code that writes data (async, returns Result)
  lib/store/         localStorage store, hooks, pure selectors
  lib/validation/    Yup schemas (shared by forms and the API)
  lib/domain/        pure business rules: pricing, commission, seats, category tree, formatting
  mocks/             seed data and default site copy (PLACEHOLDER)
  types/domain.ts    data model (mirrors the future database tables)
```

## Business rules

- **Price:** course price minus the teacher's discount % (if a code is applied).
- **Commission:** teacher's % of what the student paid, snapshotted on the order. It becomes due when the
  order is confirmed. **Payouts** bundle all due commission for a teacher with a transfer reference.
- **Seats:** only confirmed orders take a seat. Enrolment closes when the batch is full, when the admin
  closes it, or once the start date has passed.
- **Cancelling** a confirmed order frees the seat and removes the commission (blocked if already paid out).

## Moving to a real backend

| Mock                                    | Replace with                                            |
| --------------------------------------- | ------------------------------------------------------- |
| `lib/store/db.ts` (localStorage)         | Supabase tables matching `types/domain.ts`              |
| `lib/api/*` functions                    | Server actions / Supabase queries (same signatures)     |
| `authApi` + plain-text demo passwords    | Supabase Auth; `RequireRole` → `proxy.ts` + RLS policies |
| `lib/files.ts` data URLs (receipts, logos) | Cloudinary signed uploads (store the URL)             |
| `lib/api/mailer.ts` outbox               | Nodemailer (Hostinger SMTP) + React Email templates     |
| `DemoSwitcher` in the root layout        | Remove                                                  |

Security notes for that step: guest order lookup must check order number + phone **on the server**; teachers
must only be able to read name + course of their own referrals (RLS); receipts should be private uploads.

## Assumptions to confirm

- Commission is calculated on the discounted amount the student actually paid.
- Seats are counted on confirmation, not on receipt upload, so pending orders don't hold a seat.
- Wallet logos are not bundled (trademark use); the admin uploads them, and initials show until then.
- Contact phone numbers and stats are placeholders.
