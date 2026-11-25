import { createPasswordLink } from "../src/server/core/accountTokens";
import { siteUrl } from "../src/server/core/env";
import { db } from "../src/server/db";
import { sendMail } from "../src/server/email/send";
import { adminInvite } from "../src/server/email/templates";
import { emailSchema, nameSchema, phoneSchema } from "../src/lib/validation/shared";

/** pnpm db:admin "Full Name" email@example.com "0300 1234567" */
async function main(): Promise<void> {
  const [name, rawEmail, phone] = process.argv.slice(2);
  const person = {
    name: await nameSchema.validate(name),
    email: (await emailSchema.validate(rawEmail)).toLowerCase(),
    phone: await phoneSchema.validate(phone),
  };
  const client = db();
  const existing = await client.user.findUnique({ where: { email: person.email } });
  if (existing && existing.role !== "admin")
    throw new Error("That email already belongs to a teacher or student.");
  const user = existing ?? (await client.user.create({ data: { role: "admin", ...person } }));
  const url = await createPasswordLink(client, user.id, "set_password");
  const sent = await sendMail(
    user.email,
    adminInvite(user.name, url, siteUrl("/admin/login")),
    user.id,
  );
  console.warn(
    sent
      ? "Admin ready. The password link was emailed (or saved in .mail)."
      : `Admin ready, but the email failed. One-time link: ${url}`,
  );
  await client.$disconnect();
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
