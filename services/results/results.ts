import { baseApi } from "../baseApi";
import { ApiResponse } from "../shared-types";
import type {
  ResultResponse,
  CreateResultParams,
  UpdateResultParams,
  DeleteResultParams,
  UpdateExamResultParams,
  RecordResultsParams,
  ResultMetrics,
  Result,
  ExamResult,
  ExamResultsQueryParams,
  ExamResultsListResponse,
  GenerateReportPayload,
  PublishGradeReportsPayload,
  GetResultsParams,
  PublishStudentsResultPayload,
  UnpublishStudentResultPayload,
  ReportResponse,
  PublishGradeReportResponse,
  ClassReport,
} from "./result-types";
import { computeResultMetrics } from "./result-metrics";

const BASE = "/results";

// GET /results: data is array or { data: [] }
function normalizeExamResultsListResponse(
  response: ApiResponse<ExamResult[] | { data?: ExamResult[] }> | undefined,
): ExamResultsListResponse {
  if (!response) {
    return {
      status: false,
      status_code: 500,
      message: "No response",
      data: [],
    };
  }
  const raw = response.data;
  const list: ExamResult[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: ExamResult[] })?.data)
      ? (raw as { data: ExamResult[] }).data
      : [];
  return {
    status: response.status ?? true,
    status_code: response.status_code ?? 200,
    message: response.message ?? "Success",
    data: list,
  };
}

export const resultsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getAllResults: build.query<
      ExamResultsListResponse,
      ExamResultsQueryParams | void
    >({
      query: (params) => ({
        url: BASE,
        params: (params ?? {}) as Record<string, string | number | boolean>,
      }),
      transformResponse: normalizeExamResultsListResponse,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "ExamResult" as const,
                id,
              })),
              { type: "ExamResult", id: "LIST" },
            ]
          : [{ type: "ExamResult", id: "LIST" }],
    }),

    getResultsById: build.query<ResultResponse, string>({
      query: (id) => `${BASE}/${id}`,
      providesTags: (_, __, id) => [{ type: "ExamResult", id }],
    }),

    createResults: build.mutation<ResultResponse, CreateResultParams>({
      query: (body) => ({
        url: `${BASE}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExamResult", id: "LIST" }],
    }),

    recordResults: build.mutation<ResultResponse, RecordResultsParams>({
      query: (body) => ({
        url: `${BASE}/record/results`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExamResult", id: "LIST" }],
    }),

    updateResults: build.mutation<ResultResponse, UpdateExamResultParams>({
      query: (arg) => {
        const { id, data: dataPayload, ...rest } = arg;
        const body = dataPayload ?? rest;
        return {
          url: `${BASE}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (_, __, arg) => [
        { type: "ExamResult", id: arg.id },
        { type: "ExamResult", id: "LIST" },
      ],
    }),

    deleteResult: build.mutation<null, string>({
      query: (id) => ({
        url: `${BASE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "ExamResult", id },
        { type: "ExamResult", id: "LIST" },
      ],
    }),

    getResultMetrics: build.query<ApiResponse<ResultMetrics>, void>({
      query: () => ({ url: BASE }),
      transformResponse: (
        response: ApiResponse<Result | Result[]>,
      ): ApiResponse<ResultMetrics> => {
        const raw = response?.data;
        const results: Result[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const metrics = computeResultMetrics(results);
        return {
          status: response.status ?? true,
          status_code: response.status_code ?? 200,
          message: response.message ?? "Success",
          data: metrics,
        };
      },
    }),

    generateGradeReports: build.mutation<ReportResponse, GenerateReportPayload>(
      {
        query: (body) => ({
          url: `${BASE}/grade-reports/generate`,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "ExamResult", id: "LIST" }],
      },
    ),

    publishGradeReports: build.mutation<
      PublishGradeReportResponse,
      PublishGradeReportsPayload
    >({
      query: (body) => ({
        url: `${BASE}/grade-reports/publish`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExamResult", id: "LIST" }],
    }),

    publishSelectedResults: build.mutation<
      ResultResponse,
      PublishStudentsResultPayload
    >({
      query: (body) => ({
        url: `${BASE}/grade-reports/publish`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExamResult", id: "LIST" }],
    }),

    unpublishSelectedResults: build.mutation<
      ResultResponse,
      UnpublishStudentResultPayload
    >({
      query: (body) => ({
        url: `${BASE}/grade-reports/publish`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExamResult", id: "LIST" }],
    }),

    downloadResult: build.query<string, GetResultsParams>({
      query: ({ school_id, class_name, term, session }) => ({
        url: `${BASE}/grade-reports/download`,
        method: "GET",
        params: { school_id, class_name, term, session },
        responseHandler: "text",
      }),
    }),

    getFilteredGradeReports: build.query<ClassReport, GetResultsParams>({
      query: ({ school_id, class_name, term, session }) => ({
        url: `${BASE}/grade-reports`,
        method: "GET",
        params: { school_id, class_name, term, session },
      }),
      providesTags: ["ExamResult"],
    }),
  }),
});

export const {
  useGetAllResultsQuery,
  useGetResultsByIdQuery,
  useCreateResultsMutation,
  useRecordResultsMutation,
  useUpdateResultsMutation,
  useDeleteResultMutation,
  useGetResultMetricsQuery,
  //start
  useGenerateGradeReportsMutation,
  useLazyDownloadResultQuery,
  usePublishGradeReportsMutation,
  usePublishSelectedResultsMutation,
  useUnpublishSelectedResultsMutation,
  useGetFilteredGradeReportsQuery,
} = resultsApi;

export const useGetAllExamResultsQuery = useGetAllResultsQuery;
export const useUpdateExamResultMutation = useUpdateResultsMutation;
