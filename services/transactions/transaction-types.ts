import { User } from "../users/users-type";
import { School } from "../schools/schools-type";
import { Currency } from "@/common/types";
import { Stakeholders } from "../stakeholders/stakeholder-types";
import {
  PaymentMethod,
  PaymentType,
  TransactionType,
  PaymentGateway,
} from "../shared-types";
import type {
  ApiResponse,
  ApiListResponse,
  BaseQueryParams,
} from "../shared-types";

export type TransactionListResponse = ApiListResponse<Transaction>;

type TransactionCategory = "salaries" | string;
type TransactionStatus = "completed" | "pending" | string;

export interface Transaction {
  id: string;
  creator_id: string;
  updated_by_id?: null | string;
  receiver_id: string;
  school_id?: null | string;
  wallet_id: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  transaction_type: TransactionType;
  amount: string;
  date?: string | null;
  reference: string;
  description: string;
  category: null;
  currency: Currency;
  status: TransactionStatus;
  creator: User;
  updated_by?: null | User;
  receiver?: User | null;
  school?: School | null;
  wallet: TransactionWallet;
  created_at: string | null;
  updated_at: string | null;
}

export interface TransactionWallet {
  id: string;
  creator_id: string;
  updated_by_id: null;
  school_id: null;
  user_id: string;
  balance: string;
  currency: Currency;
  status: null | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateTransactions {
  school_id: string;
  amount: number;
}

export interface CreateBulkInvoicePayload {
  grade_class: string;
  start_invoice_number: string;
  academic_term: string;
  amount: number;
  note: string;
  payment_deadline: string;
  notify_parents: boolean;
}

export interface CreateBulkInvoiceData {
  preview_id: string;
  total_invoices: number;
  total_amount: number;
  recipients: Stakeholders[];
}

export interface UpdateTransactions {
  receiver_id: string;
  school_id: string;
  wallet_id: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  transaction_type: TransactionType;
  amount: number;
  date?: string | null;
  reference: string;
  description: string;
  category: TransactionCategory;
  currency: Currency;
  status: TransactionStatus;
}

export interface InitializePayment {
  payment_gateway?: PaymentGateway;
  amount: number;
  school_id?: string;
  receiver_id?: string;
  sender_id?: string;
  payment_type?: PaymentType;
  description?: string;
  return_url?: string;
}

export interface VerifyTransaction {
  reference: string;
}

export interface TransferMoney {
  name: string;
  account_number: string;
  bank_code: string;
  amount: number;
}

export type CreateBulkInvoiceResponse = ApiResponse<CreateBulkInvoiceData>;
export type TransactionSingleResponse = ApiResponse<Transaction>;

export interface BudgetSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  currency: Currency;
  transaction_count: number;
}

export type BudgetSummaryResponse = ApiResponse<BudgetSummary>;

export interface TransactionsQueryParams extends BaseQueryParams {
  wallet_id?: string;
  user_id?: string;
  status?: TransactionStatus;
  payment_type?: PaymentType;
  transaction_type?: TransactionType;
  start_date?: string;
  end_date?: string;
  _all?: boolean | string;
}

export interface InitializePaymentData extends Transaction {
  channel: string;
  authorization_url: string;
  access_code: string;
}

export type InitializePaymentResponse = ApiResponse<InitializePaymentData>;
