from flask import Blueprint, request, jsonify
from backend.services.recommendation_engine import RecommendationEngineService
from backend.services.revision_checker import RevisionCheckerService

audit_bp = Blueprint('audit', __name__)

revision_service = RevisionCheckerService()
recommender = RecommendationEngineService(revision_service)

@audit_bp.route('/api/audit-decision', methods=['POST'])
def record_decision():
    """
    POST /api/audit-decision
    Record human-in-the-loop verification decisions by authorized procurement officers.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        analysis_id = data.get("analysis_id", "ANL-GENERAL")
        standard_id = data.get("standard_id", "IS-RECOMMENDED")
        decision = data.get("decision", "ACCEPTED")
        officer_name = data.get("officer_name", "Er. Sachin Gupta")
        officer_role = data.get("officer_role", "Chief Procurement Verification Officer")
        remarks = data.get("remarks")

        entry = recommender.record_officer_decision(
            analysis_id=analysis_id,
            standard_id=standard_id,
            decision=decision,
            officer_name=officer_name,
            officer_role=officer_role,
            remarks=remarks
        )
        return jsonify(entry), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@audit_bp.route('/api/audit-history', methods=['GET'])
@audit_bp.route('/api/analysis-history', methods=['GET'])
def get_audit_history():
    """
    GET /api/audit-history & GET /api/analysis-history
    Retrieve the chronological audit trail of officer decisions.
    """
    try:
        logs = recommender.get_audit_history()
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
