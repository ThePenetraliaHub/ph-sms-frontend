import { baseApi } from "../baseApi";
import type {
  CreateCBTQuestionPayload,
  UpdateCBTQuestionPayload,
  CbtQuestion,
  CbtQuestionsQueryParams,
} from "./cbt-question-types";
import type {
  ApiResponse,
  ApiListResponse,
  ApiDeleteResponse,
} from "../shared-types";

const BASE = "/cbts/questions";

export const cbtQuestionsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getCbtQuestions: build.query<
      ApiListResponse<CbtQuestion>,
      CbtQuestionsQueryParams | void
    >({
      query: (params) => ({
        url: BASE,
        params: params?._all ? { _all: "true", ...params } : (params ?? {}),
      }),
      providesTags: ["CbtQuestion"],
    }),

    getCbtQuestionById: build.query<ApiResponse<CbtQuestion>, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      providesTags: (_, __, id) => [{ type: "CbtQuestion", id }],
    }),

    createCbtQuestion: build.mutation<
      ApiResponse<CbtQuestion>,
      CreateCBTQuestionPayload
    >({
      query: (body) => ({ url: BASE, method: "POST", body }),
      invalidatesTags: ["CbtQuestion"],
    }),

    updateCbtQuestion: build.mutation<
      ApiResponse<CbtQuestion>,
      { id: string; data: UpdateCBTQuestionPayload }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "CbtQuestion", id },
        "CbtQuestion",
      ],
    }),

    deleteCbtQuestion: build.mutation<ApiDeleteResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "CbtQuestion", id },
        "CbtQuestion",
      ],
    }),
  }),
});

export const {
  useGetCbtQuestionsQuery,
  useGetCbtQuestionByIdQuery,
  useCreateCbtQuestionMutation,
  useUpdateCbtQuestionMutation,
  useDeleteCbtQuestionMutation,
} = cbtQuestionsApi;
