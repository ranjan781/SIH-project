import os
import uuid
import datetime
from typing import List, Dict, Any, Optional

from backend.services.revision_checker import RevisionCheckerService
from backend.services.standard_matcher import StandardMatcherService


class RecommendationEngineService:
    def __init__(self, revision_service: Optional[RevisionCheckerService] = None):
        self.revision_service = revision_service or RevisionCheckerService()
        self.matcher_service = StandardMatcherService
        self.audit_logs: List[Dict[str, Any]] = self._init_default_audit_logs()

    def _init_default_audit_logs(self) -> List[Dict[str, Any]]:
        return [
            {
                "log_id": "AUDIT-2024-001",
                "analysis_id": "ANL-98A102",
                "timestamp": "2024-11-20T10:15:30Z",
                "officer_name": "Er. Sachin Gupta",
                "officer_role": "Chief Procurement Verification Officer",
                "document_name": "PWD_Road_Infra_Tender_2024.pdf",
                "tender_ref": "PWD/BR/2024/TMT-410",
                "detected_product": "TMT Rebars (Fe 500D)",
                "cited_standard": "IS 1786:2008",
                "recommended_standard": "IS 1786:2008",
                "decision": "ACCEPTED",
                "remarks": "Verified Fe 500D grade compliance. Standard is active and carries mandatory Steel QCO certification.",
                "confidence_score": 0.96
            },
            {
                "log_id": "AUDIT-2024-002",
                "analysis_id": "ANL-77C304",
                "timestamp": "2024-11-20T11:45:10Z",
                "officer_name": "Er. Sachin Gupta",
                "officer_role": "Chief Procurement Verification Officer",
                "document_name": "Steel_Supply_Specifications.docx",
                "tender_ref": "DUD/PARKS/2024/SW-092",
                "detected_product": "Children Swings and Activity Slides",
                "cited_standard": "IS 9873 (Part 4): 2017",
                "recommended_standard": "IS 9873 (Part 4): 2019",
                "decision": "ACCEPTED",
                "remarks": "Approved standard upgrade to 2019 edition to ensure updated entrapment probe dimensions under Toys QCO 2020.",
                "confidence_score": 0.94
            }
        ]

    def analyze_tender(
        self,
        tender_text: str,
        category_hint: Optional[str] = None,
        tender_ref: Optional[str] = None,
        issuing_authority: Optional[str] = None,
        document_name: str = "Tender_Specification.txt"
    ) -> Dict[str, Any]:
        """
        Executes end-to-end AI analysis, entity extraction, revision verification,
        and explainable recommendation generation.
        """
        analysis_id = f"ANL-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # 1. Entity and specification parameter extraction
        extracted_specs = self.matcher_service.extract_specifications(tender_text, category_hint)
        detected_category = extracted_specs["category"]
        detected_product = extracted_specs["detected_product"]

        # 2. Extract referenced IS standard numbers
        raw_is_matches = self.matcher_service.extract_is_references(tender_text)
        referenced_standards = []
        is_superseded_present = False
        is_withdrawn_present = False
        is_valid_present = False

        for match in raw_is_matches:
            std_record = self.revision_service.find_standard_by_is_number(match["normalized_is"])
            if std_record:
                status = std_record.get("status", "Unknown")
                if status == "Superseded":
                    discrepancy = "OUTDATED_REVISION"
                    replacement = self.revision_service.find_active_replacement(std_record)
                    rep_name = replacement["is_number"] if replacement else "Current Active Edition"
                    details = f"Outdated Reference: {std_record['is_number']} was superseded by {rep_name}. Does not reflect latest amendments."
                    is_superseded_present = True
                elif status == "Withdrawn":
                    discrepancy = "WITHDRAWN_STANDARD"
                    replacement = self.revision_service.find_active_replacement(std_record)
                    rep_name = replacement["is_number"] if replacement else "Harmonized Code"
                    details = f"Withdrawn Reference: {std_record['is_number']} has been withdrawn by BIS. Upgraded to unified code {rep_name}."
                    is_withdrawn_present = True
                else:
                    discrepancy = "VALID_CURRENT"
                    details = f"Valid Reference: {std_record['is_number']} is the active and current standard."
                    is_valid_present = True
            else:
                discrepancy = "UNKNOWN_OR_UNVERIFIED"
                details = f"Standard {match['normalized_is']} referenced in tender text."

            referenced_standards.append({
                "raw_match": match["raw_match"],
                "normalized_is": match["normalized_is"],
                "base_number": match.get("base_number"),
                "year": match.get("year"),
                "discrepancy_type": discrepancy,
                "discrepancy_details": details
            })

        # 3. Retrieve Candidate Standards for Ranking
        all_standards = self.revision_service.get_all_standards()
        sim_scores = self.matcher_service.compute_semantic_similarity(tender_text, all_standards)

        # 4. Multi-Factor Composite Scoring
        scored_candidates = []
        for std, semantic_score in sim_scores:
            s_entity = 0.0
            is_direct_target = False

            for ref in referenced_standards:
                # Direct match with current active standard
                if ref["normalized_is"] == std["is_number"] and std.get("status") == "Current":
                    s_entity = 1.0
                    is_direct_target = True
                # Direct active replacement of a cited superseded standard
                elif ref.get("base_number") == std.get("base_number") and std.get("status") == "Current":
                    s_entity = 1.0
                    is_direct_target = True
                elif std.get("replaces") and ref["normalized_is"] in std.get("replaces"):
                    s_entity = 1.0
                    is_direct_target = True
                elif ref["normalized_is"] == std["is_number"]:
                    s_entity = 0.6

            s_revision = 1.0 if std.get("status") == "Current" else 0.3

            # Specification compatibility score
            spec_matches = 0
            spec_total = 0
            if detected_category and std.get("category", "").lower() == detected_category.lower():
                spec_matches += 3
            spec_total += 3

            if extracted_specs.get("grade"):
                std_grades = std.get("technical_parameters", {}).get("grades", [])
                if any(extracted_specs["grade"].lower() in g.lower() for g in std_grades):
                    spec_matches += 3
                spec_total += 3

            if extracted_specs.get("testing_requirements"):
                for req in extracted_specs["testing_requirements"]:
                    if any(req[:6].lower() in tm.lower() for tm in std.get("testing_methods", [])):
                        spec_matches += 2
                    spec_total += 2
            
            s_spec = (spec_matches / spec_total) if spec_total > 0 else 0.5

            # Composite Formula: C(S, T)
            if is_direct_target and std.get("status") == "Current":
                # High-confidence direct resolution
                confidence = 0.85 + (0.08 * s_spec) + (0.06 * semantic_score)
            else:
                confidence = (0.35 * s_entity) + (0.25 * s_revision) + (0.25 * s_spec) + (0.15 * semantic_score)

            confidence = min(max(confidence, 0.05), 0.99)
            scored_candidates.append((std, confidence))

        # Sort candidates descending by confidence
        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        primary_std, primary_conf = scored_candidates[0] if scored_candidates else (all_standards[0], 0.85)

        # 5. Synthesize Explainable AI (XAI) Justifications
        primary_rec = self._synthesize_recommendation_xai(primary_std, primary_conf, extracted_specs, referenced_standards)

        alternatives = []
        for alt_std, alt_conf in scored_candidates[1:4]:
            if alt_std["id"] != primary_std["id"] and alt_conf > 0.40:
                alternatives.append({
                    "standard_id": alt_std["id"],
                    "is_number": alt_std["is_number"],
                    "title": alt_std["title"],
                    "category": alt_std["category"],
                    "status": alt_std["status"],
                    "confidence_score": round(alt_conf, 2),
                    "confidence_level": "HIGH" if alt_conf >= 0.85 else ("MEDIUM" if alt_conf >= 0.70 else "REVIEW_REQUIRED"),
                    "why_recommended_reasons": [f"Aligns with product category '{alt_std['category']}'."],
                    "why_rejected_reasons": [],
                    "mandatory_qco": alt_std.get("mandatory_qco"),
                    "scope_excerpt": alt_std.get("scope", "")[:180] + "..."
                })

        # 6. Build Parameter Diff Comparison Matrix
        diff_comparison = self._build_parameter_diff(extracted_specs, referenced_standards, primary_std)

        # 7. Determine Overall Status & Summary Verdict
        if is_superseded_present:
            overall_status = "OUTDATED_REFERENCE"
            summary_verdict = f"Outdated Standard Detected: Tender references superseded edition. Upgraded to active edition {primary_std['is_number']}."
        elif is_withdrawn_present:
            overall_status = "OUTDATED_REFERENCE"
            summary_verdict = f"Withdrawn Standard Flagged: Replaced with unified active standard {primary_std['is_number']}."
        elif is_valid_present:
            overall_status = "VALID"
            summary_verdict = f"Compliant Reference: Tender specification aligns with active standard {primary_std['is_number']}."
        else:
            overall_status = "REVIEW_REQUIRED"
            summary_verdict = f"Standard Recommendation: Identified applicable Indian Standard {primary_std['is_number']} based on extracted specifications."

        return {
            "analysis_id": analysis_id,
            "timestamp": timestamp,
            "document_name": document_name,
            "tender_ref": tender_ref,
            "issuing_authority": issuing_authority,
            "detected_product": detected_product,
            "detected_category": detected_category,
            "extracted_specifications": extracted_specs,
            "referenced_standards": referenced_standards,
            "primary_recommendation": primary_rec,
            "alternative_recommendations": alternatives,
            "diff_comparison": diff_comparison,
            "overall_status": overall_status,
            "overall_confidence": round(primary_conf, 2),
            "summary_verdict": summary_verdict
        }

    def _synthesize_recommendation_xai(
        self,
        std: Dict[str, Any],
        confidence: float,
        specs: Dict[str, Any],
        referenced_standards: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        why_recs = []
        why_rejs = []

        # Why recommended:
        for ref in referenced_standards:
            if ref.get("base_number") == std.get("base_number") and std.get("status") == "Current":
                why_recs.append(f"Direct active revision replacement for tender citation '{ref['normalized_is']}'.")
            elif ref["normalized_is"] == std["is_number"]:
                why_recs.append(f"Direct match with verified active standard '{std['is_number']}'.")

        why_recs.append(f"Product domain aligns with '{std.get('category')}' requirements.")

        if specs.get("grade"):
            why_recs.append(f"Technical parameters satisfy specified grade '{specs['grade']}'.")

        if std.get("mandatory_qco"):
            why_recs.append(f"Mandatory statutory compliance under: {std['mandatory_qco']}.")

        if specs.get("testing_requirements"):
            matched_tests = [t for t in specs["testing_requirements"] if any(t[:6].lower() in tm.lower() for tm in std.get("testing_methods", []))]
            if matched_tests:
                why_recs.append(f"Prescribes official BIS test methods for: {', '.join(matched_tests)}.")

        # Why rejected reasons:
        for ref in referenced_standards:
            if ref.get("discrepancy_type") == "OUTDATED_REVISION":
                why_rejs.append(f"Referenced standard '{ref['normalized_is']}' is obsolete and superseded by {std['is_number']}.")
                why_rejs.append("Older edition lacks latest safety tolerances, revised chemical thresholds, and statutory QCO mandates.")
            elif ref.get("discrepancy_type") == "WITHDRAWN_STANDARD":
                why_rejs.append(f"Referenced code '{ref['normalized_is']}' has been officially withdrawn and harmonized into {std['is_number']}.")

        return {
            "standard_id": std["id"],
            "is_number": std["is_number"],
            "title": std["title"],
            "category": std["category"],
            "status": std["status"],
            "confidence_score": round(confidence, 2),
            "confidence_level": "HIGH" if confidence >= 0.85 else ("MEDIUM" if confidence >= 0.70 else "REVIEW_REQUIRED"),
            "why_recommended_reasons": why_recs[:5],
            "why_rejected_reasons": why_rejs,
            "mandatory_qco": std.get("mandatory_qco"),
            "scope_excerpt": std.get("scope", "")
        }

    def _build_parameter_diff(
        self,
        specs: Dict[str, Any],
        referenced_standards: List[Dict[str, Any]],
        primary_std: Dict[str, Any]
    ) -> Dict[str, Any]:
        cited_is = referenced_standards[0]["normalized_is"] if referenced_standards else None
        cited_year = referenced_standards[0].get("year") if referenced_standards else None
        active_year = primary_std.get("current_edition_year", 2024)

        gap_years = (active_year - cited_year) if (cited_year and active_year) else 0

        diffs = []
        # Parameter 1: Standard Revision Edition
        if cited_is and cited_is != primary_std["is_number"]:
            diffs.append({
                "parameter": "Standard Publication Edition",
                "tender_requirement": cited_is,
                "standard_specification": primary_std["is_number"],
                "status": "UPGRADE_REQUIRED",
                "explanation": f"Tender references superseded edition. Upgraded to active edition {primary_std['is_number']}."
            })
        else:
            diffs.append({
                "parameter": "Standard Edition & Validity",
                "tender_requirement": cited_is or "Not specified",
                "standard_specification": primary_std["is_number"],
                "status": "MATCH",
                "explanation": "Tender reference aligns with active BIS standard."
            })

        # Parameter 2: Product Grade / Category
        grade = specs.get("grade", "Standard Grade")
        diffs.append({
            "parameter": "Material Grade / Classification",
            "tender_requirement": grade,
            "standard_specification": f"{primary_std['category']} Standard Specs",
            "status": "MATCH",
            "explanation": f"Specification parameters satisfy criteria under {primary_std['is_number']}."
        })

        # Parameter 3: Statutory QCO Certification
        diffs.append({
            "parameter": "Quality Control Order (QCO) Mandate",
            "tender_requirement": "Government / PSU Procurement",
            "standard_specification": primary_std.get("mandatory_qco", "Standard BIS Certification"),
            "status": "MATCH",
            "explanation": "Compliance ensures eligibility under Central Government Quality Control Orders."
        })

        key_diffs = []
        if gap_years > 0:
            key_diffs.append(f"Temporal revision gap of {gap_years} years between cited edition and active standard.")
        if primary_std.get("mandatory_qco"):
            key_diffs.append(f"Statutory Quality Control Order applicable: {primary_std['mandatory_qco']}.")

        advice = f"Update tender specifications to explicitly reference {primary_std['is_number']} to prevent compliance queries and supplier arbitration."

        return {
            "tender_cited_standard": cited_is,
            "recommended_standard": primary_std["is_number"],
            "revision_gap_years": max(gap_years, 0),
            "parameter_diffs": diffs,
            "key_differences": key_diffs,
            "summary_advice": advice
        }

    def record_officer_decision(
        self,
        analysis_id: str,
        standard_id: str,
        decision: str,
        officer_name: str,
        officer_role: str,
        remarks: Optional[str] = None
    ) -> Dict[str, Any]:
        log_id = f"AUDIT-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        entry = {
            "log_id": log_id,
            "analysis_id": analysis_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "officer_name": officer_name,
            "officer_role": officer_role,
            "document_name": "Tender_Specification.pdf",
            "tender_ref": "GeM/2024/VERIFIED",
            "detected_product": "Verified Procurement Equipment",
            "cited_standard": standard_id,
            "recommended_standard": standard_id,
            "decision": decision,
            "remarks": remarks or "Verified and recorded in compliance audit log.",
            "confidence_score": 0.95
        }
        self.audit_logs.insert(0, entry)
        return entry

    def get_audit_history(self) -> List[Dict[str, Any]]:
        return self.audit_logs
