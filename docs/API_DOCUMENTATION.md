# REST API Documentation

**Application:** IS Standard Advisor API  
**Base URL:** `http://localhost:8000/api`  
**Swagger UI:** `http://localhost:8000/docs`  
**ReDoc:** `http://localhost:8000/redoc`

---

## Endpoints Overview

### 1. `POST /api/analyze-text`
Analyze pasted raw technical tender text or clause paragraphs.

**Request Payload:**
```json
{
  "text": "Procurement of playground swings conforming to IS 9873(P-4):2017 for public parks.",
  "category_hint": "Toys & Child Safety",
  "tender_ref": "DUD/PARKS/2024/SW-092",
  "issuing_authority": "Directorate of Urban Development",
  "document_name": "Tender_Specification.txt"
}
```

**Response (200 OK):**
```json
{
  "analysis_id": "ANL-78AB34",
  "timestamp": "2024-11-20T10:15:00Z",
  "document_name": "Tender_Specification.txt",
  "tender_ref": "DUD/PARKS/2024/SW-092",
  "detected_product": "Children Playground Activity Toys (Swings/Slides)",
  "detected_category": "Toys & Child Safety",
  "extracted_specifications": {
    "detected_product": "Children Playground Activity Toys (Swings/Slides)",
    "category": "Toys & Child Safety",
    "grade": "Domestic / Public Park Standard",
    "testing_requirements": ["Entrapment probe test", "Stability test"]
  },
  "referenced_standards": [
    {
      "raw_match": "IS 9873(P-4):2017",
      "normalized_is": "IS 9873 (Part 4): 2017",
      "discrepancy_type": "OUTDATED_REVISION",
      "discrepancy_details": "Outdated Reference: IS 9873 (Part 4): 2017 was superseded by IS 9873 (Part 4): 2019."
    }
  ],
  "primary_recommendation": {
    "standard_id": "IS-9873-P4-2019",
    "is_number": "IS 9873 (Part 4): 2019",
    "title": "Safety of Toys - Part 4: Swings, Slides and Similar Activity Toys...",
    "category": "Toys & Child Safety",
    "status": "Current",
    "confidence_score": 0.94,
    "confidence_level": "HIGH",
    "why_recommended_reasons": [
      "Direct active revision upgrade for tender citation 'IS 9873 (Part 4): 2017'.",
      "Product category aligns with 'Toys & Child Safety'.",
      "Mandatory compliance under: Toys (Quality Control) Order, 2020."
    ],
    "mandatory_qco": "Toys (Quality Control) Order, 2020"
  },
  "overall_status": "OUTDATED_REFERENCE",
  "overall_confidence": 0.94,
  "summary_verdict": "Outdated Standard Detected: Tender references an older revision. Upgraded to latest edition IS 9873 (Part 4): 2019."
}
```

---

### 2. `POST /api/analyze-document`
Multipart form upload of `.pdf`, `.docx`, or `.txt` tender documents.

**Form Parameters:**
- `file`: Binary file upload
- `category_hint`: (Optional) String category filter
- `tender_ref`: (Optional) String tender reference
- `issuing_authority`: (Optional) String PSU / Ministry name

---

### 3. `GET /api/standards`
Retrieve, search, and filter Indian Standards from the research dataset.

**Query Parameters:**
- `search`: (Optional) Search query matching IS number, title, keywords
- `category`: (Optional) Filter by category name
- `status`: (Optional) `Current`, `Superseded`, `Withdrawn`

---

### 4. `GET /api/sample-tenders`
Returns pre-packaged realistic procurement tender scenarios covering steel, cement, PPE, cables, fire extinguishers, and pipes.

---

### 5. `POST /api/audit-decision`
Record human-in-the-loop verification decisions by authorized procurement officers.

**Request Payload:**
```json
{
  "analysis_id": "ANL-78AB34",
  "standard_id": "IS 9873 (Part 4): 2019",
  "decision": "ACCEPTED",
  "officer_name": "Er. Sachin Gupta",
  "officer_role": "Chief Procurement Verification Officer",
  "remarks": "Approved standard upgrade to 2019 edition under mandatory Toys QCO 2020."
}
```

---

### 6. `GET /api/audit-history`
Retrieve complete chronological audit log of all officer signoffs.
