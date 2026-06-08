import { ApiDeleteResponse, ApiListResponse } from "../shared-types";

export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary"
  | "internship"
  | "freelance"
  | "permanent";

// export type JobCategory =
//   | "Technology"
//   | "Healthcare"
//   | "Finance"
//   | "Marketing"
//   | "Education"
//   | "Engineering"
//   | "Sales"
//   | "Remote Jobs";

export type JobStatus = "active" | "expired" | "draft" | "paused" | "closed";

export type Job = {
  id: string;
  creator_id: string;
  updated_by_id: string;
  school_id: string;
  title: string;
  category: string;
  employment_type: JobType;
  expiry_date: string | null;
  summary: string;
  description: string;
  requirements: string;
  qualifications: string | null;
  salary_range: string;
  allowances: string | null;
  budget: number;
  status: JobStatus | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job_applications: any[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type UpdateJobPayload = {
  school_id: string;
  title?: string;
  category?: string;
  employmment_type?: JobType;
  expiry_date?: string;
  summary?: string;
  description?: string;
  requirements?: string;
  qualifications?: string;
  salary_range?: string;
  allowances?: string;
  budget?: number;
  status?: JobStatus;
};

export type CreateJobPayload = {
  school_id: string;
  title: string;
  category: string;
  employment_type: JobType;
  expiry_date?: string;
  summary: string;
  description: string;
  requirements: string;
  status: JobStatus;
  qualifications?: string;
  salary_range: string;
  allowances?: string;
  budget: number;
};

export interface JobsQueryParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
  school_id?: string;
}

export type JobsResponse = ApiListResponse<Job[]>;
export type JobResponse = ApiListResponse<Job>;
export type DeleteJobResponse = ApiDeleteResponse;
