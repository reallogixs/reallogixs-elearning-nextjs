import type { CatalogueCourse } from "./catalogue";
import type { Certificate, ISODate, Meeting, MeetingStatus, Order } from "./domain";
import type { PaymentMethod, Payout, User } from "./domain";

/** Database data for one viewer, limited to what they may see. Never saved in the browser. */
export interface PortalData {
  orders: Order[];
  /** Archived courses that still have orders are included, as drafts. */
  courses: CatalogueCourse[];
  paymentMethods: PaymentMethod[];
  users: User[];
  payouts: Payout[];
  meetings: Meeting[];
  certificates: Certificate[];
}

export interface PromoPreview {
  code: string;
  teacherName: string;
  discountPct: number;
}

/** After an order is placed, found or updated by its owner. */
export interface OrderResult {
  number: string;
  data: PortalData;
}

/** What the holder of a personal class link sees before they are let in. */
export interface JoinInfo {
  title: string;
  startsAt: ISODate;
  durationMinutes: number;
  status: MeetingStatus;
  completedAt: ISODate | null;
}

export interface EmailLogEntry {
  id: string;
  subject: string;
  to: string;
  status: "queued" | "sent" | "failed";
  createdAt: ISODate;
}
