/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ApiResponse,
  ApiListResponse,
  BaseQueryParams,
} from "../shared-types";
import type { User } from "../users/users-type";
import type { School } from "../schools/schools-type";
import type { Stakeholders } from "../stakeholders/stakeholder-types";
import type { Attachment } from "../attachment/attachment-types";

/**
 * User Request Types
 */
export type UserRequestType = "assignment" | "allocation" | "leave" | "others";
export type UserRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | string;

/**
 * User Request Interface
 */
export interface UserRequest {
  id: string;
  creator_id: string;
  updated_by_id: string | null;
  school_id: string;
  supervisor_id: string | null;
  staff_member_id: string | null;
  coverage_staff_id: string | null;
  leave_policy_id: string | null;
  title: string;
  type: UserRequestType;
  assignment_type: string | null;
  duty_role_name: string | null;
  coverage_required: string | null;
  leave_type: string | null;
  resource_category: string | null;
  item_name_model: string | null;
  asset_tag_serial_no: string | null;
  description: string;
  start_date: string | null;
  end_date: string | null;
  issued_date: string | null;
  returned_date: string | null;
  condition_upon_issue: string | null;
  status: UserRequestStatus | null;
  is_deleted: boolean;
  creator?: User;
  updated_by?: User | null;
  school?: School;
  supervisor?: Stakeholders | null;
  staff_member?: Stakeholders | null;
  coverage_staff?: Stakeholders | null;
  leave_policy?: any | null;
  attachments?: Attachment[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Create User Request Request
 */
export interface CreateUserRequestRequest {
  school_id?: string;
  supervisor_id?: string;
  attachment_id?: string;
  staff_member_id?: string;
  coverage_staff_id?: string;
  leave_policy_id?: string;
  title: string;
  type: UserRequestType;
  assignment_type?: string;
  duty_role_name?: string;
  coverage_required?: string;
  leave_type?: string;
  resource_category?: string;
  item_name_model?: string;
  asset_tag_serial_no?: string;
  description: string;
  start_date?: string;
  end_date?: string;
  issued_date?: string;
  returned_date?: string;
  condition_upon_issue?: string;
  status?: UserRequestStatus;
}

/**
 * Update User Request Request
 */
export interface UpdateUserRequestRequest {
  school_id?: string;
  supervisor_id?: string;
  staff_member_id?: string;
  coverage_staff_id?: string;
  leave_policy_id?: string;
  title?: string;
  type?: UserRequestType;
  assignment_type?: string;
  duty_role_name?: string;
  coverage_required?: string;
  leave_type?: string;
  resource_category?: string;
  item_name_model?: string;
  asset_tag_serial_no?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  issued_date?: string;
  returned_date?: string;
  condition_upon_issue?: string;
  status?: UserRequestStatus;
}

/**
 * User Request Query Parameters
 */
export interface UserRequestsQueryParams extends BaseQueryParams {
  type?: UserRequestType;
  status?: UserRequestStatus;
  staff_member_id?: string;
  supervisor_id?: string;
  school_id?: string;
  _all?: boolean;
}

/**
 * API Response Types
 */
export type UserRequestResponse = ApiResponse<UserRequest>;
export type UserRequestsListResponse = ApiListResponse<UserRequest>;
export type DeleteUserRequestResponse = ApiResponse<null>;
