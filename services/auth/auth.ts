import { baseApi } from "../baseApi";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  ChangePasswordResponse,
  ChangePasswordPayload,
} from "./auth-type";

export type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
} from "./auth-type";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    getProfile: build.query<AuthUser, void>({
      query: () => "/auth/profile",
      providesTags: ["Auth"],
    }),

    googleLogin: build.mutation<LoginResponse, GoogleLoginRequest>({
      query: (body) => ({
        url: "/auth/google",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    forgetPassword: build.mutation<
      ForgetPasswordResponse,
      ForgetPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    changePassword: build.mutation<
      ChangePasswordResponse,
      ChangePasswordPayload
    >({
      query: (body) => ({
        url: "/change-password",
        method: "PUT",
        body,
      }),
    }),
    // changePassword: build.mutation<
    //   ForgetPasswordResponse,
    //   { token: string; newPassword: string }
    // >({
    //   query: ({ token, newPassword }) => ({
    //     url: `/auth/change-password?token=${token}`,
    //     method: "POST",
    //     body: { newPassword },
    //   }),
    // }),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useGoogleLoginMutation,
  useForgetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
