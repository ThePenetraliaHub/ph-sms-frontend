import { School } from "../schools/schools-type";
import type {
  ApiResponse,
  ApiListResponse,
  ApiDeleteResponse,
  BaseQueryParams,
} from "../shared-types";
import { Stakeholders } from "../stakeholders/stakeholder-types";

/**
 * Type definitions for Attendance API responses
 */

export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  courseId?: string;
  courseName?: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  markedBy?: string;
  createdAt?: string;
}

export interface StudentAttendance {
  id: string;
  creator_id: string;
  updated_by_id: string;
  school_id: string;
  stakeholder_id: string;
  class_name: string;
  session: string;
  date: string;
  notes: string;
  status: "present" | "absent" | "late" | "excused";
  created_at: string;
  updated_at: string;
  school: School;
  stakeholder: Stakeholders;
}

export interface CreateAttendanceRequest {
  studentId: string;
  classId: string;
  courseId?: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

export interface BulkAttendanceRequest {
  classId: string;
  courseId?: string;
  date: string;
  attendances: {
    studentId: string;
    status: "present" | "absent" | "late" | "excused";
    remarks?: string;
  }[];
}

/**
 * Attendance list response with pagination
 */
export type AttendanceListResponse = ApiListResponse<StudentAttendance>;

/**
 * Attendance response for single entity operations
 */
export type AttendanceResponse = ApiResponse<Attendance>;

/**
 * Delete attendance response
 */
export type DeleteAttendanceResponse = ApiDeleteResponse;

/**
 * Attendance query parameters for filtering and pagination
 */
export interface AttendanceQueryParams extends BaseQueryParams {
  studentId?: string;
  classId?: string;
  courseId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: "present" | "absent" | "late" | "excused";
}
