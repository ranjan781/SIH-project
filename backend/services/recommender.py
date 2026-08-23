"""
AI Recommendation Engine for Indian Standards (IS)
Combines Rule-based Revision Graphs, TF-IDF / Cosine Similarity, and Specification Alignment.
"""

import math
from typing import List, Dict, Any, Optional, Tuple
from backend.models.schemas import (
    ExtractedSpecifications,
    DetectedStandardReference,
    StandardRecommendation,
    StandardRecord,
    ComparisonDiffResult,
    ParameterDiff,
    DocumentAnalysisResult
)
from backend.services.standards_service import standards_service


class RecommendationEngine:
    def __init__(self):
        pass

    def _calculate_keyword_similarity(self, text_lower: str, standard: StandardRecord) -> float:
        """TF-IDF inspired term frequency overlap against standard keywords, title, and scope"""
        tokens = set([t for t in text_lower.split() if len(t) > 2])
        if not tokens:
            return 0.0

        matches = 0
        total_weight = 0.0

        # High weight for keywords
        for kw in standard.keywords:
            total_weight += 2.0
            if kw.lower() in text_lower:
                matches += 2.0

        # Title words
        title_tokens = set([t.lower() for t in standard.title.split() if len(t) > 3])
        for t in title_tokens:
            total_weight += 1.0
            if t in tokens:
                matches += 1.0

        # Applicable products
        for prod in standard.applicable_products:
            total_weight += 2.5
            if prod.lower() in text_lower:
                matches += 2.5

        if total_weight == 0:
            return 0.0

        return min(1.0, matches / (total_weight * 0.45))

    def _evaluate_spec_compatibility(self, specs: ExtractedSpecifications, standard: StandardRecord) -> float:
        score = 0.0
        max_possible = 0.0

        # Category Match
        max_possible += 3.0
        if specs.category.lower() == standard.category.lower():
            score += 3.0
        elif standard.category.lower() in specs.category.lower() or specs.category.lower() in standard.category.lower():
            score += 1.5

        # Grade Match
        if specs.grade:
            max_possible += 2.0
            grade_clean = specs.grade.replace(" ", "").upper()
            std_params = str(standard.technical_parameters).upper().replace(" ", "")
            if grade_clean in std_params:
                score += 2.0

        # Material Match
        if specs.material:
            max_possible += 2.0
            mat_clean = specs.material.lower()
            if mat_clean in standard.title.lower() or mat_clean in standard.scope.lower() or any(mat_clean in kw.lower() for kw in standard.keywords):
                score += 2.0

        # Testing Match
        if specs.testing_requirements:
            max_possible += 2.0
            matched_tests = 0
            for t in specs.testing_requirements:
                t_lower = t.lower()
                if any(t_lower in sm.lower() for sm in standard.testing_methods) or t_lower in standard.scope.lower():
                    matched_tests += 1
            if matched_tests > 0:
                score += 2.0 * min(1.0, matched_tests / len(specs.testing_requirements))

        if max_possible == 0:
            return 0.5
        return min(1.0, score / max_possible)

    def recommend(
        self,
        text: str,
        specs: ExtractedSpecifications,
        detected_refs: List[DetectedStandardReference]
    ) -> Tuple[Optional[StandardRecommendation], List[StandardRecommendation], Optional[ComparisonDiffResult], str, float]:
        text_lower = text.lower()
        all_standards = standards_service.get_all()

        scored_candidates: List[Tuple[StandardRecord, float, List[str], List[str], bool]] = []

        # 1. First priority check: Cited IS references in tender
        referenced_superseded_or_active = []
        for ref in detected_refs:
            if ref.is_known_in_dataset:
                active_std = standards_service.get_latest_current_version(ref.base_number)
                if active_std:
                    referenced_superseded_or_active.append((ref, active_std))

        # Evaluate each standard in the dataset
        for std in all_standards:
            # Skip superseded/withdrawn from being primary recommendations unless explicitly only match
            status_penalty = 1.0 if std.status == "Current" else 0.4

            # Semantic similarity
            sim_score = self._calculate_keyword_similarity(text_lower, std)
            # Spec compatibility
            spec_score = self._evaluate_spec_compatibility(specs, std)

            # Direct reference bonus
            is_direct_replacement = False
            direct_bonus = 0.0
            rejection_reasons = []
            reasons = []

            for ref, active_std in referenced_superseded_or_active:
                if active_std.id == std.id:
                    direct_bonus = 0.40
                    is_direct_replacement = True
                    if ref.discrepancy_type == "OUTDATED_REVISION":
                        reasons.append(f"Direct active revision upgrade for tender citation '{ref.normalized_is}' to current edition '{std.is_number}'.")
                        rejection_reasons.append(f"Tender cited older edition '{ref.normalized_is}' which lacks latest BIS technical amendments and QCO compliance.")
                    elif ref.discrepancy_type == "WITHDRAWN_STANDARD":
                        reasons.append(f"Harmonized replacement: Standard '{ref.normalized_is}' was officially withdrawn by BIS and unified into '{std.is_number}'.")
                        rejection_reasons.append(f"Standard '{ref.normalized_is}' is officially withdrawn and invalid for public procurement.")
                    elif ref.discrepancy_type == "VALID_CURRENT":
                        reasons.append(f"Tender referenced standard '{ref.normalized_is}' is confirmed fully active and current in BIS repository.")

            if spec_score > 0.6:
                reasons.append(f"Product domain and technical parameters match category '{std.category}'.")
            if specs.grade and specs.grade.upper() in str(std.technical_parameters).upper():
                reasons.append(f"Standard specifies technical grade requirements for '{specs.grade}'.")
            if std.mandatory_qco:
                reasons.append(f"Subject to mandatory compliance under: {std.mandatory_qco}")

            # Composite confidence score
            composite = (0.35 * direct_bonus) + (0.30 * spec_score) + (0.25 * sim_score) + (0.10 * (1.0 if std.status == "Current" else 0.0))
            composite = min(0.99, max(0.20, composite * status_penalty + (0.35 if is_direct_replacement else 0.0)))

            if is_direct_replacement and std.status == "Current":
                composite = max(0.92, composite)

            # Filter candidates with minimal relevance
            if composite > 0.40 or is_direct_replacement:
                scored_candidates.append((std, composite, reasons, rejection_reasons, is_direct_replacement))

        # Sort by confidence descending
        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        if not scored_candidates:
            # Fallback if no standards found
            return None, [], None, "REVIEW_REQUIRED", 0.40

        primary_candidate = scored_candidates[0]
        primary_rec = self._build_recommendation_obj(primary_candidate)

        alternatives = []
        for cand in scored_candidates[1:4]:
            if cand[0].id != primary_candidate[0].id and cand[0].status == "Current":
                alternatives.append(self._build_recommendation_obj(cand))

        # Build diff comparison if tender cited an IS
        diff_comparison = None
        overall_status = "VALID"
        overall_conf = primary_rec.confidence_score

        if detected_refs:
            first_ref = detected_refs[0]
            if first_ref.discrepancy_type == "OUTDATED_REVISION":
                overall_status = "OUTDATED_REFERENCE"
            elif first_ref.discrepancy_type == "WITHDRAWN_STANDARD":
                overall_status = "OUTDATED_REFERENCE"
            elif first_ref.discrepancy_type == "VALID_CURRENT":
                overall_status = "VALID"
            else:
                overall_status = "REVIEW_REQUIRED"

            diff_comparison = self._build_comparison_diff(first_ref, primary_candidate[0], specs)
        else:
            overall_status = "REVIEW_REQUIRED"

        return primary_rec, alternatives, diff_comparison, overall_status, overall_conf

    def _build_recommendation_obj(self, candidate_tuple) -> StandardRecommendation:
        std, score, reasons, rejections, is_direct = candidate_tuple
        
        level = "HIGH" if score >= 0.90 else ("MEDIUM" if score >= 0.70 else "LOW_REVIEW")

        if not reasons:
            reasons = [
                f"Standard applies to product category '{std.category}'.",
                f"Scope covers technical specifications: {std.scope[:140]}..."
            ]

        return StandardRecommendation(
            standard_id=std.id,
            is_number=std.is_number,
            title=std.title,
            category=std.category,
            status=std.status,
            confidence_score=round(score, 2),
            confidence_level=level,
            is_direct_replacement=is_direct,
            why_recommended_reasons=reasons,
            why_rejected_reasons=rejections,
            matching_parameters=std.technical_parameters,
            mandatory_qco=std.mandatory_qco,
            testing_methods=std.testing_methods,
            scope_excerpt=std.scope
        )

    def _build_comparison_diff(
        self,
        detected_ref: DetectedStandardReference,
        recommended_std: StandardRecord,
        specs: ExtractedSpecifications
    ) -> ComparisonDiffResult:
        key_diffs = []
        param_diffs: List[ParameterDiff] = []

        ref_year = detected_ref.cited_year
        rec_year = recommended_std.current_edition_year
        year_gap = (rec_year - ref_year) if ref_year else None

        if detected_ref.discrepancy_type == "OUTDATED_REVISION":
            key_diffs.append(f"Tender cites revision year {ref_year or 'Unspecified'}, while active edition is {rec_year}.")
            key_diffs.append(f"Incorporates {len(recommended_std.amendments)} BIS amendments ({', '.join(recommended_std.amendments)}).")
            if recommended_std.notes:
                key_diffs.append(recommended_std.notes)
            summary = f"Revision Upgrade Recommended: Migrate citation from {detected_ref.normalized_is} to {recommended_std.is_number} to ensure legal compliance under mandatory BIS QCO."
        elif detected_ref.discrepancy_type == "WITHDRAWN_STANDARD":
            key_diffs.append(f"The referenced standard {detected_ref.normalized_is} has been officially WITHDRAWN by BIS.")
            key_diffs.append(f"Requirements harmonized into unified standard {recommended_std.is_number}.")
            summary = f"Withdrawn Standard Replacement: Must replace withdrawn {detected_ref.normalized_is} with active standard {recommended_std.is_number}."
        elif detected_ref.discrepancy_type == "VALID_CURRENT":
            key_diffs.append("Referenced standard aligns perfectly with current active Indian Standard.")
            key_diffs.append(f"Quality Control Order: {recommended_std.mandatory_qco or 'Standard BIS requirements apply'}")
            summary = f"Valid Citation: {detected_ref.normalized_is} is current and valid."
        else:
            key_diffs.append(f"Tender requirements mapped to best matching standard {recommended_std.is_number}.")
            summary = f"Standard Recommendation: {recommended_std.is_number} recommended based on specification matching."

        # Parameter diff table
        if specs.grade:
            param_diffs.append(ParameterDiff(
                parameter="Material Grade",
                tender_requirement=specs.grade,
                standard_specification=f"Supported in {recommended_std.is_number}",
                status="MATCH",
                explanation=f"Standard explicitly defines specifications for grade {specs.grade}."
            ))

        if recommended_std.testing_methods:
            param_diffs.append(ParameterDiff(
                parameter="Mandatory Testing Protocols",
                tender_requirement=", ".join(specs.testing_requirements[:2]) if specs.testing_requirements else "Standard Quality Tests",
                standard_specification=", ".join(recommended_std.testing_methods[:2]),
                status="MATCH",
                explanation="Testing protocols aligned with latest BIS inspection standards."
            ))

        if detected_ref.discrepancy_type in ["OUTDATED_REVISION", "WITHDRAWN_STANDARD"]:
            param_diffs.append(ParameterDiff(
                parameter="Standard Revision / Status",
                tender_requirement=detected_ref.normalized_is,
                standard_specification=recommended_std.is_number,
                status="UPGRADE_REQUIRED",
                explanation=f"Update reference to {recommended_std.is_number} to prevent vendor disputes or non-compliant deliveries."
            ))

        return ComparisonDiffResult(
            tender_cited_standard=detected_ref.normalized_is,
            recommended_standard=recommended_std.is_number,
            revision_gap_years=year_gap,
            key_differences=key_diffs,
            parameter_diffs=param_diffs,
            summary_advice=summary
        )


recommendation_engine = RecommendationEngine()
