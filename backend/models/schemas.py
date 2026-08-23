"""
Pydantic Data Models and Schemas for IS Standard Advisor
Problem Statement: SIH26108
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class StandardRecord(BaseModel):
    id: str
    is_number: str
    base_number: str
    title: str
    category: str
    status: str  # "Current", "Superseded", "Withdrawn", "Under Revision"
    current_edition_year: int
    amendments: List[str] = []
    superseded_by: Optional[str] = None
    replaces: Optional[str] = None
    revisions_timeline: List[int] = []
    scope: str
    applicable_products: List[str] = []
    keywords: List[str] = []
    technical_parameters: Dict[str, Any] = {}
    testing_methods: List[str] = []
    mandatory_qco: Optional[str] = None
    notes: Optional[str] = None


class TenderTextRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Tender specification text")
    category_hint: Optional[str] = None
    tender_ref: Optional[str] = None
    issuing_authority: Optional[str] = None
    document_name: Optional[str] = "Pasted_Tender_Specification.txt"


class ExtractedSpecifications(BaseModel):
    detected_product: str
    category: str
    grade: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    testing_requirements: List[str] = []
    raw_specifications: Dict[str, Any] = {}
    key_parameters: List[str] = []


class DetectedStandardReference(BaseModel):
    raw_match: str
    normalized_is: str
    base_number: str
    cited_year: Optional[int] = None
    is_known_in_dataset: bool = False
    dataset_status: Optional[str] = None  # "Current", "Superseded", "Withdrawn", "Unknown"
    latest_edition_year: Optional[int] = None
    superseded_by: Optional[str] = None
    discrepancy_type: str  # "VALID_CURRENT", "OUTDATED_REVISION", "WITHDRAWN_STANDARD", "MISMATCHED_PRODUCT", "NOT_IN_RESEARCH_DATASET"
    discrepancy_details: str


class StandardRecommendation(BaseModel):
    standard_id: str
    is_number: str
    title: str
    category: str
    status: str
    confidence_score: float  # 0.0 - 1.0 (e.g. 0.94 -> 94%)
    confidence_level: str   # "HIGH" (90-100%), "MEDIUM" (70-89%), "LOW_REVIEW" (<70%)
    is_direct_replacement: bool = False
    why_recommended_reasons: List[str] = []
    why_rejected_reasons: List[str] = []
    matching_parameters: Dict[str, Any] = {}
    mandatory_qco: Optional[str] = None
    testing_methods: List[str] = []
    scope_excerpt: Optional[str] = None


class ParameterDiff(BaseModel):
    parameter: str
    tender_requirement: str
    standard_specification: str
    status: str  # "MATCH", "UPGRADE_REQUIRED", "GAP_DETECTED"
    explanation: str


class ComparisonDiffResult(BaseModel):
    tender_cited_standard: Optional[str] = None
    recommended_standard: str
    revision_gap_years: Optional[int] = None
    key_differences: List[str] = []
    parameter_diffs: List[ParameterDiff] = []
    summary_advice: str


class DocumentAnalysisResult(BaseModel):
    analysis_id: str
    timestamp: str
    document_name: str
    tender_ref: Optional[str] = None
    issuing_authority: Optional[str] = None
    detected_product: str
    detected_category: str
    extracted_specifications: ExtractedSpecifications
    referenced_standards: List[DetectedStandardReference]
    primary_recommendation: Optional[StandardRecommendation] = None
    alternative_recommendations: List[StandardRecommendation] = []
    diff_comparison: Optional[ComparisonDiffResult] = None
    overall_status: str  # "VALID", "REVIEW_REQUIRED", "OUTDATED_REFERENCE", "MISMATCH_DETECTED"
    overall_confidence: float
    summary_verdict: str
    disclaimer: str = "Research Prototype Demo. Always verify with official BIS Gazette/Manakonline before final procurement."


class OfficerDecisionRequest(BaseModel):
    analysis_id: str
    standard_id: str
    decision: str  # "ACCEPTED", "FLAGGED_FOR_REVIEW", "REJECTED"
    officer_name: str
    officer_role: Optional[str] = "Procurement Officer"
    remarks: Optional[str] = ""


class AuditLogEntry(BaseModel):
    log_id: str
    analysis_id: str
    timestamp: str
    officer_name: str
    officer_role: str
    document_name: str
    tender_ref: Optional[str]
    detected_product: str
    cited_standard: Optional[str]
    recommended_standard: str
    decision: str
    remarks: Optional[str]
    confidence_score: float


class StandardsQueryFilter(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
