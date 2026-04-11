import { baseApi } from "../baseApi";
import type {
  Transaction,
  TransactionListResponse,
  TransactionSingleResponse,
  TransactionsQueryParams,
  CreateTransactions,
  UpdateTransactions,
  InitializePayment,
  InitializePaymentResponse,
  VerifyTransaction,
  TransferMoney,
  BudgetSummary,
  CreateBulkInvoicePayload,
  CreateBulkInvoiceResponse,
} from "./transaction-types";
import { calculateBudgetSummary } from "./transaction-selectors";
import type { ApiResponse, ApiDeleteResponse } from "../shared-types";

const BASE = "/transactions";

export const transactionsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getTransactions: build.query<
      TransactionListResponse,
      TransactionsQueryParams | void
    >({
      query: (params) => ({ url: BASE, params: params ?? {} }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Transaction" as const,
                id,
              })),
              { type: "Transaction", id: "LIST" },
            ]
          : [{ type: "Transaction", id: "LIST" }],
    }),

    getAllTransactions: build.query<TransactionListResponse, void>({
      query: () => ({ url: BASE }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Transaction" as const,
                id,
              })),
              { type: "Transaction", id: "LIST" },
            ]
          : [{ type: "Transaction", id: "LIST" }],
    }),

    getTransactionById: build.query<TransactionSingleResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      providesTags: (_, __, id) => [{ type: "Transaction", id }],
    }),

    createTransaction: build.mutation<
      ApiResponse<Transaction>,
      CreateTransactions
    >({
      query: (body) => ({ url: BASE, method: "POST", body }),
      invalidatesTags: [
        { type: "Transaction", id: "LIST" },
        "Wallet",
        "WalletTransaction",
      ],
    }),

    updateTransaction: build.mutation<
      ApiResponse<Transaction>,
      { id: string; data: UpdateTransactions }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Transaction", id },
        { type: "Transaction", id: "LIST" },
      ],
    }),

    deleteTransaction: build.mutation<ApiDeleteResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "Transaction", id },
        { type: "Transaction", id: "LIST" },
      ],
    }),

    initializePayment: build.mutation<
      InitializePaymentResponse,
      InitializePayment
    >({
      query: (body) => ({
        url: `${BASE}/service/payment`,
        method: "POST",
        body,
      }),
    }),

    verifyPayment: build.mutation<ApiResponse<Transaction>, VerifyTransaction>({
      query: (body) => ({
        url: `${BASE}/service/paystack-callback`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Transaction", id: "LIST" },
        "Wallet",
        "WalletTransaction",
      ],
    }),

    transferMoney: build.mutation<ApiResponse<Transaction>, TransferMoney>({
      query: (body) => ({
        url: `${BASE}/service/transfer`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Transaction", id: "LIST" },
        "Wallet",
        "WalletTransaction",
      ],
    }),

    getBudgetSummary: build.query<BudgetSummary, void>({
      query: () => ({ url: BASE }),
      transformResponse: (response: TransactionListResponse): BudgetSummary =>
        calculateBudgetSummary(response.data ?? []),
      providesTags: [{ type: "Transaction", id: "LIST" }],
    }),

    createBulkInvoice: build.mutation<
      CreateBulkInvoiceResponse,
      CreateBulkInvoicePayload
    >({
      query: (body) => ({
        url: `${BASE}/invoice/bulk`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetAllTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useInitializePaymentMutation,
  useVerifyPaymentMutation,
  useTransferMoneyMutation,
  useGetBudgetSummaryQuery,
  useCreateBulkInvoiceMutation,
} = transactionsApi;
