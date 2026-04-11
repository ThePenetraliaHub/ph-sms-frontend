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
      { id: string; data: UpdateSchoolRequest }
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

    getTerm: build.query<Term | null, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      transformResponse: (response: SchoolResponse): Term | null =>
        response.data.term ?? null,
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useGetSchoolByIdQuery,
  useGetDiscountRulesQuery,
  useGetClassesQuery,
  useGetTermQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
} = schoolsApi;
