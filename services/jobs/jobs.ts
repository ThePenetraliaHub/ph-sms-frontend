import { baseApi } from "../baseApi";
import {
  CreateJobPayload,
  DeleteJobResponse,
  JobResponse,
  JobsQueryParams,
  JobsResponse,
  UpdateJobPayload,
} from "./jobs-type";

const BASE = "/jobs";

export const jobsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getJobs: build.query<JobsResponse, JobsQueryParams | void>({
      query: (params) => ({ url: BASE, params: params ?? {} }),
      providesTags: ["Jobs"],
    }),

    getJobsById: build.query<JobResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      providesTags: (_, __, id) => [{ type: "Jobs", id }],
    }),

    createJob: build.mutation<JobResponse, CreateJobPayload>({
      query: (body) => ({ url: BASE, method: "POST", body }),
      invalidatesTags: ["Jobs"],
    }),

    updateJob: build.mutation<
      JobResponse,
      { id: string; data: UpdateJobPayload }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Jobs", id }, "Jobs"],
    }),

    deleteLeaveRequest: build.mutation<DeleteJobResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Jobs"],
    }),
  }),
});

export const {
  useGetJobsByIdQuery,
  useGetJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteLeaveRequestMutation,
} = jobsApi;
