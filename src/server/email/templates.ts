export interface EmailContent {
  attachments?: { filename: string; content: Uint8Array; contentType: string }[];
  template: string;
  subject: string;
  text: string;
  html: string;
}

function escape(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );
}

/** One plain layout: greeting, paragraphs, an optional button and a sign-off. */
function compose(
  template: string,
  subject: string,
  name: string,
  paragraphs: string[],
  button?: { label: string; url: string },
): EmailContent {
  const lines = [`Hi ${name},`, ...paragraphs];
  const text = [
    ...lines,
    ...(button ? [`${button.label}: ${button.url}`] : []),
    "— Reallogixs Academy",
  ].join("\n\n");
  const body = lines.map((line) => `<p style="margin:0 0 16px">${escape(line)}</p>`).join("");
  const action = button
    ? `<p style="margin:24px 0"><a href="${escape(button.url)}" style="background:#0B1428;color:#ffffff;padding:14px 24px;border-radius:999px;text-decoration:none;display:inline-block">${escape(button.label)}</a></p><p style="margin:0 0 16px;font-size:13px;color:#4A5668;word-break:break-all">${escape(button.url)}</p>`
    : "";
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#0E1726;max-width:560px;margin:0 auto;padding:24px"><p style="font-weight:600;color:#1B6A85;margin:0 0 24px">Reallogixs Academy</p>${body}${action}<p style="margin:24px 0 0;color:#4A5668">— Reallogixs Academy</p></div>`;
  return { template, subject, text, html };
}

export function studentSignup(name: string, url: string): EmailContent {
  return compose(
    "student_signup",
    "Finish creating your account",
    name,
    [
      "Choose a password to finish creating your Reallogixs Academy account. The link works once, for 48 hours.",
      "If you didn't ask for this, ignore this email and nothing will happen.",
    ],
    { label: "Choose a password", url },
  );
}

export function alreadyRegistered(name: string, url: string): EmailContent {
  return compose(
    "already_registered",
    "You already have an account",
    name,
    [
      "Someone tried to sign up with this email, but you already have an account. If it was you, just log in. If not, you can ignore this.",
    ],
    { label: "Log in", url },
  );
}

export function teacherInvite(
  name: string,
  url: string,
  promoCode: string,
  rates: string,
  loginUrl: string,
): EmailContent {
  return compose(
    "teacher_invite",
    "Your Reallogixs Academy teacher account",
    name,
    [
      "Your teacher portal is ready. Choose a password to open it. The link works once, for 48 hours.",
      `Your promo code is ${promoCode}. ${rates}`,
      `After that, log in at ${loginUrl}.`,
    ],
    { label: "Choose a password", url },
  );
}

export function adminInvite(name: string, url: string, loginUrl: string): EmailContent {
  return compose(
    "admin_invite",
    "Your Reallogixs Academy admin account",
    name,
    [
      "Choose a password to open the admin panel. The link works once, for 48 hours.",
      `After that, log in at ${loginUrl}.`,
    ],
    { label: "Choose a password", url },
  );
}

export function passwordReset(name: string, url: string): EmailContent {
  return compose(
    "password_reset",
    "Reset your password",
    name,
    [
      "Use this link to choose a new password. It works once, for one hour.",
      "If you didn't ask for this, ignore this email and your password stays the same.",
    ],
    { label: "Choose a new password", url },
  );
}

export function passwordChanged(name: string, url: string): EmailContent {
  return compose(
    "password_changed",
    "Your password was changed",
    name,
    [
      "Your Reallogixs Academy password was just changed and other devices were signed out. If this wasn't you, reset it straight away.",
    ],
    { label: "Reset password", url },
  );
}

export function orderReceived(
  name: string,
  order: { number: string; course: string; amount: string; url: string },
): EmailContent {
  return compose(
    "order_received",
    `We received your payment for ${order.course}`,
    name,
    [
      `Order ${order.number} for ${order.course} (${order.amount}) is awaiting verification.`,
      "Track it any time with your order number and phone.",
    ],
    { label: "Track my enrolment", url: order.url },
  );
}

export function orderConfirmed(
  name: string,
  order: { course: string; when: string; whatsappUrl: string },
): EmailContent {
  return compose(
    "order_confirmed",
    `You're enrolled in ${order.course}`,
    name,
    [
      `Your payment is confirmed. Your class is on ${order.when}. Your personal Zoom link is in a separate email.`,
      "Join the Reallogixs WhatsApp community for announcements and resources.",
    ],
    { label: "Join the community", url: order.whatsappUrl },
  );
}

export function orderRejected(
  name: string,
  order: { number: string; reason: string; url: string },
): EmailContent {
  return compose(
    "order_rejected",
    `Action needed: order ${order.number}`,
    name,
    [
      `We couldn't verify your receipt: ${order.reason}`,
      "Upload a new receipt with your order number and phone.",
    ],
    { label: "Upload a new receipt", url: order.url },
  );
}

export function zoomInvite(
  name: string,
  invite: { course: string; when: string; email: string; url: string },
): EmailContent {
  return compose(
    "zoom_invite",
    `Your Zoom link for ${invite.course}`,
    name,
    [
      `You're registered for ${invite.course}, ${invite.when}.`,
      `Sign in to Zoom with ${invite.email} before joining. Other accounts are turned away, so please don't share this link.`,
      "To earn your certificate, join the class while it is running.",
    ],
    { label: "Open my class", url: invite.url },
  );
}

export function payoutSent(
  name: string,
  payout: { amount: string; referrals: number; reference: string },
): EmailContent {
  return compose("payout_sent", "Commission paid", name, [
    `We've paid ${payout.amount} for ${payout.referrals} referral(s). Reference: ${payout.reference}.`,
  ]);
}

export function certificateIssued(
  name: string,
  certificate: { course: string; code: string; url: string; verifyUrl: string },
): EmailContent {
  return compose(
    "certificate_issued",
    `Your certificate: ${certificate.course}`,
    name,
    [
      `Thanks for joining ${certificate.course}. Your e-certificate is ready to view, print or save.`,
      `Anyone can check it at ${certificate.verifyUrl} with the code ${certificate.code}.`,
    ],
    { label: "View my certificate", url: certificate.url },
  );
}

export function confirmNewEmail(name: string, url: string): EmailContent {
  return compose(
    "confirm_email",
    "Confirm your new email",
    name,
    [
      "Use this link to move your Reallogixs Academy login to this email. It works once, for 24 hours.",
      "If you didn't ask for this, ignore this email and nothing will change.",
    ],
    { label: "Confirm new email", url },
  );
}

export function emailChanging(name: string, done: boolean, url: string): EmailContent {
  return compose(
    done ? "email_changed" : "email_changing",
    done ? "Your login email was changed" : "Your login email is being changed",
    name,
    [
      done
        ? "Your Reallogixs Academy login was moved to another email and every device was signed out. If this wasn't you, contact the Reallogixs team straight away."
        : "Someone signed in to your account asked to move its login to another email. It changes once they confirm from that email. If this wasn't you, reset your password now: that also cancels the change.",
    ],
    done ? undefined : { label: "Reset password", url },
  );
}
