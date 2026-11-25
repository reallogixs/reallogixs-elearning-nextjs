# Database plan: Supabase + Prisma

Status: **phases 1 to 5 are built and tested locally.** All data is in the database; the browser demo store
is gone.

## Decisions (from the interview)

| Topic          | Decision                                                                        |
| -------------- | ------------------------------------------------------------------------------- |
| Projects       | Two Supabase projects: development and production                               |
| Login          | Our own, in Prisma: hashed passwords, sessions stored in the database           |
| Sessions       | 30 days; admins 12 hours. Changing a password signs out other devices           |
| Files          | Cloudinary. Receipts private with short-lived signed links; logos public        |
| Site content   | Tables for FAQs, testimonials, steps and numbers; one row per one-off block     |
| Emails         | Hostinger SMTP now. Teachers get a one-time "set your password" link            |
| Deleting       | Archive anything with history; really delete unused records                     |
| Starting data  | Development: demo data. Production: site text, categories, hidden pay methods   |
| Certificates   | No minimum stay                                                                 |
| Zoom           | Stays simulated; only `lib/zoom/client.ts` changes later                        |

## Structure (27 tables)

```
Accounts    users ─┬─ teacher_profiles      sessions, auth_tokens (hashes only), rate_limits
                   └─ orders
Catalogue   categories (any depth) ─ courses ─ instructors
Payments    payment_methods ─ payment_fields
            orders ─ receipts, order_events, commissions ─ payouts
Classes     courses ─ meetings ─ registrants ─ attendance      join_refusals
            orders ─ certificates
Content     content_blocks, faqs, testimonials, process_steps, site_stats
Records     email_messages (never the text), audit_entries
```

Rules the database itself enforces: totals must add up; percentages stay within 0–100; one live order
per email per class; one registration per email per class; a student is in a class once at a time; a
class can't be completed before it ended; one certificate per order; no category loops; nothing with
history can be deleted.

**Access:** only the server reaches the database. Every table has row-level security on with no
policies, and Supabase's public API roles have no grants. A migration that adds a table must also run
`ALTER TABLE … ENABLE ROW LEVEL SECURITY` on it.

## Folders

```
prisma/schema.prisma     the structure
prisma/migrations/       every change, in order; never edit one that has been applied
prisma/seed/             baseline (any database) and demo (development only)
src/server/db/           Prisma client
src/server/core/         reusable building blocks: action wrapper, sessions, passwords, rate limits
src/server/actions/      server actions by area (phases 2–5)
src/server/queries/      reads by area, each returning only what its caller may see (phases 2–5)
```

Every action is built with `publicAction` or `roleAction`, which check the role, validate with the same
Yup schema as the form, and return `{ ok, data }` or `{ ok, error }` without leaking database errors.

## Phases

1. **Foundation (done).** Schema, migrations, client, action core, seeds.
2. **Accounts and email (done).** Login, signup, set/reset password, SMTP, sessions, server-side portal
   protection, teacher accounts, first-admin command. Signup asks for the password only from the
   emailed link, so nobody can pre-register someone else's email with their own password.
3. **Public site (done).** Site content, categories, instructors and courses, both the public pages
   and their admin screens. Reads are cached and refreshed the moment an admin saves.
4. **Checkout and orders (done).** Receipts, orders, tracking, payment methods, promo codes,
   verification, commissions, payouts and class registration. Confirming a payment locks the course
   row so the last seat can't be sold twice.
5. **Classes (done).** Class status, attendance, the join door, certificates, verify, and an email log.
   The demo store and demo controls were removed here.
6. **Go live.** Check the last-seat lock on real Postgres, one real Cloudinary upload and one real email;
   load test; production deploy.

Each phase ends with the site working, and lint, typecheck, build and a browser check passing.

## Security changes the real version makes

- **Guest orders join an account only after the email is verified.** The demo also links by phone, so
  anyone could sign up with another person's number and see their orders and class link.
- **Passwords are never emailed or stored readable.**
- **Lookups are limited:** login, order tracking, promo codes and certificate checks.
- **Receipts are never public**, and students can only open their own.
- **Teachers are only sent** the student's name, course, status and commission.

## Classes and certificates

- `classes` (start, end, complete), `join` (the door) and `certificates` actions. Locks in
  `src/server/core/locks.ts` stop a class ending while someone is being let in.
- `refusal()` in `lib/domain/meeting.ts` is the only door policy; `issueCertificates()` in
  `src/server/core/certificates.ts` is the only place certificates are made.
- Attendance stays with the student when their Zoom email changes. Certificate emails attach
  a PDF (`src/server/files/certificatePdf.ts`, `pdf-lib`). Names in scripts its fonts lack, such as Urdu,
  get the link to the web certificate instead.

## Logins

| Who     | Page             |                                                   |
| ------- | ---------------- | ------------------------------------------------- |
| Student | `/login`         | The only public one, with `/signup`               |
| Teacher | `/teacher/login` | Not linked from the public site; in their invite  |
| Admin   | `/admin/login`   | Not linked from the public site; in their invite  |

Each page only accepts its own role, checked on the server. A wrong-role login gets the same answer as a
wrong password. `lib/account/loginPath.ts` holds the paths.

## Accounts

- **Passwords** are bcrypt, cost 12 (`src/server/core/password.ts`), up to 72 bytes. Older scrypt hashes still
  work and are replaced at the next login. Session and link secrets are random, so they use a fast SHA-256.
- **Admin email and password:** Admin → My account. A new email only takes over once the link sent to it is
  used; every device is then signed out and the old email is told.
- **First admin in production:** put the production `DATABASE_URL` and `SITE_URL` in `.env.prod` (git-ignored),
  run `pnpm db:admin:prod "Full Name" email@example.com "0300 1234567"`, then delete the file. Without SMTP
  settings in it, the one-time link is saved in `.mail/`.
- First admin: `pnpm db:admin "Full Name" email@example.com "0300 1234567"`. It emails a one-time link.
- Without SMTP settings, development emails are saved in `.mail/` (git-ignored). In production, missing
  SMTP or `SITE_URL` is an error.

## Orders and files

- Actions: `checkout` (public), `orders`, `payouts`, `paymentMethods`, `registrants` (admin). Prices,
  discounts and commissions are always worked out on the server.
- `src/server/queries/orderShape.ts` decides what each role receives. Teachers get the student's name,
  course, status and commission; students never get receipts or commissions.
- Layouts and pages load the data; screens read it with `usePortalData()`. Nothing is kept in the browser.
- Receipts are checked by their first bytes, stored privately, and only served by `/api/receipts/[id]`
  to an admin or the order's own student. Nobody gets a Cloudinary link.
- Cloudinary folders: `academy/prod/…` on the live site, `academy/dev/…` everywhere else, including Vercel
  previews. Files uploaded earlier stay where they are and keep working.
- Without Cloudinary settings, development files go to `.uploads/` (git-ignored). In production that is
  an error.
- The whole admin order list loads with the portal. Add paging before there are thousands of orders.

## Content and courses

- Pages read through `src/server/queries/{content,catalogue}.ts`. Server layouts pass the data down;
  public components read it with `useContent()` and `useCatalogue()`.
- Writes are in `src/server/actions/{content,catalogue}.ts`. Each one is admin only, validated with the
  form's Yup schema, recorded in the audit log, and clears the matching cache tag.
- Check ids with `uuidSchema`: Yup's own `uuid()` rejects the version 7 ids the database creates.

## Setting up Supabase

1. Create the two projects (region: Mumbai or Singapore are closest to Pakistan).
2. Copy `.env.example` to `.env.local` and paste the **development** strings from
   Supabase → Connect → ORMs. Never commit this file.
3. `pnpm db:deploy` creates the tables. `pnpm db:seed:demo` adds the demo data.
4. Production strings go in Vercel's environment variables, not on this computer. Run
   `pnpm db:deploy` and `pnpm db:seed` there (no demo data).

To change the structure later: edit `schema.prisma`, run `pnpm db:migrate --name what_changed` against
development, check the SQL, commit it, then deploy.
