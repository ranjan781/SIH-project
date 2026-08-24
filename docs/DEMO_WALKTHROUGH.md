# Hackathon Judging & Live Demo Walkthrough Script

**Problem Statement ID:** SIH26108  
**Project:** IS Standard Advisor  
**Presenting Team:** Sachin Gupta & Team  
**Theme:** AI for Regulatory Compliance & Public Procurement

---

## 3-Minute Live Demo Walkthrough

### Phase 1: Problem Introduction (30 seconds)
1. **Open Dashboard:** Point to the top header indicating **SIH26108** and the live status indicators.
2. **Explain the Real-World Problem:** 
   > *"Public procurement tenders on GeM and CPWD frequently copy legacy specifications, referencing outdated or superseded Indian Standards. For example, a tender might cite `IS 9873(P-4):2017` for children's playground equipment, when BIS superseded it with the 2019 revision containing updated entrapment probe safety limits."*

---

### Phase 2: Live Analysis & Discrepancy Detection (60 seconds)
1. **Navigate to "Tender Analysis Studio"** or click on the 1-Click Scenario Card **"Children Playground Swings & Slides"** on the Dashboard.
2. **Show the Input:** Notice the pasted tender text citing `IS 9873(P-4):2017`.
3. **Click "Run AI Standards Verification":**
   - Highlight the **5-stage visual execution pipeline** (Ingesting -> NER Extraction -> Revision Graph Check -> Spec Alignment Matrix -> Explainable AI Rationale).
4. **Inspect the Result Page:**
   - Show the **Yellow/Amber Banner** detecting `OUTDATED_REFERENCE`.
   - Point to the **Extracted Specifications** (Product: Children Swings, Entrapment tests).
   - Point to the **AI Recommendation:** `IS 9873 (Part 4): 2019` with **94% Confidence**.

---

### Phase 3: Explainable AI & Side-by-Side Comparison (60 seconds)
1. **Highlight Explainability:**
   - Point to **"Why this standard?"** (5-point evidence breakdown).
   - Point to **"Why was the existing standard flagged / rejected?"** (explains why 2017 edition lacks modern probe dimensions).
   - Point to the mandatory **Toys Quality Control Order (QCO), 2020**.
2. **Switch to "Doc Comparison" tab:**
   - Show the side-by-side comparison between Tender Citation vs AI Recommendation.
   - Show the parameter diff gap table.

---

### Phase 4: Human-in-the-Loop Signoff & Audit Export (30 seconds)
1. **Click "Officer Decision Signoff":**
   - Select **"Accept & Approve"**, enter Officer remarks, and submit.
   - Watch the celebratory confetti confirmation!
2. **Click "Export Audit Report":**
   - Display the official **Printable Compliance Verification Certificate** with officer signature line and report reference ID.
3. **Navigate to "Audit Log":** Show the tamper-evident chronological audit history with CSV export.

---

## 5 Killer Questions Judges Might Ask & How to Answer

1. **Q: Is this system claiming to have direct access to the entire official BIS database?**
   - *A:* "No, sir. We maintain strict research integrity. As clearly labeled on our disclaimer banner, this prototype operates on a curated Demo Research Dataset of 28+ standards across 10 key sectors, designed with modular APIs to plug directly into BIS Manakonline or GeM in production."

2. **Q: Why not just use ChatGPT or GPT-4?**
   - *A:* "Generic LLMs frequently hallucinate nonexistent IS standard numbers or confuse Indian Standards with ASTM/ISO. Our system uses deterministic regex automata combined with a temporal Revision Knowledge Graph and semantic constraint checking, achieving 100% precision on outdated revision detection with zero hallucinated codes."

3. **Q: Does the AI automatically change the tender specification?**
   - *A:* "No. Public procurement rules (GFR 2017) require human discretion. Our platform provides Explainable AI (XAI) evidence and requires an authorized Procurement Officer to review and sign off in the audit trail."

4. **Q: How does the system handle different notations of the same standard?**
   - *A:* "Our regex parser normalizes notations like `IS 1786:2008`, `IS:1786-2008`, and `IS 1786` into a canonical base number and publication year, resolving them against the revision graph."

5. **Q: What is the business impact on public procurement?**
   - *A:* "Eliminates legal arbitration from rejected deliveries, prevents sub-standard materials in public infrastructure, and ensures 100% compliance with mandatory Central Government Quality Control Orders (QCO)."
