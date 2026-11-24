import type { PKR } from "@/types/domain";

const LOCALE = "en-PK";
/** Classes run on Pakistan time, whatever zone the viewer is in (no daylight saving). */
const timeZone = "Asia/Karachi";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Rs 25,000 */
export function formatPKR(amount: PKR): string {
  return currency.format(amount).replace("PKR", "Rs").replace(/\s+/, " ");
}

const compact = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });

/** Rs 108.9K, for axes and tight tiles. */
export function formatCompactPKR(amount: PKR): string {
  return `Rs ${compact.format(amount)}`;
}

const shortDate = new Intl.DateTimeFormat(LOCALE, {
  timeZone,
  day: "numeric",
  month: "short",
});

/** 12 Nov */
export function formatShortDate(iso: string): string {
  return shortDate.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

const timeFmt = new Intl.DateTimeFormat(LOCALE, { timeZone, hour: "numeric", minute: "2-digit" });

/** 8:00 pm – 10:00 pm PKT */
export function formatClassTime(startsAt: string, durationMinutes: number): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return `${timeFmt.format(start)} – ${timeFmt.format(end)} PKT`;
}

/** 1 h 30 min */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return [hours ? `${hours} h` : "", rest ? `${rest} min` : ""].filter(Boolean).join(" ");
}

/** ISO → "2026-12-12T20:00" in Pakistan time, for <input type="datetime-local">. */
export function toPktInput(iso: string): string {
  return new Date(new Date(iso).getTime() + 5 * 3_600_000).toISOString().slice(0, 16);
}

/** The reverse: a Pakistan-time input value → ISO. */
export function fromPktInput(value: string): string {
  return new Date(`${value}:00+05:00`).toISOString();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Pakistani mobile numbers compared without spaces, dashes or the +92/0 prefix. */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}
