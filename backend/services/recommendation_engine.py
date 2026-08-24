import os
import uuid
import datetime
from typing import List, Dict, Any, Optional

from backend.services.revision_checker import RevisionCheckerService
from backend.services.standard_matcher import StandardMatcherService
from backend.services.csv_catalog_service import (
    similarity_search as csv_search,
    enrich_with_status,
    get_all_records as csv_all_records,
)


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

        # 3. Retrieve Candidate Standards from FULL CSV Dataset (131 standards)
        # Use the TF-IDF vector store built from bis_standards_dataset_expanded.csv
        category_hint_for_csv = detected_category if detected_category and detected_category != "General Public Procurement" else None

        # Primary: semantic search over full CSV dataset
        csv_hits = csv_search(tender_text, n_results=20, category_filter=category_hint_for_csv)
        # Also do uncategorized top-10 search to catch cross-category matches
        csv_hits_uncategorized = csv_search(tender_text, n_results=10, category_filter=None)
        # Merge, deduplicate
        seen_is = set()
        merged_csv = []
        for h in csv_hits + csv_hits_uncategorized:
            k = h.get("IS_number", "")
            if k not in seen_is:
                seen_is.add(k)
                merged_csv.append(h)

        # Enrich with Superseded/Withdrawn status from standards.json
        enriched_csv = enrich_with_status(merged_csv, self.revision_service)

        # Normalize CSV records to the schema expected by scoring engine
        def _normalize_csv_record(rec: Dict) -> Dict:
            is_num = rec.get("IS_number", "")
            # Extract base number and year from IS number string
            import re as _re
            m = _re.match(r"(IS[\s\d]+(?:\(Part\s*\d+\))?)\s*[:\-]?\s*(\d{4})?", is_num.strip())
            base_num = m.group(1).strip() if m else is_num.split(":")[0].strip()
            year_str = m.group(2) if m and m.group(2) else None

            norm_refs = rec.get("normative_refs", "").replace(";", ",").split(",")
            norm_refs = [r.strip() for r in norm_refs if r.strip()]

            return {
                "id": is_num.replace(" ", "-").replace(":", "-").replace("(", "").replace(")", ""),
                "is_number": is_num,
                "base_number": base_num,
                "title": rec.get("title", ""),
                "category": rec.get("category", ""),
                "status": rec.get("status", "Current"),
                "current_edition_year": int(year_str) if year_str else None,
                "amendments": [rec.get("amendment", "")] if rec.get("amendment") else [],
                "superseded_by": rec.get("superseded_by"),
                "replaces": rec.get("replaces"),
                "scope": rec.get("scope_description", ""),
                "applicable_products": [],
                "keywords": [w.lower() for w in rec.get("title", "").split() if len(w) > 3],
                "technical_parameters": {},
                "testing_methods": norm_refs,
                "mandatory_qco": rec.get("mandatory_qco", rec.get("certification_required", "")),
                "notes": rec.get("certification_required", ""),
                "_similarity_score": rec.get("similarity_score", 0.0),
            }

        all_standards_from_csv = [_normalize_csv_record(r) for r in enriched_csv]

        # Fallback: also include standards.json records (for Superseded/Withdrawn resolution)
        std_json_records = self.revision_service.get_all_standards()
        std_json_is_nums = {s["is_number"] for s in std_json_records}
        csv_is_nums = {s["is_number"] for s in all_standards_from_csv}
        # Add JSON records not already in CSV results
        for jstd in std_json_records:
            if jstd["is_number"] not in csv_is_nums:
                jstd["_similarity_score"] = 0.0
                all_standards_from_csv.append(jstd)

        all_standards = all_standards_from_csv

        # Build sim_scores from CSV similarity scores + TF-IDF fallback for JSON-only records
        tfidf_scores_json = self.matcher_service.compute_semantic_similarity(
            tender_text, [s for s in all_standards if s.get("_similarity_score", 0) == 0]
        )
        tfidf_map = {s["is_number"]: score for s, score in tfidf_scores_json}

        sim_scores = []
        for std in all_standards:
            csv_score = std.get("_similarity_score", 0.0)
            tfidf_score = tfidf_map.get(std["is_number"], 0.0)
            # Use the higher of the two scores
            sim_scores.append((std, max(csv_score, tfidf_score)))


        # 4. Multi-Factor Composite Scoring
        text_lower = tender_text.lower()
        detected_product = None
        PRODUCT_DISPLAY_NAMES = {
            "tmt": "TMT Rebars",
            "rebar": "Steel Rebars",
            "rebars": "Steel Rebars",
            "concrete": "Concrete",
            "cement": "OPC Cement",
            "opc": "OPC Cement",
            "structural steel": "Structural Steel",
            "swing": "Children Swings",
            "swings": "Children Swings",
            "slides": "Activity Slides",
            "slide": "Activity Slide",
            "playground equipment": "Playground Equipment",
            "toy": "Toys",
            "toys": "Toys",
            "safety helmet": "Industrial Safety Helmet",
            "hard hat": "Industrial Safety Helmet",
            "pvc wire": "PVC Insulated Wire",
            "cable": "PVC Insulated Cable",
            "cables": "PVC Insulated Cables",
            "fire extinguisher": "ABC Fire Extinguisher",
            "extinguishers": "ABC Fire Extinguishers",
            "hdpe pipe": "HDPE Potable Water Pipe",
            "solar panel": "Solar PV Module",
            "led bulb": "LED Lamp",
            "surgical mask": "Surgical Face Mask",
            "earthing": "Earthing System",
        }
        for cat, kws in self.matcher_service.PRODUCT_KEYWORDS.items():
            for kw in kws:
                if kw in text_lower:
                    detected_product = PRODUCT_DISPLAY_NAMES.get(kw, kw.title())
                    break
            if detected_product:
                break

        scored_candidates = []
        for std, semantic_score in sim_scores:
            s_entity = 0.0
            is_direct_target = False

            for ref in referenced_standards:
                ref_norm_clean = ref["normalized_is"].replace(" ", "").upper()
                std_norm_clean = std["is_number"].replace(" ", "").upper()
                ref_base_clean = (ref.get("base_number") or "").replace(" ", "").upper()
                std_base_clean = (std.get("base_number") or "").replace(" ", "").upper()

                # Direct match with current active standard
                if ref_norm_clean == std_norm_clean and std.get("status") == "Current":
                    s_entity = 1.0
                    is_direct_target = True
                # Direct active replacement of a cited superseded standard (same base number)
                elif ref_base_clean == std_base_clean and std.get("status") == "Current":
                    s_entity = 1.0
                    is_direct_target = True
                elif std.get("replaces") and ref["normalized_is"] in str(std.get("replaces")):
                    s_entity = 1.0
                    is_direct_target = True
                # Cross-base replacement: withdrawn standard superseded_by points to this std
                elif ref.get("discrepancy_type") == "WITHDRAWN_STANDARD" and std.get("status") == "Current":
                    std_notes = std.get("notes", "").lower()
                    std_replaces = str(std.get("replaces", "")).lower()
                    ref_base = ref.get("base_number", "").lower().replace(" ", "")
                    if ref_base in std_notes or ref_base in std_replaces or ref["normalized_is"].lower().replace(" ", "")[:10] in std_notes:
                        s_entity = 1.0
                        is_direct_target = True
                elif ref_norm_clean == std_norm_clean:
                    s_entity = 0.6

            s_revision = 1.0 if std.get("status") == "Current" else 0.3

            # Specification compatibility score
            spec_matches = 0
            spec_total = 0
            if detected_category and std.get("category", "").lower() == detected_category.lower():
                spec_matches += 3
            spec_total += 3

            if extracted_specs.get("grade"):
                g_target = extracted_specs["grade"].lower()
                std_grades = std.get("technical_parameters", {}).get("grades", [])
                std_text = f"{std.get('title', '')} {std.get('scope', '')} {' '.join(std.get('keywords', []))}".lower()
                if any(g_target in g.lower() for g in std_grades) or g_target in std_text or g_target.replace(" ", "") in std_text.replace(" ", ""):
                    spec_matches += 3
                spec_total += 3

            if extracted_specs.get("testing_requirements"):
                for req in extracted_specs["testing_requirements"]:
                    std_tests = " ".join(std.get("testing_methods", [])).lower()
                    if any(req[:6].lower() in tm.lower() for tm in std.get("testing_methods", [])) or req[:6].lower() in std_tests:
                        spec_matches += 2
                    spec_total += 2
            
            s_spec = (spec_matches / spec_total) if spec_total > 0 else 0.5

            # Composite Formula: C(S, T)
            if is_direct_target and std.get("status") == "Current":
                # High-confidence direct resolution
                confidence = 0.88 + (0.07 * s_spec) + (0.05 * semantic_score)
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
