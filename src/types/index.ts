export type UserRole = 'seeker' | 'employer' | 'admin'
export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'expired'
export type ApplicationStatus = 'applied' | 'viewed' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn'
export type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior' | 'lead'

export interface Profile {
  id: string
  email: string
  phone?: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  language_preference: string
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export interface SeekerProfile {
  id: string
  user_id: string
  headline?: string
  bio?: string
  skills?: string[]
  experience_years: number
  experience_level: ExperienceLevel
  current_location?: string
  location_lat?: number
  location_lng?: number
  preferred_job_types?: JobType[]
  expected_salary_min?: number
  expected_salary_max?: number
  resume_url?: string
  resume_filename?: string
  linkedin_url?: string
  portfolio_url?: string
  education?: Education[]
  experience?: WorkExperience[]
  profile_completion: number
  is_open_to_work: boolean
}

export interface Education {
  degree: string
  institution: string
  year_start: number
  year_end?: number
  is_current: boolean
  grade?: string
}

export interface WorkExperience {
  title: string
  company: string
  location?: string
  year_start: number
  month_start: number
  year_end?: number
  month_end?: number
  is_current: boolean
  description?: string
}

export interface Company {
  id: string
  owner_id: string
  name: string
  slug?: string
  description?: string
  logo_url?: string
  cover_url?: string
  industry?: string
  company_size?: string
  website?: string
  email?: string
  phone?: string
  city: string
  state: string
  is_verified: boolean
  created_at: string
}

export interface JobCategory {
  id: string
  name: string
  name_ta?: string
  slug: string
  icon?: string
  color?: string
  job_count: number
}

export interface Job {
  id: string
  company_id: string
  posted_by: string
  category_id?: string
  title: string
  title_ta?: string
  slug?: string
  description: string
  requirements?: string[]
  responsibilities?: string[]
  skills_required?: string[]
  job_type: JobType
  experience_level: ExperienceLevel
  experience_min?: number
  experience_max?: number
  salary_min?: number
  salary_max?: number
  salary_type?: string
  is_salary_disclosed: boolean
  location: string
  location_lat?: number
  location_lng?: number
  is_remote: boolean
  is_hybrid: boolean
  vacancies: number
  application_deadline?: string
  status: JobStatus
  views_count: number
  applications_count: number
  whatsapp_apply: boolean
  whatsapp_number?: string
  tags?: string[]
  benefits?: string[]
  is_featured: boolean
  is_urgent: boolean
  created_at: string
  expires_at: string
  company?: Company
  category?: JobCategory
  distance_km?: number
}

export interface Application {
  id: string
  job_id: string
  seeker_id: string
  company_id: string
  cover_letter?: string
  resume_url?: string
  status: ApplicationStatus
  status_updated_at: string
  employer_notes?: string
  is_seen_by_employer: boolean
  applied_via: string
  created_at: string
  job?: Job
  seeker?: Profile & { seeker_profile?: SeekerProfile }
}

export interface SearchFilters {
  query?: string
  location?: string
  lat?: number
  lng?: number
  radius?: number
  category?: string
  job_type?: JobType
  experience_level?: ExperienceLevel
  salary_min?: number
  salary_max?: number
  is_remote?: boolean
  is_fresher?: boolean
  sort?: 'newest' | 'salary_high' | 'salary_low' | 'nearest'
  page?: number
  limit?: number
}

export interface DashboardStats {
  total_jobs?: number
  total_applications?: number
  total_views?: number
  shortlisted?: number
  active_jobs?: number
  new_applications?: number
}
