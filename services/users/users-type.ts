/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Attachment } from "../attachment/attachment-types";
import { Notes } from "../notes/note-types";
import { School } from "../schools/schools-type";
import type {
  Roles,
  Gender,
  UserStatus,
  ApiResponse,
  ApiListResponse,
  ApiDeleteResponse,
  BaseQueryParams,
} from "../shared-types";

export interface User {
  id: string;
  creator_id: string;
  updated_by_id: string | null;
  school_id: string | null;

  username: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string;

  date_of_birth: string | null; // ISO date or null
  gender: Gender;
  status: UserStatus;

  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;

  role: Roles;

  phone_number: string | null;
  residential_address: string | null;

  profile_image_url: string | null;
  profile_image_public_id: string | null;

  language_preference: string;
  theme: "light" | "dark";

  api_usage: number;

  model_preferences: unknown[];
  training_data: unknown[];
  personalization_settings: Record<string, unknown>;

  two_factor_enabled: boolean;
  data_sharing_consent: boolean;

  groups: unknown[];
  user_permissions: unknown[];
  permissions: unknown[];

  ip_address: string | null;
  last_login_ip: string | null;

  is_deleted: boolean;

  creator: User | null;
  updated_by: User | null;
  school: School | null;

  date_joined: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  deleted_at: string | null;
}

export interface CreateUserRequest {
  user_name: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  password: string;
  role: Roles;
  phone?: string;
  theme: "dark" | "light" | string;
  permissions: string[];
}

export type { Roles, Gender, UserStatus } from "../shared-types";

export interface UpdateUserRequest {
  school_id: string;
  username: string;
  first_name: string;
  last_name: string;
  birthday?: string | null;
  gender: string;
  status: UserStatus;
  is_active: false;
  is_staff: false;
  is_superuser: false;
  role: Roles;
  profile_image_url?: string | null;
  profile_image_public_id?: string | null;
  language_preference?: string | null;
  theme: "dark" | "light" | string;
  api_usage: number;
  model_preferences: string[];
  training_data: string[];
  personalization_settings: { height: string };
  two_factor_enabled?: boolean | null;
  data_sharing_consent?: boolean | null;
  permissions: string[];
}

export interface AdmissionRegister {
  school_id: string;
  username: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  admission_number: string;
  email: string;
  date_of_birth?: string | null;
  gender: string;
  class_assigned?: string | null;
  role: Roles;
  password?: string; // backend uses USER_PASSWORD env var when omitted
  parent_name: string;
  phone_number: string;
  stage: number;
  initial_status: "Inititated" | string;
  admin_notes: string;
  date_joined?: string | null;
  documents: Documents[];
}

export interface Documents {
  name: string;
  type: string;
  file: string;
}

export type UserResponse = ApiResponse<User>;
export type UsersListResponse = ApiListResponse<User>;
export type DeleteUserResponse = ApiDeleteResponse;

export interface UsersQueryParams extends BaseQueryParams {
  role?: Roles;
  status?: UserStatus;
  schoolId?: string;
  isActive?: boolean;
  isStaff?: boolean;
  isSuperuser?: boolean;
}

export interface CreateAdmission {
  id: string;
  user_id: string;
  creator_id: string;
  updated_by_id?: null | string;
  school_id: string;
  primary_contact_id?: null | string;
  emergency_contact_id?: null | string;
  type: Roles;
  status: "active";
  position: null;
  admission_number: string;
  school_fees: {};
  hostel: {};
  hostel_details?: null;
  transport: {};
  transport_details: null;
  subjects: [];
  class_assigned: "JSS 2";
  assigned_classes: [];
  qualification: null;
  salary: null;
  business: null;
  services: [];
  contracts: [];
  grade: null;
  age?: null | number;
  performance: {};
  bank: {};
  children: [];
  children_details: [];
  relationship_to_student: null;
  occupation: null;
  stage: 2;
  stage_text: null;
  performance_highlights: null;
  common_exam_score: null;
  last_grade_completed: null;
  current_previous_school: null;
  transfer_reason: null;
  admin_notes: string;
  initial_status: string;
  parent_name: string;
  date_joined: string;
  is_deleted: boolean;
  user: User;
  creator: User;
  updated_by?: null | User;
  school: School;
  primary_contact: null;
  emergency_contact: null;
  attachments: Attachment[];
  notes: Notes[];
  created_at: string;
  updated_at: string;
  deleted_at?: null | string;
}

export type CreateAdmissionResponse = ApiResponse<CreateAdmission>;
