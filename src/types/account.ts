import type { ID, ISODate, Role } from "./domain";

export interface TeacherRates {
  promoCode: string;
  commissionPct: number;
  discountPct: number;
}

/** The signed-in user as the browser sees them. */
export interface Account {
  id: ID;
  role: Role;
  name: string;
  email: string;
  phone: string;
  teacher: TeacherRates | null;
}

export interface TeacherAccount extends TeacherRates {
  id: ID;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  /** Invited but hasn't chosen a password yet. */
  invited: boolean;
  createdAt: ISODate;
}
