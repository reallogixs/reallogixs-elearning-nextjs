/** Base of emailed links. Never taken from the request, so it can't be pointed elsewhere. */
export function siteUrl(path: string): string {
  const base = process.env.SITE_URL;
  if (base) return new URL(path, base).toString();
  if (process.env.NODE_ENV === "production") throw new Error("SITE_URL is not set.");
  return new URL(path, "http://localhost:3100").toString();
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

/** Null when SMTP isn't set up. */
export function mailConfig(): MailConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT ?? 465);
  return {
    host: SMTP_HOST ?? "smtp.hostinger.com",
    port,
    // SSL from the first byte on 465; on other ports STARTTLS is required instead.
    secure: port === 465,
    user: SMTP_USER,
    pass: SMTP_PASS,
    // Hostinger only relays mail sent from the signed-in mailbox.
    from: MAIL_FROM ?? `Reallogixs Academy <${SMTP_USER}>`,
  };
}

/**
 * Keeps test files apart from real ones. Vercel's preview deployments also run in production
 * mode, so on Vercel its own setting decides.
 */
export function fileEnvironment(): "dev" | "prod" {
  const { VERCEL_ENV, NODE_ENV } = process.env;
  return (VERCEL_ENV ?? NODE_ENV) === "production" ? "prod" : "dev";
}
