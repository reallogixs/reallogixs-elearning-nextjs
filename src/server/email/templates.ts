import { compose, type EmailContent } from "./layout";

export type { EmailContent } from "./layout";

const IGNORE = "If you didn't ask for this, you can ignore this email.";

export function studentSignup(name: string, url: string): EmailContent {
  return compose({
    template: "student_signup",
    subject: "Finish creating your account",
    heading: "One step to go",
    name,
    paragraphs: ["Choose a password to finish creating your Reallogixs Academy account."],
    button: { label: "Choose a password", url },
    note: `The link works once, for 48 hours. ${IGNORE}`,
  });
}

export function alreadyRegistered(name: string, url: string): EmailContent {
  return compose({
    template: "already_registered",
    subject: "You already have an account",
    name,
    paragraphs: [
      "Someone tried to sign up with this email, but you already have an account. If it was you, just log in. If not, you can ignore this.",
    ],
    button: { label: "Log in", url },
  });
}

export function adminInvite(name: string, url: string, loginUrl: string): EmailContent {
  return compose({
    template: "admin_invite",
    subject: "Your Reallogixs Academy admin account",
    heading: "Your admin account is ready",
    name,
    paragraphs: [
      "Choose a password to open the admin panel.",
      `After that, log in at ${loginUrl}.`,
    ],
    button: { label: "Choose a password", url },
    note: "The link works once, for 48 hours.",
  });
}

export function passwordReset(name: string, url: string): EmailContent {
  return compose({
    template: "password_reset",
    subject: "Reset your password",
    name,
    paragraphs: ["Use this link to choose a new password."],
    button: { label: "Choose a new password", url },
    note: `The link works once, for one hour. ${IGNORE} Your password stays the same.`,
  });
}

export function passwordChanged(name: string, url: string): EmailContent {
  return compose({
    template: "password_changed",
    subject: "Your password was changed",
    name,
    paragraphs: [
      "Your Reallogixs Academy password was just changed and other devices were signed out.",
      "If this wasn't you, reset it straight away.",
    ],
    button: { label: "Reset password", url },
  });
}

export function orderReceived(
  name: string,
  order: { number: string; course: string; amount: string; url: string },
): EmailContent {
  return compose({
    template: "order_received",
    subject: `We received your payment for ${order.course}`,
    heading: "Payment received",
    name,
    paragraphs: [
      "Thanks! We're checking your receipt now, usually within a few working hours. Keep your order number: you'll need it with your phone to track it.",
    ],
    details: [
      ["Order", order.number],
      ["Course", order.course],
      ["Amount", order.amount],
      ["Status", "Awaiting verification"],
    ],
    button: { label: "Track my enrolment", url: order.url },
  });
}

export function orderConfirmed(
  name: string,
  order: { course: string; when: string; whatsappUrl: string },
): EmailContent {
  return compose({
    template: "order_confirmed",
    subject: `You're enrolled in ${order.course}`,
    heading: "You're in! 🎉",
    name,
    paragraphs: [
      "Your payment is confirmed. Your personal Zoom link is in a separate email.",
      "Join the Reallogixs WhatsApp community for announcements and resources.",
    ],
    details: [
      ["Course", order.course],
      ["Class", order.when],
    ],
    button: { label: "Join the community", url: order.whatsappUrl },
  });
}

export function orderRejected(
  name: string,
  order: { number: string; reason: string; url: string },
): EmailContent {
  return compose({
    template: "order_rejected",
    subject: `Action needed: order ${order.number}`,
    heading: "We couldn't verify your receipt",
    name,
    paragraphs: [order.reason, "Upload a new receipt with your order number and phone."],
    details: [["Order", order.number]],
    button: { label: "Upload a new receipt", url: order.url },
  });
}

export function zoomInvite(
  name: string,
  invite: { course: string; when: string; email: string; url: string },
): EmailContent {
  return compose({
    template: "zoom_invite",
    subject: `Your Zoom link for ${invite.course}`,
    heading: "Your class link",
    name,
    paragraphs: [
      `Sign in to Zoom with ${invite.email} before joining. Other accounts are turned away, so please don't share this link.`,
      "To earn your certificate, join the class while it is running.",
    ],
    details: [
      ["Course", invite.course],
      ["When", invite.when],
      ["Zoom account", invite.email],
    ],
    button: { label: "Open my class", url: invite.url },
  });
}

export function payoutSent(
  name: string,
  payout: { amount: string; referrals: number; reference: string },
): EmailContent {
  return compose({
    template: "payout_sent",
    subject: "Commission paid",
    name,
    paragraphs: ["We've paid your commission. Thank you for sending students our way."],
    details: [
      ["Amount", payout.amount],
      ["Referrals", String(payout.referrals)],
      ["Reference", payout.reference],
    ],
  });
}

export function certificateIssued(
  name: string,
  certificate: { course: string; code: string; url: string; verifyUrl: string },
): EmailContent {
  return compose({
    template: "certificate_issued",
    subject: `Your certificate: ${certificate.course}`,
    heading: "Your certificate is ready 🎓",
    name,
    paragraphs: [
      `Thanks for joining ${certificate.course}. Your e-certificate is ready to view, print or download as a PDF any time.`,
    ],
    details: [
      ["Course", certificate.course],
      ["Verification code", certificate.code],
    ],
    button: { label: "View my certificate", url: certificate.url },
    note: `Anyone can check it at ${certificate.verifyUrl} with the code above.`,
  });
}

export function confirmNewEmail(name: string, url: string): EmailContent {
  return compose({
    template: "confirm_email",
    subject: "Confirm your new email",
    name,
    paragraphs: ["Use this link to move your Reallogixs Academy login to this email."],
    button: { label: "Confirm new email", url },
    note: `The link works once, for 24 hours. ${IGNORE} Nothing will change.`,
  });
}

export function emailChanging(name: string, done: boolean, url: string): EmailContent {
  return compose({
    template: done ? "email_changed" : "email_changing",
    subject: done ? "Your login email was changed" : "Your login email is being changed",
    name,
    paragraphs: [
      done
        ? "Your Reallogixs Academy login was moved to another email and every device was signed out. If this wasn't you, contact the Reallogixs team straight away."
        : "Someone signed in to your account asked to move its login to another email. It changes once they confirm from that email. If this wasn't you, reset your password now: that also cancels the change.",
    ],
    ...(done ? {} : { button: { label: "Reset password", url } }),
  });
}

/** To the Reallogixs inbox when a receipt arrives, so it is checked quickly. */
export function paymentAlert(order: {
  number: string;
  student: string;
  course: string;
  amount: string;
  method: string;
  reference: string;
  promo: string;
  resent: boolean;
  url: string;
}): EmailContent {
  return compose({
    template: "payment_alert",
    subject: `${order.resent ? "New receipt" : "New payment"} to verify: ${order.number} · ${order.amount}`,
    heading: order.resent ? "A new receipt needs checking" : "A payment needs checking",
    preview: `${order.student} paid ${order.amount} for ${order.course}.`,
    paragraphs: [
      order.resent
        ? `${order.student} uploaded a new receipt after the last one was rejected.`
        : `${order.student} paid for ${order.course}. Confirm it to send their class link.`,
    ],
    details: [
      ["Order", order.number],
      ["Course", order.course],
      ["Amount due", order.amount],
      ["Paid with", order.method],
      ["Reference", order.reference],
      ["Promo code", order.promo],
    ],
    button: { label: "Review the receipt", url: order.url },
  });
}
