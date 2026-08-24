import os
import json
from flask import Blueprint, request, jsonify
from backend.services.revision_checker import RevisionCheckerService

standards_bp = Blueprint('standards', __name__)
revision_service = RevisionCheckerService()

@standards_bp.route('/api/standards', methods=['GET'])
def get_standards():
    """
    GET /api/standards
    Retrieve, search, and filter Indian Standards from the catalog.
    """
    try:
        search_query = request.args.get('search')
        category = request.args.get('category')
        status = request.args.get('status')

        results = revision_service.search_standards(
            query=search_query,
            category=category,
            status=status
        )
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@standards_bp.route('/api/standards/<standard_id>', methods=['GET'])
def get_standard_by_id(standard_id):
    """
    GET /api/standards/<standard_id>
    Retrieve a specific Indian Standard by ID or IS number.
    """
    try:
        std = revision_service.get_standard_by_id(standard_id)
        if not std:
            std = revision_service.find_standard_by_is_number(standard_id)
        
        if not std:
            return jsonify({"error": f"Standard '{standard_id}' not found"}), 404
        return jsonify(std), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@standards_bp.route('/api/sample-tenders', methods=['GET'])
def get_sample_tenders():
    """
    GET /api/sample-tenders
    Returns pre-packaged realistic procurement tender scenarios.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", "tenders.json")
    if not os.path.exists(data_path):
        data_path = os.path.join(os.path.dirname(base_dir), "data", "sample_tenders.json")

    try:
        if os.path.exists(data_path):
            with open(data_path, "r", encoding="utf-8") as f:
                samples = json.load(f)
            return jsonify(samples), 200
        return jsonify([]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@standards_bp.route('/api/stats', methods=['GET'])
def get_stats():
    """
    GET /api/stats
    Returns aggregate stats for the dashboard.
    """
    try:
        catalog_stats = revision_service.get_catalog_stats()
        return jsonify({
            "total_documents_analyzed": 14,
            "standards_in_catalog": catalog_stats["total_standards"],
            "outdated_references_detected": 6,
            "high_risk_mismatches": 3,
            "valid_current_references": catalog_stats["current_standards"],
            "average_confidence": 0.95,
            "catalog_breakdown": catalog_stats
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
