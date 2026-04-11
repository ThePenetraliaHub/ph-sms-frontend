import { User } from "../users/users-type";
import type {
  GeneralStatus,
  ApiResponse,
  ApiListResponse,
  ApiDeleteResponse,
  BaseQueryParams,
} from "../shared-types";

export type School = {
  id: string;
  creator_id: string;
  updated_by_id: string | null;

  name: string;
  address: string;
  motto: string;
  type: "primary" | "secondary" | "tertiary" | string;

  phone: string;
  email: string;
  website: string;

  term: Term;
  bank: Record<string, unknown>;
  score: Score;

  discount: string | null;

  established_date: string;
  accreditation_number: string;
  license_number: string;

  student_capacity: number;
  current_enrollment: number;

  subscription: SubscriptionSummary;
  subscription_details: SubscriptionDetails;

  color: SchoolColor;
  logo: SchoolLogo;

  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;

  is_active: boolean;

  classes: string[];

  timetable_name: string | null;
  applicable_school_grade: string | null;
  academic_term: string | null;

  school_days: string[];
  no_of_periods_per_day: number | null;
  default_period_duration: number | null;

  break_periods: Record<string, unknown>;
  subjects: string[];

  status: GeneralStatus;
  is_deleted: boolean;
  discount_rules?: DiscountRule[];

  creator: User;
};

export interface SubscriptionPlan {
  id: string;
  creator: string;
  updated_by: string | null;
  plan: string;
  cost: string;
  total_students: number;
  total_teachers: number;
  total_users: number;
  duration: number;
  features: string[];
  description: string;
  discount: string;
  status: "available" | "unavailable" | string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionDetails {
  subscription_id: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive" | "expired" | string;
  subscription: SubscriptionPlan;
}

export interface SubscriptionSummary {
  status: "active" | "inactive" | "expired" | string;
  start_date: string;
  end_date: string;
  subscription_id: string;
}

export interface SchoolColor {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
}

export interface SchoolLogo {
  svg: string;
  image_url: string | null;
  image_public_id: string | null;
}

export interface Term {
  name: string;
  session: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
}

export interface Score {
  ca: number;
  exam: number;
  total: number;
}

export interface Bank {
  bank_id: string;
  bank_code: string;
  bank_name: string;
  account_name: string;
  account_number: string;
}

export interface Break {
  title: string;
  type: "break" | "period"; // break, period
  start_time: string;
  end_time: string;
}

export interface CreateSchoolRequest {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;

  motto: string;
  type: "secondary" | string;
  status: "active" | string;

  established_date: string;
  accreditation_number: string;
  license_number: string;
  student_capacity: number;
  current_enrollment: number;

  color: SchoolColor;
  logo: SchoolLogo;
  subscription: {
    subscription_id: string;
    plan: "standard" | string;
    start_date: string;
    end_date: string;
    status: "active" | string;
  };

  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;

  is_active: boolean;
  term: Term;
}

export interface TimetableUpdatePayload {
  timetable_name?: string;
  applicable_school_grade?: string;
  academic_term?: string;
  school_days?: string[];
  no_of_periods_per_day?: number;
  default_period_duration?: number;
  break_periods?: Break[];
}

export interface SchoolSubscriptionUpdate {
  subscription_id: string;
  plan: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface UpdateSchoolRequest {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;

  motto: string;
  type: "secondary" | string;
  status: "active" | string;

  established_date: string;
  accreditation_number: string;
  license_number: string;
  student_capacity: number;
  current_enrollment: number;

  color: SchoolColor;
  logo: SchoolLogo;
  subscription: SchoolSubscriptionUpdate;

  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;

  is_active: boolean;
  term: Term;

  bank: Bank;
  score: Score;

  timetable?: TimeTable[];
  grading_scales_config: GradingScaleConfig[];
  academic_calendar_config: AcademicCalendarConfig;
  discount_rules: DiscountRule[];

  daily_reconciliation: Boolean;
  max_single_transaction: string;
  low_stock_threshold: number;

  discount: string;
  classes: string[];
  subjects: string[];
  timetable_name: string;
  applicable_school_grade: string;
  academic_term: string;
  school_days: string[];
  no_of_periods_per_day: number;
  default_period_duration: number;
  break_periods: Break[];
}

interface TimeTable {
  school_days: string[];
  academic_term: string;
  break_periods: Break[];
  timetable_name: string;
  no_of_periods_per_day: number;
  applicable_school_grade: string;
  default_period_duration: number;
}

interface GradingScaleConfig {
  name: string;
  gpa_value: string;
  lower_percentage: number;
  upper_percentage: number;
  holidays_or_breaks: string;
}

interface AcademicCalendarConfig {
  name: string;
  end_date: string;
  start_date: string;
  no_of_terms: number;
  holidays_or_breaks: {
    name: string;
    time_in: string;
    end_date: string;
    time_out: string;
    start_date: string;
  };
}

export interface DiscountRule {
  rule_name: string;
  discount_value: number;
  trigger_criteria: string;
  policy_type?: string;
  status_control: Boolean;
  reason: string;
  supervisor: string;
  rule_condition: string;
  conflict_resolution: string;
  applicable_to: string;
  exclusions: string;
}

export type SchoolListResponse = ApiListResponse<School>;
export type SchoolResponse = ApiResponse<School>;
export type DeleteSchoolResponse = ApiDeleteResponse;

export interface SchoolQueryParams extends BaseQueryParams {
  _all?: boolean;
}

export interface SchoolApplicationConfig {
  term: Term;
  score: Score;
  timetable_name: string | null;
  applicable_school_grade: string | null;
  academic_term: string | null;
  school_days: string[];
  no_of_periods_per_day: number | null;
  default_period_duration: number | null;
  break_periods: Break[];
}

export interface SchoolApplicationConfigUpdate {
  term?: Term;
  score?: Score;
  timetable_name?: string | null;
  applicable_school_grade?: string | null;
  academic_term?: string | null;
  school_days?: string[];
  no_of_periods_per_day?: number | null;
  default_period_duration?: number | null;
  break_periods?: Break[];
}

export interface SettingsDashboardAdminRole {
  id: string;
  primaryRole: string;
  assignedTo: string;
  coreModulesAccessible: string;
  lastPermissionUpdate: string | null;
}

export interface SchoolSettingsDashboard {
  activeAdminsCount: number;
  lastSecurityAudit: string | null;
  systemUptime: string | null;
  adminRoster: SettingsDashboardAdminRole[];
}

export interface SchoolSettingsDashboardUpdate {
  lastSecurityAudit?: string | null;
  systemUptime?: string | null;
}

export interface RoleTemplateModulePermission {
  module: string;
  readOnly: boolean;
  readWrite: boolean;
  none: boolean;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  modulePermissions: RoleTemplateModulePermission[];
  permissions?: string[];
}

export interface RoleTemplateModulesResponse {
  modules: string[];
}

export interface RoleTemplatesListResponse {
  roleTemplates: RoleTemplate[];
  modules: string[];
}

export interface RoleTemplateUpdatePayload {
  id: string;
  name: string;
  description: string;
  modulePermissions: RoleTemplateModulePermission[];
}
