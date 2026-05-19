import type { ApiListResponse, Roles } from "../shared-types";
import { School } from "../schools/schools-type";
import { User } from "../users/users-type";
import { Notes } from "../notes/note-types";
import { ApiResponse } from "../shared-types";
import { Notifications } from "../shared";

export interface StakeholderChildDetails {
  id: string;
  user_id: string;
  school_id?: string;
  user?: { first_name?: string; last_name?: string };
  class_assigned?: string | null;
}

export interface Stakeholders {
  id: string;
  user_id: string;
  creator_id: string;
  updated_by_id: string | null;
  school_id: string;
  primary_contact_id: string | null;
  emergency_contact_id: string | null;
  type: Roles;
  status: string;
  position: string | null;
  admission_number: string | null;

  school_fees: SchoolFees;
  hostel: Record<string, any>;
  hostel_details: any | null;
  transport: Record<string, any>;
  transport_details: any | null;
  subjects: string[];
  class_assigned: string | null;
  department: string | null;
  assigned_classes: string[];
  qualification: string | null;
  salary: string | null;
  business: string | null;
  services: string[];
  contracts: Contract[];
  grade: any[] | null;
  age: number | null;
  performance: any;
  bank: Record<string, any>;

  teaching_duty?: TeachingDuty | null;
  non_teaching_duty?: NonTeachingDuty | null;
  teaching_duty_details?: TeachingDutyDetails | null;
  non_teaching_duty_details?: NonTeachingDutyDetails | null;

  children?: Stakeholders[] | string[];
  children_details?: StakeholderChildDetails[];
  relationship_to_student: string | null;

  occupation: string | null;
  stage: number;
  stage_text: string;
  notifications: Notifications[];
  performance_highlights: any | null;
  common_exam_score: any | null;
  last_grade_completed: any | null;
  current_previous_school: any | null;
  transfer_reason: any | null;
  admin_notes: string | null;

  emergency_contact_and_phone: string | null;
  employment_type: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  annual_leave_entitlement: string | null;
  school_email: string | null;
  initial_status: string | null;
  parent_name: string | null;
  date_joined: string;
  is_deleted: boolean;
  user: User;
  creator: User;
  updated_by: User | null;
  school: School;
  primary_contact: Stakeholders | null;
  emergency_contact: Stakeholders | null;
  attachments: any[];
  notes: Notes[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface TeachingDuty {
  day: string;
  period: string;
  subject: string;
  classroom: string;
  created_at: string;
  creator_id: string;
  class_grade: string;
}

export interface TeachingDutyDetails extends TeachingDuty {
  creator: User;
}

export interface NonTeachingDuty {
  date: string;
  start_time: string;
  end_time: string;
  duty_type: string;
  created_at: string;
  creator_id: string;
}

export interface NonTeachingDutyDetails extends NonTeachingDuty {
  creator: User;
}

export interface CreateStakeholdersRequest {
  user_id: string;
  school_id: string;

  type: "student" | "teacher" | "parent" | "vendor" | string;
  status: "active" | "inactive" | "suspended";

  phone: string;

  // Staff / academic
  position?: string;
  subjects?: string[];
  class_assigned?: string;
  qualification?: string;
  salary?: number;

  // Vendor
  business?: string;
  services?: string[];
  contracts?: Contract[];

  // Student
  grade?: string;
  age?: number;
  performance?: Performance;
  admission_number?: string;
  school_fees?: SchoolFees;

  // Parent
  children?: string[];
  relationship_to_student?: string;
  occupation?: string;

  address?: string;
  date_joined: string;
}

export interface Contract {
  id: string;
  title: string;
  value: number;
  start_date: string;
  end_date: string;
  status: "active" | "inactive" | "completed";
}

export interface Performance {
  gpa: number;
  attendance: number; // percentage
}

export interface SchoolFees {
  paid: number;
  total: number;
  last_payment: string;
}

export type StakeholdersListResponse = ApiListResponse<Stakeholders>;

export interface AssignDutyStakeholder {
  stakeholder_id: "01kaphp565xbxb5vtdrm2js2ps";
  type: "teaching" | "non teaching"; // teaching, non teaching
  date: string;
  class_grade: "SSS 3";
  subject: string;
  period: string;
  classroom: "Test Classroom";
  duty_type: string;
  start_time: string;
  end_time: string;
}

export interface UpdateStakeholdersRequest {
  user_id?: string;
  school_id?: string;
  guardian_id?: string;
  admission_number?: string;
  school_fees?: {
    paid: number;
    total: number;
    last_payment: string;
  };
  stage?: number;
  status?: string;
  [key: string]: any; // Allow other fields for partial updates
}

export interface StakeholderMetrics {
  total: number;
  inquiries: number;
  applicationStarted: number;
  submittedForms: number;
  underReview: number;
  acceptedOffers: number;
  enrolled: number;
}

export interface StudentStakeholderMetrics {
  total: number;
  enrolled: number;
  totalStudents: number;
  genderRatio: {
    totalMale: number;
    totalFemale: number;
  };
}

export type AllStudentStakeholdersResponse = ApiListResponse<Stakeholders>;

export interface StudentStakeholderListResponseWithMetrics extends ApiListResponse<Stakeholders> {
  metrics: StudentStakeholderMetrics;
}

export interface StakeholderListResponseWithMetrics extends ApiListResponse<Stakeholders> {
  metrics: StakeholderMetrics;
}

export interface StudentMetrics {
  total_enrollment: number;
  new_enrollment: number;
  gender_ratio: {
    male: number;
    female: number;
    total: number;
  };
  student_to_class_average: number;
  absences: {
    students_with_absences: number;
    period_days: number;
  };
  academic_at_risk: {
    count: number;
    threshold: number;
    session: string;
  };
  unpaid_fees: {
    students_count: number;
    total_amount: number;
    percentage: number;
  };
}
