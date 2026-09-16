import { ApiResponse } from "../shared-types";

export type InitiatePaymentPayload = {
  student_id: string;
  fee_ids: string[];
  amount: number;
  email: string;
};

export type InitiatePaymentData = {
  transaction: {
    id: string;
    student_id: string;
    student_name: string;
    student_admission_number: string;
    school_id: string;
    school_name: string;
    amount: string;
    currency: string;
    reference: string;
    access_code: string;
    authorization_url: string;
    fee_ids: string[];
    status: "pending" | "success" | "failed";
    payment_method: string;
    transaction_id: string | null;
    created_at: string;
    updated_at: string;
    paid_at: string | null;
    expires_at: string;
  };
  payment: {
    reference: string;
    access_code: string;
    authorization_url: string;
    amount: number;
    currency: string;
  };
  payment_gateway: string;
  redirect_url: string;
};

export type VerifyPaymentData = {
  payment: {
    id: string;
    reference: string;
    status: "success" | "failed" | "pending";
    amount: string;
    paid_at: string;
  };
  fees_processed: [
    {
      fee_id: string;
      fee_name: string;
      amount_paid: number;
      amount_owed: number;
      status: "paid" | string;
    },
    {
      fee_id: string;
      fee_name: string;
      amount_paid: number;
      amount_owed: number;
      status: string;
    },
  ];
  total_paid: number;
  total_owed: number;
};

export type InitiatePaymentResponse = ApiResponse<InitiatePaymentData>;

export type VerifyPaymentResponse = ApiResponse<VerifyPaymentData>;
