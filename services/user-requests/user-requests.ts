/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../baseApi";
import type {
  UserRequest,
  CreateUserRequestRequest,
  UpdateUserRequestRequest,
  UserRequestsListResponse,
  UserRequestResponse,
  DeleteUserRequestResponse,
} from "./user-request-types";
import type { ApiListResponse } from "../shared-types";

const BASE = "/user-requests";

export const userRequestsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getUserRequests: build.query<UserRequestsListResponse, void>({
      query: () => ({ url: BASE, params: { _all: "true" } }),
      // Normalize nested list shapes
      transformResponse: (response: ApiListResponse<UserRequest> | any) => {
        if (
          response.status === false ||
          (response.status_code && response.status_code >= 400)
        ) {
          throw new Error(response.message || "Failed to fetch user requests");
        }
        if (response.data && Array.isArray(response.data)) {
          return response;
        }
        if (
          response.data &&
          typeof response.data === "object" &&
          "data" in response.data
        ) {
          return {
            ...response,
            data: (response.data as any).data || [],
            pagination:
              (response.data as any).pagination || response.pagination,
          };
        }
        return {
          ...response,
          data: [],
          pagination: response.pagination,
        };
      },
      providesTags: ["UserRequest"],
    }),

    getUserRequestById: build.query<UserRequestResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      transformResponse: (response: UserRequestResponse) => {
        if (
          response.status === false ||
          (response.status_code && response.status_code >= 400)
        ) {
          throw new Error(response.message || "Failed to fetch user request");
        }
        return response;
      },
      providesTags: (_, __, id) => [{ type: "UserRequest", id }],
    }),

    createUserRequest: build.mutation<
      UserRequestResponse,
      CreateUserRequestRequest
    >({
      query: (body) => ({
        url: BASE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserRequest"],
    }),

    updateUserRequest: build.mutation<
      UserRequestResponse,
      { id: string; data: UpdateUserRequestRequest }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "UserRequest", id },
        "UserRequest",
      ],
    }),

    deleteUserRequest: build.mutation<DeleteUserRequestResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: ["UserRequest"],
    }),
  }),
});

export const {
  useGetUserRequestsQuery,
  useGetUserRequestByIdQuery,
  useCreateUserRequestMutation,
  useUpdateUserRequestMutation,
  useDeleteUserRequestMutation,
} = userRequestsApi;
