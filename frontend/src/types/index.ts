export interface StandardRecord {
  id: string;
  is_number: string;
  base_number: string;
  title: string;
  category: string;
  status: 'Current' | 'Superseded' | 'Withdrawn' | 'Under Revision';
  current_edition_year: number;
  amendments: string[];
  superseded_by?: string | null;
  replaces?: string | null;
  revisions_timeline: number[];
  scope: string;
  applicable_products: string[];
  keywords: string[];
  technical_parameters: Record<string, any>;
  testing_methods: string[];
  mandatory_qco?: string | null;
  notes?: string | null;
}

export interface ExtractedSpecifications {
  detected_product: string;
  category: string;
  grade?: string | null;
  material?: string | null;
  dimensions?: string | null;
  testing_requirements: string[];
  raw_specifications: Record<string, any>;
  key_parameters: string[];
}

export interface DetectedStandardReference {
  raw_match: string;
  normalized_is: string;
  base_number: string;
  cited_year?: number | null;
  is_known_in_dataset: boolean;
  dataset_status?: string | null;
  latest_edition_year?: number | null;
  superseded_by?: string | null;
  discrepancy_type: 'VALID_CURRENT' | 'OUTDATED_REVISION' | 'WITHDRAWN_STANDARD' | 'MISMATCHED_PRODUCT' | 'NOT_IN_RESEARCH_DATASET';
  discrepancy_details: string;
}

export interface StandardRecommendation {
  standard_id: string;
  is_number: string;
  title: string;
  category: string;
  status: string;
  confidence_score: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW_REVIEW';
  is_direct_replacement: boolean;
  why_recommended_reasons: string[];
  why_rejected_reasons: string[];
  matching_parameters: Record<string, any>;
  mandatory_qco?: string | null;
  testing_methods: string[];
  scope_excerpt?: string | null;
}

export interface ParameterDiff {
  parameter: string;
  tender_requirement: string;
  standard_specification: string;
  status: 'MATCH' | 'UPGRADE_REQUIRED' | 'GAP_DETECTED';
  explanation: string;
}

export interface ComparisonDiffResult {
  tender_cited_standard?: string | null;
  recommended_standard: string;
  revision_gap_years?: number | null;
  key_differences: string[];
  parameter_diffs: ParameterDiff[];
  summary_advice: string;
}

export interface DocumentAnalysisResult {
  analysis_id: string;
  timestamp: string;
  document_name: string;
  tender_ref?: string | null;
  issuing_authority?: string | null;
  detected_product: string;
  detected_category: string;
  extracted_specifications: ExtractedSpecifications;
  referenced_standards: DetectedStandardReference[];
  primary_recommendation?: StandardRecommendation | null;
  alternative_recommendations: StandardRecommendation[];
  diff_comparison?: ComparisonDiffResult | null;
  overall_status: 'VALID' | 'REVIEW_REQUIRED' | 'OUTDATED_REFERENCE' | 'MISMATCH_DETECTED';
  overall_confidence: number;
  summary_verdict: string;
  disclaimer: string;
  officer_decision?: AuditLogEntry | null;
}

export interface AuditLogEntry {
  log_id: string;
  analysis_id: string;
  timestamp: string;
  officer_name: string;
  officer_role: string;
  document_name: string;
  tender_ref?: string | null;
  detected_product: string;
  cited_standard?: string | null;
  recommended_standard: string;
  decision: 'ACCEPTED' | 'FLAGGED_FOR_REVIEW' | 'REJECTED';
  remarks?: string | null;
  confidence_score: number;
}

export interface SampleTender {
  id: string;
  title: string;
  category: string;
  issuing_authority: string;
  tender_ref: string;
  text: string;
  expected_detected_product: string;
  expected_detected_is: string;
  expected_recommended_is: string;
  scenario_type: string;
  issue_summary: string;
}

export interface OfficerProfile {
  name: string;
  role: string;
  department: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'analyze'
  | 'recommendation'
  | 'standards'
  | 'comparison';


