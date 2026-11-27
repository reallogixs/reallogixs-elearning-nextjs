import { LOGO_CID, LOGO_HEIGHT, LOGO_WIDTH } from "./logo";

export interface EmailContent {
  attachments?: { filename: string; content: Uint8Array; contentType: string }[];
  template: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailParts {
  template: string;
  subject: string;
  /** Who it's for; omit for staff alerts. */
  name?: string;
  /** Big line at the top. Defaults to the subject. */
  heading?: string;
  /** Shown in the inbox list before the email is opened. */
  preview?: string;
  paragraphs: string[];
  /** A small summary table, e.g. order number, course and amount. */
  details?: [string, string][];
  button?: { label: string; url: string };
  /** Small print under the button. */
  note?: string;
}

/** Brand tokens (tokens.css). Email apps can't read CSS variables. */
const C = {
  canvas: "#EEF2F6",
  card: "#FFFFFF",
  ink: "#0E1726",
  soft: "#4A5668",
  line: "#DCE3EA",
  mist: "#F3F6F9",
  navy: "#0B1428",
  teal: "#1B6A85",
  sky: "#3D93C2",
  navyMid: "#2A4373",
};
const FONT = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function escape(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );
}

function detailsTable(details: [string, string][]): string {
  const rows = details
    .map(
      ([term, value], index) =>
        `<tr><td style="padding:12px 16px;font-size:14px;color:${C.soft};${index ? `border-top:1px solid ${C.line};` : ""}">${escape(term)}</td><td align="right" style="padding:12px 16px;font-size:14px;font-weight:600;color:${C.ink};${index ? `border-top:1px solid ${C.line};` : ""}">${escape(value)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-collapse:separate;background:${C.mist};border-radius:12px">${rows}</table>`;
}

function buttonBlock(button: { label: string; url: string }, note?: string): string {
  const url = escape(button.url);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td style="border-radius:999px;background:${C.navy}"><a href="${url}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px">${escape(button.label)} &rarr;</a></td></tr></table><p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:${C.soft}">${note ? `${escape(note)}<br>` : ""}Button not working? Copy this link:<br><a href="${url}" style="color:${C.teal};word-break:break-all">${url}</a></p>`;
}

/** One branded layout for every email: logo, gradient rule, card, and a short footer. */
export function compose(parts: EmailParts): EmailContent {
  const { template, subject, name, paragraphs, details, button, note } = parts;
  const heading = parts.heading ?? subject;
  const greeting = name ? [`Hi ${name},`] : [];

  const text = [
    heading,
    ...greeting,
    ...paragraphs,
    ...(details ?? []).map(([term, value]) => `${term}: ${value}`),
    ...(button ? [`${button.label}: ${button.url}`] : []),
    ...(note ? [note] : []),
    "— Reallogixs Academy",
  ].join("\n\n");

  const body = [...greeting, ...paragraphs]
    .map(
      (line) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${C.ink}">${escape(line)}</p>`,
    )
    .join("");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${escape(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.canvas};font-family:${FONT}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(parts.preview ?? paragraphs[0] ?? "")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.canvas}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="background:${C.card};border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(11,20,40,.06)">
<div style="height:4px;background:${C.teal};background-image:linear-gradient(90deg,${C.teal},${C.sky},${C.navyMid});font-size:0;line-height:0">&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="padding:24px 32px 0"><img src="cid:${LOGO_CID}" width="${Math.round(LOGO_WIDTH / 3.6)}" height="${Math.round(LOGO_HEIGHT / 3.6)}" alt="Reallogixs" style="display:block;border:0"></td>
<td align="right" style="padding:24px 32px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.soft};font-family:'Courier New',monospace">Academy</td>
</tr></table>
<div style="padding:28px 32px 28px">
<h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;font-weight:700;color:${C.navy}">${escape(heading)}</h1>
${body}${details?.length ? detailsTable(details) : ""}${button ? buttonBlock(button, note) : note ? `<p style="margin:0;font-size:13px;color:${C.soft}">${escape(note)}</p>` : ""}
</div></td></tr>
<tr><td align="center" style="padding:24px 16px 0;font-size:12px;line-height:1.6;color:${C.soft}">
<strong style="color:${C.ink}">Reallogixs Academy</strong> · Live, mentor-led masterclasses<br>
A Reallogixs initiative · <a href="https://reallogixs.com.au" style="color:${C.teal};text-decoration:none">reallogixs.com.au</a>
</td></tr>
</table></td></tr></table></body></html>`;
  return { template, subject, text, html };
}
