import { baseApi } from "../baseApi";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
  UsersQueryParams,
  UserResponse,
  DeleteUserResponse,
  CreateAdmissionResponse,
} from "./users-type";
import type { ApiListResponse } from "../shared-types";

export const usersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getUsers: build.query<UsersListResponse, UsersQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        const hasRoleFilter = params?.role;
        if (params) {
          if (params.page !== undefined)
            queryParams.set("page", params.page.toString());
          if (params.limit !== undefined)
            queryParams.set("limit", params.limit.toString());
          if (params.role) queryParams.set("role[eq]", params.role);
          if (params.status) queryParams.set("status", params.status);
          if (params.search) queryParams.set("search", params.search);
          if (params.schoolId) queryParams.set("schoolId", params.schoolId);
          if (params.isActive !== undefined)
            queryParams.set("isActive", params.isActive.toString());
          if (params.isStaff !== undefined)
            queryParams.set("isStaff", params.isStaff.toString());
          if (params.isSuperuser !== undefined)
            queryParams.set("isSuperuser", params.isSuperuser.toString());
        }
        const qs = queryParams.toString();
        if (hasRoleFilter) return `/users?_all${qs ? `&${qs}` : ""}`;
        return `/users${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: ApiListResponse<User>) => {
        if (
          response.status === false ||
          (response.status_code && response.status_code >= 400)
        ) {
          throw new Error(response.message || "Failed to fetch users");
        }
        return response;
      },
      providesTags: ["User"],
    }),

    getUserById: build.query<UserResponse, string>({
      query: (id) => ({ url: `/users/${id}` }),
      providesTags: (_, __, id) => [{ type: "User", id }],
    }),

    createUser: build.mutation<UserResponse, CreateUserRequest>({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["User"],
    }),

    updateUser: build.mutation<
      UserResponse,
      { id: string; data: Partial<UpdateUserRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "User", id }, "User"],
    }),

    deleteUser: build.mutation<DeleteUserResponse, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),

    admissionRegister: build.mutation<CreateAdmissionResponse, FormData>({
      query: (body) => ({
        url: "/users/admission/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const useGetUsersQuery = usersApi.endpoints.getUsers.useQuery;
export const useGetUserByIdQuery = usersApi.endpoints.getUserById.useQuery;
export const useCreateUserMutation = usersApi.endpoints.createUser.useMutation;
export const useUpdateUserMutation = usersApi.endpoints.updateUser.useMutation;
export const useDeleteUserMutation = usersApi.endpoints.deleteUser.useMutation;
export const useAdmissionRegisterMutation =
  usersApi.endpoints.admissionRegister.useMutation;
