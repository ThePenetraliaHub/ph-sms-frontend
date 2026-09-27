import { baseApi } from "../baseApi";
import type {
  Attendance,
  CreateAttendanceRequest,
  BulkAttendanceRequest,
  AttendanceListResponse,
  AttendanceQueryParams,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  AttendanceReportResponse,
} from "./attendance-type";

const BASE = "/attendances";

export const attendanceApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getAttendance: build.query<
      AttendanceListResponse,
      AttendanceQueryParams | void
    >({
      query: (params) => ({ url: BASE, params: params ?? {} }),
      providesTags: ["Attendance"],
    }),

    getAllAttendance: build.query<AttendanceListResponse, void>({
      query: () => ({ url: BASE, params: {} }),
      providesTags: ["Attendance"],
    }),

    getAttendanceById: build.query<Attendance, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      providesTags: (_, __, id) => [{ type: "Attendance", id }],
    }),

    createAttendance: build.mutation<Attendance, CreateAttendanceRequest>({
      query: (body) => ({ url: BASE, method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),

    bulkCreateAttendance: build.mutation<
      { success: boolean; message: string },
      BulkAttendanceRequest
    >({
      query: (body) => ({ url: `${BASE}/bulk`, method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),

    markBulkAttendance: build.mutation<
      MarkAttendanceResponse,
      MarkAttendanceRequest
    >({
      query: (body) => ({
        url: `${BASE}/mark/attendance`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    updateAttendance: build.mutation<
      Attendance,
      { id: string; data: Partial<CreateAttendanceRequest> }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Attendance", id },
        "Attendance",
      ],
    }),

    deleteAttendance: build.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Attendance"],
    }),

    //for parents
    getStudentAttendanceReport: build.query<
      AttendanceReportResponse,
      { student_id: string; date_from?: string }
    >({
      query: ({ student_id, date_from }) => ({
        url: `${BASE}/student/${student_id}/report`,
        method: "GET",
        params: { date_from },
      }),
      providesTags: (res, err, { student_id }) => [
        { type: "Attendance", id: student_id },
      ],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useLazyGetAttendanceQuery,
  useGetAllAttendanceQuery,
  useGetAttendanceByIdQuery,
  useCreateAttendanceMutation,
  useBulkCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useMarkBulkAttendanceMutation,
  useGetStudentAttendanceReportQuery,
} = attendanceApi;
