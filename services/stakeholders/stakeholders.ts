import { baseApi } from "../baseApi";
import type {
  Stakeholders,
  CreateStakeholdersRequest,
  UpdateStakeholdersRequest,
  AssignDutyStakeholder,
  StakeholdersListResponse,
  AllStudentStakeholdersResponse,
  StakeholderListResponseWithMetrics,
  StudentStakeholderListResponseWithMetrics,
  StudentMetrics,
} from "./stakeholder-types";
import {
  calculateStakeholderMetrics,
  calculateStudentStakeholderMetrics,
  calculateStudentMetrics,
  calculateStaffUtilization,
  getStakeholderStageLabel,
  getAllStudents,
} from "./stakeholders-selector";
import type { ApiResponse, ApiDeleteResponse } from "../shared-types";

const BASE = "/stakeholders";

export interface StakeholdersQueryParams {
  _all?: boolean;
  "type[eq]"?: string;
  "user_id[eq]"?: string;
}

export const stakeholdersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getStakeholders: build.query<
      StakeholdersListResponse,
      StakeholdersQueryParams | void
    >({
      query: (params) => ({ url: BASE, params: params ?? {} }),
      providesTags: ["Stakeholder"],
    }),

    getParentByUserId: build.query<ApiResponse<Stakeholders>, string>({
      query: (userId) => ({
        url: BASE,
        params: { _all: "true", "type[eq]": "parent", "user_id[eq]": userId },
      }),
      transformResponse: (response: StakeholdersListResponse) => {
        const parent = (response.data ?? []).find((s) => s.type === "parent");
        return {
          ...response,
          data: parent ?? null,
        } as ApiResponse<Stakeholders>;
      },
      providesTags: ["Stakeholder"],
    }),
    getTeacherByUserId: build.query<ApiResponse<Stakeholders>, string>({
      query: (userId) => ({
        url: BASE,
        params: {
          _all: "true",
          "type[in]": "teacher,staff",
          "user_id[eq]": userId,
        },
      }),
      transformResponse: (response: StakeholdersListResponse) => {
        const teacher = (response.data ?? []).find(
          (s) => s.type === "teacher" || s.type === "staff",
        );
        return {
          ...response,
          data: teacher ?? null,
        } as ApiResponse<Stakeholders>;
      },
      providesTags: ["Stakeholder"],
    }),
    getAllStaff: build.query<AllStudentStakeholdersResponse, void>({
      query: () => ({ url: BASE }),
      transformResponse: (
        response: StakeholdersListResponse,
      ): AllStudentStakeholdersResponse => {
        const staff = response.data.filter(
          (s) => s.type === "staff" || s.type === "teacher",
        );
        return {
          ...response,
          data: staff.map((stakeholder) => ({
            ...stakeholder,
          })),
        };
      },
      providesTags: ["Stakeholder"],
    }),

    getAllStudents: build.query<AllStudentStakeholdersResponse, void>({
      query: () => ({ url: BASE }),
      transformResponse: (
        response: StakeholdersListResponse,
      ): AllStudentStakeholdersResponse => {
        const students = getAllStudents(response.data);
        return {
          ...response,
          data: students.map((stakeholder) => ({
            ...stakeholder,
          })),
        };
      },
      providesTags: ["Stakeholder"],
    }),

    getStudentStakeholderMetrics: build.query<
      StudentStakeholderListResponseWithMetrics,
      void
    >({
      query: () => ({ url: BASE }),
      transformResponse: (
        response: StakeholdersListResponse,
      ): StudentStakeholderListResponseWithMetrics => {
        const students = response.data.filter((s) => s.type === "student");
        return {
          ...response,
          data: students.map((stakeholder) => ({
            ...stakeholder,
          })),
          metrics: calculateStudentStakeholderMetrics(response.data),
        };
      },
      providesTags: ["Stakeholder"],
    }),

    getStakeholderMetrics: build.query<
      StakeholderListResponseWithMetrics,
      void
    >({
      query: () => ({ url: BASE }),
      transformResponse: (
        response: StakeholdersListResponse,
      ): StakeholderListResponseWithMetrics => {
        const students = response.data.filter((s) => s.type === "student");
        return {
          ...response,
          metrics: calculateStakeholderMetrics(students),
          data: students.map((stakeholder) => ({
            ...stakeholder,
            stage_text: getStakeholderStageLabel(stakeholder.stage),
          })),
        };
      },
      providesTags: ["Stakeholder"],
    }),

    getStudentMetrics: build.query<ApiResponse<StudentMetrics>, void>({
      query: () => ({ url: BASE }),
      transformResponse: (
        response: StakeholdersListResponse,
      ): ApiResponse<StudentMetrics> => ({
        ...response,
        data: calculateStudentMetrics(response.data),
      }),
      providesTags: ["Stakeholder"],
    }),

    getStaffUtilization: build.query<
      ApiResponse<{
        breakdown: { label: string; value: number; color: string }[];
      }>,
      void
    >({
      query: () => ({ url: BASE, params: { _all: "true" } }),
      transformResponse: (
        response: StakeholdersListResponse,
      ): ApiResponse<{
        breakdown: { label: string; value: number; color: string }[];
      }> => ({
        status: response.status ?? true,
        status_code: response.status_code ?? 200,
        message: response.message ?? "Success",
        data: { breakdown: calculateStaffUtilization(response.data ?? []) },
      }),
      providesTags: ["Stakeholder"],
    }),

    getStakeholderById: build.query<ApiResponse<Stakeholders>, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      providesTags: (_, __, id) => [{ type: "Stakeholder", id }],
    }),

    getStudentById: build.query<ApiResponse<Stakeholders>, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      transformResponse: (
        response: ApiResponse<Stakeholders>,
      ): ApiResponse<Stakeholders> => {
        if (response.data.type !== "student") {
          throw new Error("Stakeholder is not a student");
        }
        return {
          ...response,
          data: {
            ...response.data,
            stage_text: getStakeholderStageLabel(response.data.stage),
          },
        };
      },
      providesTags: (_, __, id) => [{ type: "Stakeholder", id }],
    }),

    createStakeholder: build.mutation<
      ApiResponse<Stakeholders>,
      CreateStakeholdersRequest | FormData
    >({
      query: (body) => {
        // FormData: browser sets Content-Type + boundary
        if (body instanceof FormData) {
          return {
            url: BASE,
            method: "POST",
            body,
            formData: true,
          };
        }
        return { url: BASE, method: "POST", body };
      },
      invalidatesTags: ["Stakeholder"],
    }),

    assignDuty: build.mutation<ApiResponse<unknown>, AssignDutyStakeholder>({
      query: (body) => ({ url: `${BASE}/assign/duty`, method: "POST", body }),
      invalidatesTags: ["Stakeholder"],
    }),

    updateStakeholder: build.mutation<
      ApiResponse<Stakeholders>,
      { id: string; data: UpdateStakeholdersRequest }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Stakeholder", id },
        "Stakeholder",
      ],
    }),

    deleteStakeholder: build.mutation<ApiDeleteResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "Stakeholder", id },
        "Stakeholder",
      ],
    }),
  }),
});

export const {
  useGetStakeholdersQuery,
  useGetParentByUserIdQuery,
  useGetTeacherByUserIdQuery,
  useGetAllStaffQuery,
  useGetAllStudentsQuery,
  useGetStudentStakeholderMetricsQuery,
  useGetStakeholderMetricsQuery,
  useGetStudentMetricsQuery,
  useGetStaffUtilizationQuery,
  useGetStakeholderByIdQuery,
  useLazyGetStakeholderByIdQuery,
  useGetStudentByIdQuery,
  useCreateStakeholderMutation,
  useAssignDutyMutation,
  useUpdateStakeholderMutation,
  useDeleteStakeholderMutation,
} = stakeholdersApi;
