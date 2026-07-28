import { User } from "../users/users-type";
import type {
  GeneralStatus,
  ApiResponse,
  ApiListResponse,
  ApiDeleteResponse,
  BaseQueryParams,
} from "../shared-types";
import { Stakeholders } from "../stakeholders/stakeholder-types";
import { Subject } from "../subjects/subject-types";
import { CbtExam } from "../cbt-exams/cbt-exam-types";

export interface AcademicCalendarConfig {
  name: string;
  end_date: string;
  start_date: string;
  no_of_terms: number;
  holidays_or_breaks?: {
    name: string;
    time_in: string;
    end_date: string;
    time_out: string;
    start_date: string;
  };
}

export type School = {
  id: string;
  academic_calendar_config: AcademicCalendarConfig;
  grading_scales_config: GradingScaleConfig[];
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

export type TimeTableFormat = {
  school_days: string[];
  academic_term: string;
  break_periods: {
    type: string;
    title: string;
    end_time: string;
    start_time: string;
  }[];
  timetable_name: string;
  no_of_periods_per_day: number;
  applicable_school_grade: string;
  default_period_duration: number;
};

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

  grading_scales_config: GradingScaleConfig[];
  academic_calendar_config: AcademicCalendarConfig;
  discount_rules: DiscountRule[];

  daily_reconciliation: boolean;
  max_single_transaction: string;
  low_stock_threshold: number;

  discount: string;
  classes: string[];
  subjects: string[];
  timetable_name: string;
  timetable?: TimeTableFormat[];
  applicable_school_grade: string;
  academic_term: string;
  school_days: string[];
  no_of_periods_per_day: number;
  default_period_duration: number;
  break_periods: Break[];
}

// interface TimeTable {
//   school_days: string[];
//   academic_term: string;
//   break_periods: Break[];
//   timetable_name: string;
//   no_of_periods_per_day: number;
//   applicable_school_grade: string;
//   default_period_duration: number;
// }

export interface GradingScaleConfig {
  grade_name: string;
  grade_point: number;
  lower_percentage: number;
  upper_percentage: number;
  remark: string;
  // holidays_or_breaks: string;
}

export interface DiscountRule {
  rule_name: string;
  discount_value: number;
  trigger_criteria: string;
  policy_type?: string;
  status_control: boolean;
  reason: string;
  supervisor: string;
  rule_condition: string;
  conflict_resolution: string;
  applicable_to: string;
  exclusions: string;
}

export type SchoolListResponse = ApiListResponse<School>;
export type SchoolResponse = ApiResponse<School>;
export type SchoolClassResponse = ApiResponse<Class>;
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

export interface Class {
  class_details: {
    average_attendance_percentage: number;
    class_name: string;
    present_today: number;
    total_students: number;
    total_teachers: number;
  };
  school: {
    id: string;
    name: string;
    session: string;
    term: Term;
  };
  students: {
    admission_number: string | null;
    age: string | null;
    attendance: {
      total_days: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      attendance_percentage: number;
    };
    date_joined: string;
    email: string;
    first_name: string;
    full_name: string;
    gender: "male" | "female";
    hostel: any;
    id: string | null;
    last_name: string | null;
    parent_email: string | null;
    parent_name: string | null;
    parent_phone: string | null;
    phone_number: string | null;
    school_fees: {
      last_payment: string | null;
      total_owed: number;
      total_paid: number;
    };
    status: "active" | "inactive";
    transport: {};
    user_id: string;
  }[];
  teachers: {
    assigned_classes: string[];
    date_joined: string;
    department: string;
    email: string;
    first_name: string;
    full_name: string;
    id: string;
    last_name: string;
    phone_number: string;
    position: string;
    qualification: string | null;
    status: string; // "active" | "inactive"
    subjects: Subject[];
    user_id: string;
  }[];
  timetable: TimeTableFormat[];
  // subjects: Partial<Subject>
  subjects: {
    id: string;
    name: string;
    code: string;
    credit_units: string;
    continuous_assessment: string;
    final_exam: number;
    curriculum_standard: string;
    status: string;
    head_of_department_id: string;
    content_outline_table?: {
      planned_pacing: string;
      unit_definition: string;
      topic_definition: string;
    }[];
  }[];
  cbt_exams: CbtExam[];
}
