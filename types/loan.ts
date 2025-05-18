export type LoanStatus = "active" | "overdue" | "paid";
export type InterestRateType = "monthly" | "yearly";

export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: LoanStatus;
  interestRate: number;
  interestRateType?: InterestRateType;
  borrowerPhone?: string;
  notes?: string;
  collateral?: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
}

export type PaymentMethod = "cash" | "bank transfer" | "check";
