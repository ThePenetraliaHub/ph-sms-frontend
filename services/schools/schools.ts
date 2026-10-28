import { baseApi } from "../baseApi";
import type {
  CreateSchoolRequest,
  UpdateSchoolRequest,
  SchoolListResponse,
  SchoolResponse,
  DeleteSchoolResponse,
  SchoolQueryParams,
  DiscountRule,
  Term,
  SchoolClassResponse,
  FeeStructurePayload,
  FeeStructureResponse,
  BlockUnblockResultAccessResponse,
  CheckResultAccessStatusResponse,
  ViewStudentFeesResponse,
  RecordManualPaymentResponse,
  RecordManualPaymentPayload,
} from "./schools-type";

const BASE = "/schools";

export const schoolsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getSchools: build.query<SchoolListResponse, SchoolQueryParams | void>({
      query: (params) => ({ url: BASE, params: params ?? {} }),
      // providesTags: ["School"],
    }),

    getSchoolById: build.query<SchoolResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      providesTags: (_, __, id) => [{ type: "School", id }],
    }),

    createSchool: build.mutation<SchoolResponse, CreateSchoolRequest>({
      query: (body) => ({ url: BASE, method: "POST", body }),
      invalidatesTags: ["School"],
    }),

    updateSchool: build.mutation<
      SchoolResponse,
      { id: string; data: Partial<UpdateSchoolRequest> }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "School", id }, "School"],
    }),

    deleteSchool: build.mutation<DeleteSchoolResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: ["School"],
    }),

    getDiscountRules: build.query<DiscountRule[], void>({
      query: () => ({ url: `${BASE}` }),
      transformResponse: (response: SchoolResponse): DiscountRule[] =>
        response.data.discount_rules ?? [],
    }),

    getClasses: build.query<string[], string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      transformResponse: (response: SchoolResponse): string[] =>
        response.data.classes ?? [],
    }),

    getClass: build.query<
      SchoolClassResponse,
      { id: string; class_name: string }
    >({
      query: ({ id, class_name }) => ({
        url: `${BASE}/${id}/classes/${class_name}`,
      }),
      providesTags: (_, __, { id }) => [{ type: "School", id }],
    }),

    createFeeStructure: build.mutation<
      FeeStructureResponse,
      FeeStructurePayload
    >({
      query: (body) => ({
        url: `${BASE}/fees`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "School", id: "LIST" }, "Stakeholder"],
    }),

    changeResultAccess: build.mutation<
      BlockUnblockResultAccessResponse,
      { student_id: string; action: "auto" | "block" | "unblock" }
    >({
      query: (body) => ({
        url: `${BASE}/fees/block-access`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stakeholder"],
    }),

    checkResultAccess: build.query<
      CheckResultAccessStatusResponse,
      { studentId: string }
    >({
      query: ({ studentId }) => ({
        url: `${BASE}/fees/block-access?student_id=${studentId}`,
      }),
      providesTags: (_, __, { studentId }) => [{ type: "School", studentId }],
    }),

    viewStudentFees: build.query<
      ViewStudentFeesResponse,
      { student_id: string }
    >({
      query: ({ student_id }) => ({
        url: `${BASE}/fees/student?student_id=${student_id}`,
      }),
      providesTags: (_, __, { student_id }) => [{ type: "School", student_id }],
    }),

    recordManualPayment: build.mutation<
      RecordManualPaymentResponse,
      RecordManualPaymentPayload
    >({
      query: (body) => ({
        url: `${BASE}/fees/manual-payment`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "School", id: "LIST" }, "Stakeholder"],
    }),

    getFeeCollectionSummary: build.query<any, void>({
      query: () => ({
        url: `${BASE}/fees/collection-summary`,
        method: "GET",
        // params: { reference },
      }),
    }),

    getOutstandingFees: build.query<
      any,
      { class_name?: string; only_overdue?: string }
    >({
      query: ({ class_name, only_overdue }) => ({
        url: `${BASE}/fees/outstanding`,
        method: "GET",
        params: { class_name, only_overdue },
      }),
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useGetSchoolByIdQuery,
  useGetDiscountRulesQuery,
  useGetClassesQuery,
  useRecordManualPaymentMutation,
  useGetOutstandingFeesQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useGetClassQuery,
  useCreateFeeStructureMutation,
  useChangeResultAccessMutation,
  useCheckResultAccessQuery,
  useViewStudentFeesQuery,
  useGetFeeCollectionSummaryQuery,
} = schoolsApi;
