export type LoanStatus = "active" | "overdue" | "paid";
export type InterestRateType = "monthly" | "yearly";

export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  startDate: string;
  paidDate?: string;
  status: LoanStatus;
  interestRate: number;
  interestRateType?: InterestRateType;
  borrowerPhone?: string;
  notes?: string;
  collateral?: string;
  paymentProofUri?: string;
  paymentProofType?: string;
  paymentProofName?: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
}

export type PaymentMethod = "cash" | "bank transfer" | "check";
