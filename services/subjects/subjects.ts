import { baseApi } from "../baseApi";
import type {
  Subject,
  CreateSubjectsRequest,
  UpdateSubjectPayload,
  SubjectListResponse,
} from "./subject-types";
import type { ApiResponse, ApiDeleteResponse } from "../shared-types";

const BASE = "/subjects";

export interface SubjectsQueryParams {
  _all?: boolean;
}

export const subjectsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getSubjects: build.query<
      SubjectListResponse | { data: Subject[] },
      SubjectsQueryParams | void
    >({
      query: (params) => ({ url: BASE, params: params ?? {} }),
      providesTags: ["Subject"],
    }),

    getSubjectById: build.query<ApiResponse<Subject>, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      providesTags: (_, __, id) => [{ type: "Subject", id }],
    }),

    createSubject: build.mutation<ApiResponse<Subject>, FormData>({
      query: (formData) => ({ url: BASE, method: "POST", body: formData, formData: true }),
      invalidatesTags: ["Subject"],
    }),

    updateSubject: build.mutation<
      ApiResponse<Subject>,
      // { id: string; data: UpdateSubjectPayload }
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Subject", id }, "Subject"],
    }),

    deleteSubject: build.mutation<ApiDeleteResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [{ type: "Subject", id }, "Subject"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi;
