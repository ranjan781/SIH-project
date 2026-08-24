"""
catalog.py  –  /api/catalog/* endpoints
=========================================
Exposes the full BIS 131-standard CSV dataset via REST API.

Endpoints:
  GET  /api/catalog/search?q=cement&category=Cement+%26+Concrete&n=10
  GET  /api/catalog/stats
  POST /api/catalog/lookup     { "is_number": "IS 1786:2008" }
  GET  /api/catalog/categories
"""

from flask import Blueprint, request, jsonify
from backend.services.csv_catalog_service import (
    similarity_search,
    lookup_by_is_number,
    get_catalog_stats,
    get_all_records,
    enrich_with_status,
)
from backend.services.revision_checker import RevisionCheckerService

catalog_bp = Blueprint("catalog", __name__)
_revision_svc = RevisionCheckerService()


@catalog_bp.route("/api/catalog/search", methods=["GET"])
def catalog_search():
    """
    GET /api/catalog/search
    Query the full 131-standard BIS dataset using TF-IDF semantic search.

    Query params:
      q        : search query (IS number, product name, keyword, tender excerpt)
      category : optional category filter e.g. "Cement & Concrete"
      n        : number of results (default 10, max 30)
    """
    try:
        query = request.args.get("q", "").strip()
        category = request.args.get("category", "").strip() or None
        n = min(int(request.args.get("n", 10)), 30)

        if not query:
            # Return all records if no query
            records = get_all_records()
            if category:
                records = [r for r in records if r.get("category", "").lower() == category.lower()]
            records = records[:n]
        else:
            records = similarity_search(query, n_results=n, category_filter=category)

        enriched = enrich_with_status(records, _revision_svc)
        return jsonify(enriched), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@catalog_bp.route("/api/catalog/stats", methods=["GET"])
def catalog_stats():
    """
    GET /api/catalog/stats
    Returns total count and category breakdown of the full CSV dataset.
    """
    try:
        stats = get_catalog_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@catalog_bp.route("/api/catalog/lookup", methods=["POST"])
def catalog_lookup():
    """
    POST /api/catalog/lookup
    Direct IS number lookup in the full CSV dataset.

    Body: { "is_number": "IS 1786:2008" }
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        is_number = data.get("is_number", "").strip()

        if not is_number:
            return jsonify({"error": "No IS number provided"}), 400

        record = lookup_by_is_number(is_number)
        if not record:
            return jsonify({
                "found": False,
                "is_number": is_number,
                "message": f"Standard '{is_number}' not found in the BIS dataset. Try a different format e.g. 'IS 1786:2008'"
            }), 404

        enriched = enrich_with_status([record], _revision_svc)
        result = enriched[0]
        result["found"] = True
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@catalog_bp.route("/api/catalog/categories", methods=["GET"])
def catalog_categories():
    """
    GET /api/catalog/categories
    Returns list of all unique category names in the CSV dataset.
    """
    try:
        stats = get_catalog_stats()
        return jsonify({
            "categories": stats.get("categories", []),
            "category_distribution": stats.get("category_distribution", {})
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
