import { ResponseStatus } from "@/common/types";
import { School } from "../schools/schools-type";
import { Question } from "@/components/dashboard-pages/teacher/my-courses/views/content-builder";
import { User } from "../users/users-type";

export type CBTExamsResponse = { data: [] } & ResponseStatus;

/** Exam as returned by list/detail API (relation serializer) */
export interface CbtExam {
  id: string;
  creator_id: string;
  updated_by_id: string | null;
  user_id: string | null;
  school_id: string | null;
  title: string | null;
  category: string | null;
  subject: string | null;
  questions: Question[];
  duration: number;
  total_questions: number;
  completed: boolean;
  assessment_name: string | null;
  assessment_type: string | null;
  applicable_grades: string | null;
  applicable_subjects: string | null;
  applicable_subjects_ids: string[];
  question_ids: string[];
  total_marks_available: number;
  type: string | null;
  schedule_date: string;
  schedule_time: string;
  location_venue: string | null;
  assigned_invigilators_ids: string[];
  paper_submission_time: string | null;
  paper_submission_date: string | null;
  score_submission_date: string | null;
  score_submission_time: string | null;
  final_grade: string | null;
  scale_type: string | null;
  question_shuffle: boolean;
  answer_shuffle: boolean;
  partial_credit: boolean;
  max_attempt: number | null;
  display_result: string | null;
  is_deleted: boolean;
  status: null;
  creator: User;
  updated_by: string | null;
  user: string | null;
  school: School;
  assigned_invigilators_details: any[];
  applicable_subjects_details: any[];
  questions_details: any[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CbtExamsQueryParams {
  _all?: boolean;
  page?: number;
  limit?: number;
}

export interface CbtQuestion {
  question: string;
  answer_options: string[];
  explanation: string; //answer explanation
  subject: string;
  correct_answer: number;
  topic_covered: number;
  question_type_covered?: number;
  type: "multiple_choice" | "true/false" | "fill_in_the_blank";
  category?: string; //e.g general
  status?: "active" | "inactive";
  // tag: string // nigeria
  instruction: string;
  term?: string;
}

export type QuestionStatus = "approved" | "draft" | "pending" | "rejected";

export interface CreateCBTExamsPayload {
  school_id: string;
  title: string;
  category: string;
  subject: string;
  /** Optional fields supported by backend */
  duration?: number;
  questions?: CbtQuestion[];
  assessment_type?: string;
  total_questions?: number;
  total_marks_available?: number;
  applicable_grades?: string;
  applicable_subjects_ids?: string[];
  applicable_subjects?: string;
  type?: string; //test || exam
  schedule_date?: string;
  schedule_time?: string;
  max_attempt?: number;
  display_result?: string;
  question_shuffle?: boolean;
  status?: QuestionStatus;
  answer_shuffle?: boolean;
  partial_credit?: boolean;
  question_ids?: string[];
  location_venue?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number; // index of the correct option
  category: string;
  subject: string;

  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;

  answer: string; // e.g., "B"
  image?: string | null;
}

export interface AssessmentPayload {
  user_id: string;
  school_id: string;

  title: string;
  category: string;
  subject: string;

  questions: AssessmentQuestion[];

  duration: number; // in minutes
  total_questions: number;
  completed: boolean;

  assessment_name: string;
  assessment_type: string;

  applicable_grades: string; // comma-separated
  applicable_subjects: string; // comma-separated
  applicable_subjects_ids: string[];

  total_marks_available: number;

  type: "general" | "personal" | "others" | string;

  schedule_date: string; // YYYY-MM-DD
  schedule_time: string; // HH:mm
  location_venue: string;

  assigned_invigilators_ids: string[];
  question_ids: string[];

  paper_submission_date: string; // YYYY-MM-DD
  paper_submission_time: string; // HH:mm
  score_submission_date: string; // YYYY-MM-DD
  score_submission_time: string; // HH:mm

  final_grade: number;
  scale_type: string;

  question_shuffle: boolean;
  answer_shuffle: boolean;
  partial_credit: boolean;
  max_attempt: number;
  display_result: string;

  status: "draft" | "vetted" | "approved" | string;
}
