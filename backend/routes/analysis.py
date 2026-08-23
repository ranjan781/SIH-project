import os
from flask import Blueprint, request, jsonify
from backend.services.document_parser import DocumentParserService
from backend.services.recommendation_engine import RecommendationEngineService
from backend.services.revision_checker import RevisionCheckerService

analysis_bp = Blueprint('analysis', __name__)

revision_service = RevisionCheckerService()
recommender = RecommendationEngineService(revision_service)

@analysis_bp.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    """
    POST /api/analyze-text
    Analyzes raw text or clauses from procurement specifications.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        text = data.get("text", "").strip()
        if not text:
            return jsonify({"error": "No text provided for analysis"}), 400

        category_hint = data.get("category_hint")
        tender_ref = data.get("tender_ref")
        issuing_authority = data.get("issuing_authority")
        doc_name = data.get("document_name", "Tender_Specification.txt")

        result = recommender.analyze_tender(
            tender_text=text,
            category_hint=category_hint,
            tender_ref=tender_ref,
            issuing_authority=issuing_authority,
            document_name=doc_name
        )
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Failed to analyze tender text: {str(e)}"}), 500


@analysis_bp.route('/api/analyze-document', methods=['POST'])
def analyze_document():
    """
    POST /api/analyze-document
    Handles multipart file upload (.pdf, .docx, .txt) using Flask request.files and Werkzeug.
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected for upload"}), 400

        if not DocumentParserService.is_allowed_file(file.filename):
            return jsonify({"error": "Unsupported file format. Supported formats: .pdf, .docx, .txt"}), 400

        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        extracted_text, safe_filename = DocumentParserService.parse_uploaded_file(file, upload_dir)
        if not extracted_text or len(extracted_text.strip()) < 10:
            return jsonify({"error": "Could not extract sufficient text from the uploaded document."}), 422

        category_hint = request.form.get("category_hint")
        tender_ref = request.form.get("tender_ref")
        issuing_authority = request.form.get("issuing_authority")

        result = recommender.analyze_tender(
            tender_text=extracted_text,
            category_hint=category_hint,
            tender_ref=tender_ref,
            issuing_authority=issuing_authority,
            document_name=safe_filename
        )
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Document analysis failed: {str(e)}"}), 500


@analysis_bp.route('/api/recommend-standard', methods=['POST'])
def recommend_standard():
    """
    POST /api/recommend-standard
    Direct recommendation endpoint for given specifications.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        spec_text = data.get("specifications", "") or data.get("text", "")
        if not spec_text:
            return jsonify({"error": "No specification text provided"}), 400

        result = recommender.analyze_tender(
            tender_text=spec_text,
            category_hint=data.get("category"),
            tender_ref=data.get("tender_ref"),
            document_name="Specification_Input.txt"
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
