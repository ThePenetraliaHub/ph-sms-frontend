import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";
import { clearError, setError } from "@/store/errorSlice";
import { logout, selectToken } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/format-api-error";

// Endpoints: URL/params/body; use *-selectors for UI transforms.
const getBaseUrl = () => {
  const rawUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL;

  if (!rawUrl) {
    if (typeof window !== "undefined") {
      console.error("❌ API base URL not configured!");
      console.error(
        "Please set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_BASE_URL environment variable.",
      );
    }
    return "https://api-placeholder.invalid";
  }

  const url = rawUrl.replace(/\/+$/, "");

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (typeof window !== "undefined") {
      console.error(
        "❌ API baseUrl must be a full URL (starting with http:// or https://)",
      );
      console.error("Current value:", url);
    }
    return "https://api-placeholder.invalid";
  }

  return url;
};

const getApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_AUTH_API_KEY;
  if (!apiKey && typeof window !== "undefined") {
    console.error(
      "❌ x-api-key is NOT configured! Set NEXT_PUBLIC_AUTH_API_KEY environment variable.",
    );
  }
  return apiKey || "";
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState, endpoint }) => {
    if (typeof window === "undefined") {
      return headers;
    }

    const apiKey = getApiKey();
    if (apiKey) {
      headers.set("x-api-key", apiKey);
    }

    // Ngrok: skip browser warning page
    const baseUrl = getBaseUrl();
    if (
      baseUrl.includes("ngrok-free.app") ||
      baseUrl.includes("ngrok-free.dev") ||
      baseUrl.includes("ngrok.io")
    ) {
      headers.set("ngrok-skip-browser-warning", "true");
    }

    const state = getState() as RootState;
    const token = selectToken(state);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const isMultipart =
      endpoint === "admissionRegister" ||
      endpoint === "createStakeholder" ||
      endpoint === "createSubject";
    if (!isMultipart) {
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
    }

    return headers;
  },
});

const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseUrl = getBaseUrl();
  const requestUrl = typeof args === "string" ? args : args.url;
  const method = typeof args === "string" ? "GET" : args.method || "GET";
  const fullUrl = `${baseUrl}${requestUrl}`;

  if (typeof window !== "undefined") {
    console.groupEnd();
  }

  const startTime = Date.now();
  const result = await rawBaseQuery(args, api, extraOptions);
  const duration = Date.now() - startTime;

  if (typeof window !== "undefined") {
    if (result.data) {
      const response = result.data as
        | { status?: boolean; status_code?: number }
        | undefined;
      const isSuccess =
        response?.status === true ||
        (response?.status_code && response.status_code < 400);

      if (!isSuccess) {
        console.group(`❌ ${method} ${requestUrl} - Failed (${duration}ms)`);
        console.error(
          "Response Status:",
          response?.status,
          response?.status_code,
        );
        console.error("Response:", result.data);
        console.groupEnd();
      }
    } else if (result.error) {
      console.group(`❌ ${method} ${requestUrl} - Error (${duration}ms)`);
      console.error("Status:", result.error.status);
      console.error("Error Data:", result.error.data);
      console.groupEnd();
    }
  }

  // API { status: false } or status_code >= 400 → error
  if (result.data) {
    const response = result.data as
      | { status?: boolean; status_code?: number; message?: string }
      | undefined;

    if (
      response?.status === false ||
      (response?.status_code && response.status_code >= 400)
    ) {
      const errorMessage = response?.message || "Request failed";
      return {
        error: {
          status: response?.status_code || 400,
          data: { message: errorMessage },
        } as FetchBaseQueryError,
      };
    }

    if (response?.status === true && response?.message) {
      // toast.success(response.message);
    }
  }

  if (result.error) {
    const status = result.error.status;
    const data = result.error.data;

    // HTML body = Next 404, not API JSON
    const isHtmlResponse =
      typeof data === "string" && (data as string).includes("<!DOCTYPE html>");

    let errorMessage = getApiErrorMessage(data);

    const defaultMsg = "Something went wrong. Please try again.";
    if (isHtmlResponse || (status === 404 && errorMessage === defaultMsg)) {
      errorMessage = `API endpoint not found. Check API configuration. Attempted: ${fullUrl}`;
      console.error("❌ API Request Failed:", {
        baseUrl,
        endpoint: requestUrl,
        fullUrl,
        status,
      });
    }

    if (status === 401) {
      const state = api.getState() as RootState;
      const isAuthenticated = state.auth.isAuthenticated;

      if (isAuthenticated) {
        toast.error(`Session expired. Please log in again.`);
        api.dispatch(logout());
      } else {
        // Sign-in shows its own errors
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/signin")
        ) {
          toast.error(`Unauthorized: ${errorMessage}`);
        }
      }
    } else if (status === 403) {
      toast.error(`Forbidden: ${errorMessage}`);
    } else {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/signin")
      ) {
        toast.error(errorMessage);
      }
    }

    api.dispatch(
      setError({ code: status, message: errorMessage, details: data }),
    );
  } else {
    api.dispatch(clearError());
  }

  return result;
};

// Shared RTK Query API (single cache)
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    "Vacancy",
    "TeacherCourse",
    "TeacherQuestion",
    "CanteenProduct",
    "Auth",
    "User",
    "Product",
    "Order",
    "School",
    "Student",
    "Course",
    "ContentSubmission",
    "TeacherActivity",
    "Assignment",
    "Grade",
    "Attendance",
    "CalendarEvent",
    "Message",
    "Notice",
    "Notification",
    "Timetable",
    "Fee",
    "Wallet",
    "WalletTransaction",
    "Transaction",
    "Admission",
    "LeaveRequest",
    "Note",
    "Schedule",
    "Subject",
    "Stakeholder",
    "Chat",
    "Attachment",
    "CbtExam",
    "CbtResult",
    "CbtQuestion",
    "ExamResult",
    "Subscription",
    "Transport",
    "Hostel",
    "UserRequest",
    "LeavePolicy",
    "PersonalTask",
    "Jobs",
  ],
  endpoints: () => ({}),
});
