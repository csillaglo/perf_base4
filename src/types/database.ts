export type UserRole = 'superadmin' | 'company_admin' | 'manager' | 'hr_admin' | 'employee';
export type UserStatus = 'active' | 'inactive';

export type EvaluationStatus = 
  | 'awaiting_goal_setting'
  | 'awaiting_evaluation'
  | 'awaiting_approval'
  | 'finalized';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  organization_id: string | null;
  department: string | null;
  job_level: string | null;
  job_name: string | null;
  department_id: string | null;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvaluationCycle {
  id: string;
  name: string;
  organization_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  cycle_id: string | null;
  department_id: string | null;
  is_team_goal: boolean;
  progress: number;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  weight: number;
  evaluation_score: number;
  evaluation_status: EvaluationStatus;
}

export interface PerformanceMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value: number;
  notes: string | null;
  recorded_by: string;
  recorded_at: string;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceGrade {
  id: string;
  organization_id: string | null;
  min_score: number;
  max_score: number;
  grade_text: string;
  grade_level: number;
  created_at: string;
  updated_at: string;
}