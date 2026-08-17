export type UserRole = "ADMIN" | "TEACHER" | "PARENT";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface Classroom {
  id: string;
  name: string;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  classroomId: string;
  name: string;
}

export interface Child {
  id: string;
  admissionNumber: string | null;
  firstName: string;
  lastName: string;
  passportUrl: string | null;
  admissionStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN" | "GRADUATED";
  classroomId: string | null;
  classroomName: string | null;
  invoiceId: string | null;
  totalAmount: string | null;
  amountPaid: string | null;
  invoiceStatus: "UNPAID" | "PARTIALLY_PAID" | "FULLY_PAID" | null;
  balance: number | null;
}

export interface Invoice {
  id: string;
  session: string;
  term: number;
  total_amount: string;
  amount_paid: string;
  status: "UNPAID" | "PARTIALLY_PAID" | "FULLY_PAID";
  balance: number;
}

export interface Transaction {
  id: string;
  paystack_reference: string;
  amount_paid: string;
  status: string;
  paid_at: string;
}
