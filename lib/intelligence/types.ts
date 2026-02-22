/* Intelligence Hub Types */

// ── Enums ──────────────────────────────────────────────

export type GeoLevel = 'national' | 'state' | 'msa';
export type CodeType = 'statute' | 'admin_rule' | 'regulation';
export type StatuteStatus = 'active' | 'repealed' | 'amended' | 'pending';
export type InstitutionType = 'community_college' | 'technical_college' | '4yr_public' | '4yr_private';
export type CredentialLevel = 'certificate' | 'diploma' | 'associate' | 'bachelor';
export type CreditType = 'credit' | 'noncredit' | 'both';
export type DeliveryMode = 'in_person' | 'online' | 'hybrid';
export type CredentialType = 'license' | 'certification' | 'registration' | 'permit';
export type SourceType = 'government' | 'research' | 'news' | 'industry' | 'internal';
export type Reliability = 'official' | 'verified' | 'unverified';
export type DataType = 'text' | 'number' | 'date' | 'json' | 'url';
export type Confidence = 'confirmed' | 'estimated' | 'reported' | 'high' | 'medium' | 'low';
export type ReviewStatus = 'verified' | 'corrected' | 'flagged' | 'dismissed';
export type ClaimCategory = 'wage' | 'statute' | 'distance' | 'enrollment' | 'employer' | 'credential' | 'other';

// ── Table Types ────────────────────────────────────────

export interface IntelWage {
  id: string;
  soc_code: string;
  occupation_title: string;
  geo_level: GeoLevel;
  geo_code: string;
  geo_name: string;
  median_annual: number | null;
  mean_annual: number | null;
  pct_10: number | null;
  pct_25: number | null;
  pct_75: number | null;
  pct_90: number | null;
  employment: number | null;
  bls_release: string;
  source_url: string | null;
  last_verified: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelStatute {
  id: string;
  state: string;
  code_type: CodeType;
  code_chapter: string;
  code_section: string | null;
  title: string;
  summary: string | null;
  full_text: string | null;
  admin_code_ref: string | null;
  regulatory_body: string | null;
  status: StatuteStatus;
  effective_date: string | null;
  repeal_date: string | null;
  superseded_by: string | null;
  source_url: string | null;
  source_pdf_path: string | null;
  category: string | null;
  tags: string[];
  last_verified: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelInstitution {
  id: string;
  ipeds_id: string | null;
  name: string;
  short_name: string | null;
  state: string;
  city: string | null;
  county: string | null;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  type: InstitutionType;
  system_name: string | null;
  accreditor: string | null;
  website: string | null;
  service_area_counties: string[];
  service_area_population: number | null;
  total_enrollment: number | null;
  credit_enrollment: number | null;
  noncredit_enrollment: number | null;
  program_count: number | null;
  annual_operating_budget: number | null;
  tuition_in_district: number | null;
  tuition_in_state: number | null;
  carnegie_class: string | null;
  hsi_designation: boolean;
  msi_designation: boolean;
  rural_serving: boolean;
  ipeds_year: string | null;
  source_url: string | null;
  last_verified: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelInstitutionProgram {
  id: string;
  institution_id: string;
  program_name: string;
  cip_code: string | null;
  credential_level: CredentialLevel | null;
  credit_type: CreditType | null;
  clock_hours: number | null;
  credit_hours: number | null;
  tuition: number | null;
  delivery_mode: DeliveryMode | null;
  active: boolean;
  accreditation: string | null;
  licensure_alignment: string | null;
  source: string | null;
  source_url: string | null;
  last_verified: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelInstitutionCustom {
  id: string;
  institution_id: string;
  data_category: string;
  data_key: string;
  data_value: string | null;
  data_type: DataType;
  source: string | null;
  source_url: string | null;
  file_path: string | null;
  confidence: Confidence;
  effective_date: string | null;
  expiration_date: string | null;
  last_verified: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelCredential {
  id: string;
  state: string;
  credential_name: string;
  credential_type: CredentialType;
  required_hours: number | null;
  hour_type: string | null;
  education_requirement: string | null;
  exam_required: boolean;
  exam_name: string | null;
  regulatory_body: string | null;
  statute_id: string | null;
  renewal_period_years: number | null;
  ce_hours_required: number | null;
  reciprocity_notes: string | null;
  soc_codes: string[];
  source_url: string | null;
  last_verified: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelEmployer {
  id: string;
  employer_name: string;
  state: string | null;
  city: string | null;
  msa: string | null;
  naics_code: string | null;
  industry: string | null;
  estimated_employees: number | null;
  employee_count_source: string | null;
  employee_count_year: number | null;
  is_hiring: boolean;
  key_occupations: string[];
  recent_investments: string | null;
  partnership_potential: string | null;
  source_url: string | null;
  last_verified: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelDistance {
  id: string;
  from_institution_id: string;
  to_institution_id: string;
  driving_miles: number | null;
  driving_minutes: number | null;
  source: string;
  computed_at: string;
}

export interface IntelSource {
  id: string;
  source_type: SourceType;
  title: string;
  publisher: string | null;
  url: string | null;
  published_date: string | null;
  summary: string | null;
  full_text: string | null;
  file_path: string | null;
  states: string[];
  topics: string[];
  institution_ids: string[];
  soc_codes: string[];
  reliability: Reliability;
  last_verified: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelReviewItem {
  id: string;
  report_id: string | null;
  report_name: string | null;
  claim_text: string;
  claim_category: ClaimCategory;
  verification_status: ReviewStatus;
  verified_value: string | null;
  matched_record_id: string | null;
  matched_table: string | null;
  agent_source: string | null;
  web_source: string | null;
  confidence: Confidence;
  reviewed_by: string | null;
  reviewed_at: string | null;
  added_to_db: boolean;
  notes: string | null;
  created_at: string;
}

// ── Input Types ────────────────────────────────────────

export type IntelWageInput = Omit<IntelWage, 'id' | 'created_at' | 'updated_at'>;
export type IntelStatuteInput = Omit<IntelStatute, 'id' | 'created_at' | 'updated_at'>;
export type IntelInstitutionInput = Omit<IntelInstitution, 'id' | 'created_at' | 'updated_at'>;
export type IntelInstitutionProgramInput = Omit<IntelInstitutionProgram, 'id' | 'created_at' | 'updated_at'>;
export type IntelInstitutionCustomInput = Omit<IntelInstitutionCustom, 'id' | 'created_at' | 'updated_at'>;
export type IntelCredentialInput = Omit<IntelCredential, 'id' | 'created_at' | 'updated_at'>;
export type IntelEmployerInput = Omit<IntelEmployer, 'id' | 'created_at' | 'updated_at'>;
export type IntelSourceInput = Omit<IntelSource, 'id' | 'created_at' | 'updated_at'>;

// ── Dashboard Stats ────────────────────────────────────

export interface IntelDashboardStats {
  wages: { count: number; verified_pct: number };
  statutes: { count: number; verified_pct: number };
  institutions: { count: number; verified_pct: number };
  sources: { count: number; verified_pct: number };
  credentials: { count: number; verified_pct: number };
  employers: { count: number; verified_pct: number };
  distances: { count: number };
  review_queue: { flagged: number; total: number };
}

// ── Query Filters ──────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  q?: string;
}

export interface WageFilters extends PaginationParams {
  soc_code?: string;
  state?: string;
  geo_level?: GeoLevel;
}

export interface StatuteFilters extends PaginationParams {
  state?: string;
  category?: string;
  status?: StatuteStatus;
}

export interface InstitutionFilters extends PaginationParams {
  state?: string;
  type?: InstitutionType;
  system_name?: string;
}

export interface CredentialFilters extends PaginationParams {
  state?: string;
  credential_type?: CredentialType;
}

export interface EmployerFilters extends PaginationParams {
  state?: string;
  msa?: string;
  industry?: string;
}

export interface SourceFilters extends PaginationParams {
  source_type?: SourceType;
  state?: string;
  topic?: string;
}

export interface ReviewFilters extends PaginationParams {
  status?: ReviewStatus;
  category?: ClaimCategory;
}
