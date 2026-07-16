import { ResponseStatus } from "@/common/types";
import { School } from "../schools/schools-type";

export type CBTQuestionResponse = { data: [] } & ResponseStatus;

export type CBTQuestionStatus = "approved" | "pending" | "draft" | "rejected";

export interface CbtQuestion {
  id: string;
  question: string;
  answer_options: string[];
  correct_answer: number;
  explanation: string | null;
  subject: string;
  topic_covered?: number | null;
  type?: string | null;
  category?: string | null;
  tag?: string | null;
  creator_id?: string | null;
  creator?: {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  school_id: string;
  image: string | null;
  question_type_covered: number | null;
  status: CBTQuestionStatus | null;
  instruction: string | null;
  term: string | null;
  is_deleted: boolean;
  school: School;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CbtQuestionsQueryParams {
  _all?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateCBTQuestionPayload {
  school_id: string;
  question: string;
  subject: string;
  correct_answer: number;
  status: "approved" | "pending" | "draft" | "rejected";
  category: string;
  type: "multiple_choice" | "fill_in_the_blank" | "true/false";
  instruction: string;
  answer_options: string[];
  topic_covered: number;
  explanation: string;
  tag?: string;
  term: string;
}

export interface UpdateCBTQuestionPayload {
  school_id: string;
  question: string;
  subject: string;
  correct_answer: number;
  answer_options: string[];
  explanation: string;
}
