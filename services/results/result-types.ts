import type { ApiResponse, ApiListResponse } from "../shared-types";
import { Stakeholders } from "../stakeholders/stakeholder-types";

export interface SubjectResult {
  id?: string;
  subject: string;
  class_score: number;
  exam_score: number;
  first_ca?: number;
  second_ca?: number;
  total_score: number;
  grade: string;
  remarks: string;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Result {
  id: string;
  creator_id: string;
  updated_by_id?: null | string;
  exam_id: string;
  term: string;
  session: string;
  class_name: string;
  grade: string;
  subject_results: SubjectResult[];
}

export interface ExamResult extends Result {
  student_id?: string;
  student?: Record<string, unknown>;
  school_id?: string;
  school?: Record<string, unknown>;
  total_score: number;
  average_score: number;
  position: number;
  teacher_remarks: string | null;
  principal_remarks: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateResultParams {
  student_id: string;
  exam_id?: string;
  term: string;
  session: string;
  class_name: string;
  grade: string;
  subject_results: Array<SubjectResult>;
  // subject_results: SubjectResult;
  total_score: number;
  average_score: number;
  position: number;
  teacher_remarks: string;
  principal_remarks: string;
}

export interface UpdateResultParams {
  student_id?: string;
  principal_remarks?: string;
}

export interface UpdateExamResultParams {
  id: string;
  principal_remarks?: string;
  student_id?: string;
  data?: Partial<UpdateResultParams>;
}

export interface ExamResultsQueryParams {
  _all?: boolean;
  [key: string]: string | boolean | number | undefined;
}

export type ExamResultsListResponse = ApiResponse<ExamResult[]>;

export interface DeleteResultParams {
  creator_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  birthday: string;
  gender: string;
  status: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  role: string;
  profile_image_url: string;
  profile_image_public_id: string;
  language_preference: string;
  theme: string;
  api_usage: number;
  model_preferences: string[];
  training_data: string[];
  personalization_settings: { height: string };
  two_factor_enabled: boolean;
  data_sharing_consent: boolean;
}

export interface RecordResultsParams {
  results: Array<{
    student_id: string;
    exam_id: string;
    term: string;
    session: string;
    class_name: string;
    grade: string;
    subject_results: SubjectResult[];
    total_score: number;
    average_score: number;
    position: number;
    teacher_remarks: string;
    principal_remarks: string;
  }>;
}

export interface GenerateReportPayload {
  school_id: string;
  class_name: string;
  term: string;
  session: string;
}

export interface PublishGradeReportsPayload {
  school_id: string;
  class_name: string;
  term: string;
  session: string;
  action: "publish";
}

//publish for specific students
export interface GetResultsParams {
  school_id: string;
  class_name: string;
  term: string;
  session: string;
}

export interface PublishStudentsResultPayload {
  school_id: string;
  class_name: string;
  term: string;
  session: string;
  action: "publish";
  student_ids: string[];
}

export interface UnpublishStudentResultPayload {
  school_id: string;
  class_name: string;
  term: string;
  session: string;
  action: "unpublish";
}

export interface GradeDistributionItem {
  label: string;
  grade: string;
  value: number;
  percentage: number;
}

export interface ResultMetrics {
  average_score: number;
  average_grade_letter: string;
  grade_distribution: GradeDistributionItem[];
  total_students: number;
}

// export type ResultResponse = ApiResponse<Result>;
export type ResultResponse = {
  data: { status: boolean; status_code: number; message: string; data: Result };
};

export type Report = {
  academic_grade: any | null;
  date_generated: string;
  id: string;
  report_status: "unpublished" | "published";
  student_id: string;
  student_name: string;
  time_generated: string;
};

type ReportData = {
  generated_reports: Report[];
  skipped_students: { id: string; message: string; name: string }[];
  total_generated: number;
  total_skipped: number;
};

export type ReportResponse = {
  status: boolean;
  status_code: number;
  message: string;
  data: ReportData;
};

export type PublishGradeReportResponse = {
  data: {
    action: string;
    total_updated: number;
    updated_reports: {
      id: string;
      published_at: string;
      report_status: string;
      student_name: string;
      unpublished_at: null;
    }[];
  };
  message: string;
  status: boolean;
  status_code: number;
};

export type ClassReport = {
  status: boolean;
  status_code: number;
  message: string;
  data: any;
};
