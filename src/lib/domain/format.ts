import type { PKR } from "@/types/domain";

const LOCALE = "en-PK";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
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

const shortDate = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short" });

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
