import { ResponseStatus } from "@/common/types";

export type SubjectListResponse = { data: Subject[] } & ResponseStatus;

export interface Subject {
  id: string;
  creator_id: string;
  updated_by_id: string | null;
  school_id: string | null;
  head_of_department_id: string | null;
  name: string;
  code: string | null;
  applicable_grade: string[];
  credit_units: number | null;
  continuous_assessment: number | null;
  final_exam: number | null;
  curriculum_standard: string | null;
  content_outline_table: ContentOutlineItem[];
  status: string | null;
  is_deleted: boolean;
  attachment_ids: string[];
  creator: {
    id: string | null;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  school: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  head_of_department?: { id: string; full_name: string; type: string } | null;
  resource:
    | {
        id: string;
        name: string;
        file_link: string;
        format: string;
        type: string;
        created_at: string;
      }[]
    | null;
  updated_by?: { first_name?: string; last_name?: string } | null;
}

export interface CreateSubjectsRequest {
  school_id: string;
  name: string;
  code?: string;
  applicable_grade?: string;
  head_of_department_id?: string | null;
  credit_units?: number;
  continuous_assessment?: number;
  final_exam?: number;
  curriculum_standard?: string;
  content_outline_table?: ContentOutlineItem[];
  status?: string;
}

export interface ContentOutlineItem {
  unit_definition: string;
  topic_definition: string;
  planned_pacing: string;
}

export interface UpdateSubjectPayload {
  school_id?: string;
  head_of_department_id?: string | null;
  name?: string;
  code?: string;
  applicable_grade?: string;
  credit_units?: number;
  continuous_assessment?: number;
  final_exam?: number;
  curriculum_standard?: string;
  content_outline_table?: ContentOutlineItem[];
  status?: "draft" | "vetted" | "approved" | string;
}
