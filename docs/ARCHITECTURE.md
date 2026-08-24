# System Architecture & Technical Specifications

**Project:** IS Standard Advisor  
**Problem Statement ID:** SIH26108  
**Repository:** `https://github.com/ranjan781/SIH-project.git`  
**Branch:** `done-by-sachin`

---

## 1. High-Level Architectural Diagram

```mermaid
graph TD
    subgraph Client [Frontend Layer - React + TypeScript + Vite]
        UI1[Government Enterprise Dashboard]
        UI2[Tender Analysis Studio - Upload & Paste]
        UI3[Recommendation & XAI Visualizer]
        UI4[Standards Catalog Explorer]
        UI5[Side-by-Side Document Comparison Matrix]
        UI6[Research & Methodology Section]
        UI7[Officer Signoff & Audit Log]
    end

    subgraph ServiceLayer [Flask REST Backend - Python 3.x]
        API1[POST /api/analyze-text]
        API2[POST /api/analyze-document]
        API3[GET /api/standards]
        API4[GET /api/sample-tenders]
        API5[POST /api/audit-decision]
        API6[GET /api/stats]
        API7[GET /api/health]
    end

    subgraph CoreAIEngine [AI / ML & Regulatory Intelligence]
        DP[Document Parser & Ingestion: PyPDF / python-docx / Werkzeug]
        NER[NLP Entity & Specification Extractor]
        RG[Standards Revision Timeline & Knowledge Graph]
        VEC[TF-IDF & Semantic Vector Engine]
        XAI[5-Point Explainable AI Generator]
        CS[Composite Confidence Scoring Calculator]
    end

    subgraph DataLayer [Standards & Audit Data Repository]
        DB1[(Demo Indian Standards Dataset - 28+ Curated Records)]
        DB2[(Sample Realistic Tenders Corpus)]
        DB3[(Tamper-Evident Audit Log Storage)]
    end

    UI1 --> API6
    UI2 --> API1
    UI2 --> API2
    UI3 --> API5
    UI4 --> API3

    API1 --> DP
    API2 --> DP
    DP --> NER
    NER --> RG
    NER --> VEC
    DB1 --> RG
    DB1 --> VEC
    RG --> CS
    VEC --> CS
    CS --> XAI
    XAI --> UI3
    API5 --> DB3
```

---

## 2. Backend Component Specifications

### 2.1 Flask Modular Structure
- **`backend/app.py`**: Flask application entrypoint with Flask-CORS middleware, error handlers, and `/api/health`.
- **`backend/routes/analysis.py`**: Blueprint handling text and document analysis (`POST /api/analyze-text`, `POST /api/analyze-document`).
- **`backend/routes/standards.py`**: Blueprint handling standard queries, search, and dashboard statistics (`GET /api/standards`, `GET /api/stats`).
- **`backend/routes/audit.py`**: Blueprint handling officer signoffs and audit ledger (`POST /api/audit-decision`, `GET /api/audit-history`).
- **`backend/services/document_parser.py`**: Document parsing for PDF, DOCX, and TXT with `werkzeug.utils.secure_filename`.
- **`backend/services/standard_matcher.py`**: NLP and regex entity extractor for IS codes, materials, grades, dimensions, and tests.
- **`backend/services/revision_checker.py`**: Standards dataset catalog and revision timeline graph manager.
- **`backend/services/recommendation_engine.py`**: AI recommendation engine, compatibility matrix, and explainability synthesizer.
