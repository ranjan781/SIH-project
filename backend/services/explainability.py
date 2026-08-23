"""
Explainable AI (XAI) & Audit Service
Generates structured natural language explanations and logs procurement officer decisions.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.models.schemas import AuditLogEntry, OfficerDecisionRequest, DocumentAnalysisResult


class AuditAndExplainabilityService:
    def __init__(self):
        self.audit_logs: List[AuditLogEntry] = [
            AuditLogEntry(
                log_id="LOG-2024-001",
                analysis_id="ANL-DEMO-01",
                timestamp="2024-11-15T10:30:00Z",
                officer_name="R. K. Sharma (Superintending Engineer)",
                officer_role="Chief Procurement Officer",
                document_name="Tender_PWD_Bridges_TMT_2024.pdf",
                tender_ref="PWD/BR/2024/TMT-410",
                detected_product="TMT Reinforcement Steel Bars",
                cited_standard="IS 1786:2008",
                recommended_standard="IS 1786:2008",
                decision="ACCEPTED",
                remarks="Verified. Specifications Fe 500D accurately adhere to mandatory Steel QCO 2020.",
                confidence_score=0.96
            ),
            AuditLogEntry(
                log_id="LOG-2024-002",
                analysis_id="ANL-DEMO-02",
                timestamp="2024-11-16T14:15:00Z",
                officer_name="Ananya Verma (Joint Director)",
                officer_role="Procurement Verification Committee",
                document_name="Municipal_Playground_Equipment_Tender.docx",
                tender_ref="DUD/PARKS/2024/SW-092",
                detected_product="Children Playground Activity Toys",
                cited_standard="IS 9873 (Part 4): 2017",
                recommended_standard="IS 9873 (Part 4): 2019",
                decision="ACCEPTED",
                remarks="Accepted AI upgrade. Tender amendment issued to replace 2017 edition with 2019 edition.",
                confidence_score=0.94
            )
        ]

    def record_decision(self, req: OfficerDecisionRequest, analysis: DocumentAnalysisResult) -> AuditLogEntry:
        log_id = f"LOG-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        
        cited = analysis.referenced_standards[0].normalized_is if analysis.referenced_standards else "None"
        recommended = analysis.primary_recommendation.is_number if analysis.primary_recommendation else "None"
        conf = analysis.overall_confidence

        entry = AuditLogEntry(
            log_id=log_id,
            analysis_id=req.analysis_id,
            timestamp=datetime.utcnow().isoformat() + "Z",
            officer_name=req.officer_name,
            officer_role=req.officer_role or "Procurement Officer",
            document_name=analysis.document_name,
            tender_ref=analysis.tender_ref,
            detected_product=analysis.detected_product,
            cited_standard=cited,
            recommended_standard=recommended,
            decision=req.decision,
            remarks=req.remarks,
            confidence_score=conf
        )
        self.audit_logs.insert(0, entry)
        return entry

    def get_logs(self) -> List[AuditLogEntry]:
        return self.audit_logs

    def generate_xai_summary_card(self, analysis: DocumentAnalysisResult) -> Dict[str, Any]:
        """Structured XAI summary for UI display"""
        rec = analysis.primary_recommendation
        if not rec:
            return {
                "headline": "No direct Indian Standard identified in research dataset.",
                "confidence": 0.0,
                "pillars": []
            }

        pillars = [
            {
                "pillar": "Domain & Product Alignment",
                "status": "PASS",
                "detail": f"Matches product taxonomy under '{rec.category}'."
            },
            {
                "pillar": "Revision Lifecycle Verification",
                "status": "PASS" if rec.status == "Current" else "WARNING",
                "detail": f"Active standard with {len(rec.testing_methods)} testing standards linked."
            },
            {
                "pillar": "Quality Control Order (QCO)",
                "status": "INFO",
                "detail": rec.mandatory_qco or "Standard BIS certification guidelines apply."
            },
            {
                "pillar": "Confidence Breakdown",
                "status": "METRIC",
                "detail": f"{int(rec.confidence_score * 100)}% composite score ({rec.confidence_level})"
            }
        ]

        return {
            "headline": f"Recommended Standard: {rec.is_number} - {rec.title}",
            "confidence": rec.confidence_score,
            "confidence_level": rec.confidence_level,
            "pillars": pillars,
            "reasons": rec.why_recommended_reasons,
            "rejections": rec.why_rejected_reasons
        }


audit_service = AuditAndExplainabilityService()
