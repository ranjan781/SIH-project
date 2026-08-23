"""
FastAPI Main Application Entry Point
IS Standard Advisor - AI-Powered Indian Standards Recommendation Engine
Problem Statement: SIH26108
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as api_router

app = FastAPI(
    title="IS Standard Advisor API",
    description="AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications (SIH26108)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend (Vite port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)


@app.get("/")
def root_status():
    return {
        "system": "IS Standard Advisor Backend",
        "ps_id": "SIH26108",
        "status": "Online",
        "version": "1.0.0",
        "dataset_mode": "Demo Research Dataset (Not Official BIS Database)",
        "endpoints": {
            "docs": "/docs",
            "analyze_text": "/api/analyze-text",
            "analyze_document": "/api/analyze-document",
            "standards": "/api/standards",
            "sample_tenders": "/api/sample-tenders",
            "dashboard_stats": "/api/stats",
            "audit_history": "/api/audit-history"
        }
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "is-standard-advisor-engine"}


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
