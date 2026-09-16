import { baseApi } from "../baseApi";
import {
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  VerifyPaymentResponse,
} from "./payment-types";

const BASE = "/transactions/payments";

export const paymentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    initializePayment: build.mutation<
      InitiatePaymentResponse,
      InitiatePaymentPayload
    >({
      query: (data) => ({
        url: `${BASE}/initiate`,
        method: "POST",
        body: data,
      }),
    }),
    verifyPayment: build.mutation<
      VerifyPaymentResponse,
      { refererence: string }
    >({
      query: (data) => ({
        url: `${BASE}/verify`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Transaction", id: "LIST" }],
    }),
    getPaymentStatus: build.query<any, { reference: string }>({
      query: ({ reference }) => ({
        url: `${BASE}/status`,
        method: "GET",
        params: { reference },
      }),
    }),
  }),
});

export const {
  useInitializePaymentMutation,
  useVerifyPaymentMutation,
  useGetPaymentStatusQuery,
} = paymentApi;
