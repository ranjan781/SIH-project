import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify
from flask_cors import CORS

from backend.routes.analysis import analysis_bp
from backend.routes.standards import standards_bp
from backend.routes.audit import audit_bp
from backend.routes.catalog import catalog_bp

def create_app() -> Flask:
    app = Flask(__name__)
    
    # Configure CORS to allow frontend communication
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Route Blueprints
    app.register_blueprint(analysis_bp)
    app.register_blueprint(standards_bp)
    app.register_blueprint(audit_bp)
    app.register_blueprint(catalog_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "online",
            "backend": "Flask",
            "project": "SIH26108",
            "version": "1.0.0",
            "framework": "Flask 3.x"
        }), 200

    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "message": "IS Standard Advisor - Flask API Backend is running",
            "health": "/api/health",
            "standards": "/api/standards",
            "catalog": "/api/catalog/search?q=cement",
            "catalog_stats": "/api/catalog/stats",
            "catalog_lookup": "/api/catalog/lookup  [POST]",
            "docs": "REST API available at /api/*"
        }), 200

    return app

app = create_app()

if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("Flask backend running")
    print("http://localhost:5000")
    print("=" * 55 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
