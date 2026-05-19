import { School } from "../schools/schools-type";

export interface AuthUser {
  id: string;
  creator_id: string | null;
  updated_by_id: string | null;
  school_id: string | null;
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string;
  date_of_birth: string | null;
  gender: string;
  status: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  role:
    | "teacher"
    | "student"
    | "parent"
    | "admin"
    | "canteen"
    | "staff"
    | "vendor";
  phone_number: string | null;
  residential_address: string | null;
  profile_image_url: string | null;
  profile_image_public_id: string | null;
  language_preference: string;
  theme: string;
  api_usage: number;
  model_preferences: unknown[];
  training_data: unknown[];
  personalization_settings: Record<string, unknown>;
  two_factor_enabled: boolean;
  data_sharing_consent: boolean;
  groups: unknown[];
  user_permissions: unknown[];
  ip_address: string | null;
  last_login_ip: string | null;
  permissions: unknown[];
  is_deleted: boolean;
  creator: string | null;
  updated_by: string | null;
  school: School;
  date_joined: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  status_code: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: AuthUser;
  };
}

export interface GoogleLoginRequest {
  idToken: string;
  accessToken?: string;
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ForgetPasswordResponse {
  message: string;
  success: boolean;
}

export interface ChangePasswordPayload {
  old_password: string;
  confirm_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  status: boolean;
  status_code: number;
  message: string;
  data: string | null;
}
