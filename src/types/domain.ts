/**
 * Domain model for the Reallogixs Academy. These shapes mirror the future Supabase
 * tables one-to-one, so swapping the mock store for a real backend keeps every
 * component unchanged.
 */

export type ID = string;
/** ISO 8601 timestamp or date string. */
export type ISODate = string;
/** Whole Pakistani rupees. */
export type PKR = number;

export type Role = "admin" | "teacher" | "student";

export interface Category {
  id: ID;
  name: string;
  slug: string;
  /** null for a top-level category. Categories nest to any depth. */
  parentId: ID | null;
  order: number;
  description?: string;
}

export interface Instructor {
  id: ID;
  name: string;
  title: string;
  bio: string;
}

export type CourseMode = "physical" | "online";
export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus = "draft" | "published";

export interface Course {
  id: ID;
  slug: string;
  title: string;
  summary: string;
  description: string;
  categoryId: ID;
  instructorId: ID;
  mode: CourseMode;
  /** Platform for online courses (Zoom), or a campus address if physical ones return. */
  venue: string;
  /** When the live masterclass starts (one class per course). */
  startsAt: ISODate;
  durationMinutes: number;
  seats: number;
  price: PKR;
  level: CourseLevel;
  outcomes: string[];
  status: CourseStatus;
  /** The admin can close enrolment before the course is full. */
  enrolmentOpen: boolean;
  featured: boolean;
  createdAt: ISODate;
}

/** One row of payment details shown to students, e.g. "IBAN: PK00 MEZN…". */
export interface PaymentField {
  id: ID;
  label: string;
  value: string;
  /** Shows a copy button next to the value (account numbers, IBANs). */
  copyable: boolean;
}

/** Fully admin-managed: name, logo and any number of detail rows. */
export interface PaymentMethod {
  id: ID;
  name: string;
  /** Uploaded logo (data URL in the mock, Cloudinary URL later). null shows initials. */
  logoUrl: string | null;
  fields: PaymentField[];
  instructions: string;
  enabled: boolean;
  order: number;
}

interface UserBase {
  id: ID;
  name: string;
  email: string;
  phone: string;
  /** MOCK ONLY: plain text so the demo works offline. Supabase Auth replaces this. */
  password: string;
  createdAt: ISODate;
}

export interface AdminUser extends UserBase {
  role: "admin";
}

export interface StudentUser extends UserBase {
  role: "student";
}

export interface TeacherUser extends UserBase {
  role: "teacher";
  /** Referral code students enter at checkout. Unique, upper case. */
  promoCode: string;
  /** Share of each referred sale paid to the teacher. */
  commissionPct: number;
  /** Optional discount the student gets with this code (0 for none). */
  discountPct: number;
  active: boolean;
}

export type User = AdminUser | StudentUser | TeacherUser;

export type OrderStatus = "pending" | "rejected" | "confirmed" | "cancelled";

export interface Receipt {
  id: ID;
  fileName: string;
  mimeType: string;
  /** Data URL in the mock; a Cloudinary URL later. */
  url: string;
  transactionRef: string;
  uploadedAt: ISODate;
}

export interface OrderContact {
  name: string;
  email: string;
  phone: string;
}

export interface PriceBreakdown {
  base: PKR;
  discountPct: number;
  discount: PKR;
  total: PKR;
}

export interface Commission {
  teacherId: ID;
  pct: number;
  amount: PKR;
  /** Set when the admin pays this commission out. */
  payoutId: ID | null;
}

export interface OrderEvent {
  at: ISODate;
  status: OrderStatus | "receipt_uploaded";
  note?: string;
}

export interface Order {
  /** Public order number, e.g. RLX-4F7K2. */
  id: ID;
  courseId: ID;
  /** null for guest checkouts; linked when the student signs up with the same email/phone. */
  studentId: ID | null;
  contact: OrderContact;
  promoCode: string | null;
  price: PriceBreakdown;
  commission: Commission | null;
  paymentMethodId: ID;
  receipts: Receipt[];
  status: OrderStatus;
  rejectionReason: string | null;
  history: OrderEvent[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Payout {
  id: ID;
  teacherId: ID;
  amount: PKR;
  orderIds: ID[];
  reference: string;
  paidAt: ISODate;
}

export interface Certificate {
  id: ID;
  /** Short verification code printed on the certificate. */
  code: string;
  orderId: ID;
  courseId: ID;
  studentName: string;
  courseTitle: string;
  issuedAt: ISODate;
  /** Set when the admin revokes it; verification then reports it as no longer valid. */
  revokedAt: ISODate | null;
}

export type MeetingStatus = "scheduled" | "live" | "ended";

/** A paid, confirmed student registered on the Zoom meeting. */
export interface Registrant {
  orderId: ID;
  name: string;
  /** The student must be signed in to Zoom with this email. */
  email: string;
  /** Secret in the personal join link. */
  joinToken: string;
  registeredAt: ISODate;
}

/** One stay in the meeting. `leftAt` is null while the student is still in it. */
export interface AttendanceSession {
  orderId: ID;
  joinedAt: ISODate;
  leftAt: ISODate | null;
}

export interface DeniedEntry {
  at: ISODate;
  email: string;
  reason: string;
}

/** The Zoom meeting behind a course. Created with the course, one each. */
export interface Meeting {
  courseId: ID;
  zoomId: string;
  status: MeetingStatus;
  startedAt: ISODate | null;
  endedAt: ISODate | null;
  completedAt: ISODate | null;
  registrants: Registrant[];
  attendance: AttendanceSession[];
  denied: DeniedEntry[];
}

export type EmailKind =
  | "teacher_welcome"
  | "student_welcome"
  | "order_received"
  | "order_confirmed"
  | "order_rejected"
  | "password_changed"
  | "payout_sent"
  | "zoom_invite"
  | "certificate_issued";

/** Mock outbox: what would be emailed once SMTP is connected. */
export interface OutboxEmail {
  id: ID;
  kind: EmailKind;
  to: string;
  subject: string;
  body: string;
  /** Files that go with the email; the mock links to the page the PDF is made from. */
  attachments?: { name: string; href: string }[];
  createdAt: ISODate;
}

export interface Testimonial {
  id: ID;
  name: string;
  role: string;
  quote: string;
  isPlaceholder: boolean;
}

export interface Faq {
  id: ID;
  question: string;
  answer: string;
}

export interface Step {
  title: string;
  body: string;
}

export interface Stat {
  label: string;
  value: string;
}

/** Every editable piece of public copy. Managed from Admin → Site content. */
/** Heading block of a home section. `highlight` is shown in the brand gradient after the title. */
export interface SectionCopy {
  label: string;
  title: string;
  highlight: string;
  description: string;
}

/** Intro block at the top of a page (and the brand panel on login/signup). */
export interface PageCopy {
  label: string;
  title: string;
  body: string;
}

export interface AuthPageCopy extends PageCopy {
  asideTitle: string;
  asideBody: string;
}

export interface SiteContent {
  hero: {
    badge: string;
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    upcomingLabel: string;
  };
  /** Headings of each home section. */
  sections: {
    featured: SectionCopy;
    categories: SectionCopy;
    howItWorks: SectionCopy;
    stats: SectionCopy;
    testimonials: SectionCopy;
    faq: SectionCopy;
  };
  pages: {
    courses: PageCopy;
    track: PageCopy;
    verify: PageCopy;
    login: AuthPageCopy;
    signup: AuthPageCopy;
  };
  coursePage: {
    aboutLabel: string;
    outcomesLabel: string;
    instructorLabel: string;
    enrolNote: string;
  };
  stats: Stat[];
  steps: Step[];
  testimonials: Testimonial[];
  faqs: Faq[];
  community: {
    whatsappUrl: string;
    title: string;
    body: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  checkout: {
    promoHelp: string;
    receiptHelp: string;
    pendingMessage: string;
  };
  footer: {
    headline: string;
    highlight: string;
    ctaLabel: string;
    blurb: string;
    tagline: string;
  };
}

export interface Database {
  version: number;
  categories: Category[];
  instructors: Instructor[];
  courses: Course[];
  paymentMethods: PaymentMethod[];
  users: User[];
  orders: Order[];
  payouts: Payout[];
  certificates: Certificate[];
  meetings: Meeting[];
  outbox: OutboxEmail[];
  content: SiteContent;
}

export interface Session {
  userId: ID;
  role: Role;
}
