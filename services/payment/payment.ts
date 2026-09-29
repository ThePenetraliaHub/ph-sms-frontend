import { baseApi } from "../baseApi";
import {
  FeePaymentStatusResponse,
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  VerifyPaymentResponse,
} from "./payment-types";

const BASE = "/transactions/payments";

export const paymentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    initializeFeesPayment: build.mutation<
      InitiatePaymentResponse,
      InitiatePaymentPayload
    >({
      query: (data) => ({
        url: `${BASE}/initiate`,
        method: "POST",
        body: data,
      }),
    }),
    verifyFeePayment: build.mutation<
      VerifyPaymentResponse,
      { reference: string }
    >({
      query: (body) => ({
        url: `${BASE}/verify`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Transaction", id: "LIST" }],
    }),
    getPaymentStatus: build.query<
      FeePaymentStatusResponse,
      { reference: string }
    >({
      query: ({ reference }) => ({
        url: `${BASE}/status`,
        method: "GET",
        params: { reference },
      }),
    }),
  }),
});

export const {
  useInitializeFeesPaymentMutation,
  useVerifyFeePaymentMutation,
  useGetPaymentStatusQuery,
  useLazyGetPaymentStatusQuery,
} = paymentApi;
