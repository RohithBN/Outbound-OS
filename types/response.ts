import { ObjectiveType } from "@/models/enums";

export interface ParsedCriteria {
  role?: string;
  location?: string;
  experience?: string;
  skills?: string[];
  company_size?: string;
  industry?: string;
  [key: string]: unknown;
}

export interface GeminiGoalCreationResponse {
  objective_type: ObjectiveType;
  target_count: number;
  current_count: number;
  parsed_criteria: ParsedCriteria;
  timeline_days: number;
  deadline: Date;
  success_metric: string;
  confidence_score: number;
  interpretation_notes?: string;
  salary_range?:string
}