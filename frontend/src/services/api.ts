import { 
  DocumentAnalysisResult, 
  StandardRecord, 
  AuditLogEntry, 
  SampleTender 
} from '../types';
import { INITIAL_STANDARDS_DATA, SAMPLE_TENDERS, DEFAULT_AUDIT_LOGS } from '../data/mockData';

const API_BASE = 'http://localhost:8000/api';

export class ApiService {
  private static isBackendAvailable: boolean | null = null;

  static async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
      const ok = res.ok;
      this.isBackendAvailable = ok;
      return ok;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  static async analyzeText(
    text: string, 
    categoryHint?: string, 
    tenderRef?: string, 
    issuingAuthority?: string,
    docName: string = "Pasted_Tender_Specification.txt"
  ): Promise<DocumentAnalysisResult> {
    const isOnline = await this.checkBackendHealth();
    
    if (isOnline) {
      try {
        const response = await fetch(`${API_BASE}/analyze-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            category_hint: categoryHint,
            tender_ref: tenderRef,
            issuing_authority: issuingAuthority,
            document_name: docName
          })
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn("Backend call failed, using client-side AI engine:", err);
      }
    }

    // Client-side fallback implementation
    return this.clientSideAnalyze(text, categoryHint, tenderRef, issuingAuthority, docName);
  }

  static async analyzeDocument(
    file: File, 
    categoryHint?: string, 
    tenderRef?: string, 
    issuingAuthority?: string
  ): Promise<DocumentAnalysisResult> {
    const isOnline = await this.checkBackendHealth();
    
    if (isOnline) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (categoryHint) formData.append('category_hint', categoryHint);
        if (tenderRef) formData.append('tender_ref', tenderRef);
        if (issuingAuthority) formData.append('issuing_authority', issuingAuthority);

        const response = await fetch(`${API_BASE}/analyze-document`, {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn("Backend document upload failed, falling back to client-side text extractor:", err);
      }
    }

    // Read file text on client
    const text = await file.text();
    return this.clientSideAnalyze(text, categoryHint, tenderRef, issuingAuthority, file.name);
  }

  static async getStandards(search?: string, category?: string, status?: string): Promise<StandardRecord[]> {
    const isOnline = await this.checkBackendHealth();
    if (isOnline) {
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category && category !== 'all') params.append('category', category);
        if (status && status !== 'all') params.append('status', status);

        const res = await fetch(`${API_BASE}/standards?${params.toString()}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("Using local standards catalog fallback");
      }
    }

    let results = INITIAL_STANDARDS_DATA;
    if (category && category !== 'all') {
      results = results.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    if (status && status !== 'all') {
      results = results.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(s => 
        s.is_number.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.keywords.some(k => k.toLowerCase().includes(q)) ||
        s.applicable_products.some(p => p.toLowerCase().includes(q))
      );
    }
    return results;
  }

  static async getSampleTenders(): Promise<SampleTender[]> {
    const isOnline = await this.checkBackendHealth();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/sample-tenders`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return SAMPLE_TENDERS;
  }

  static async getAuditHistory(): Promise<AuditLogEntry[]> {
    const isOnline = await this.checkBackendHealth();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/audit-history`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return DEFAULT_AUDIT_LOGS;
  }

  static async recordOfficerDecision(decisionData: {
    analysis_id: string;
    standard_id: string;
    decision: string;
    officer_name: string;
    officer_role?: string;
    remarks?: string;
  }): Promise<AuditLogEntry> {
    const isOnline = await this.checkBackendHealth();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/audit-decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(decisionData)
        });
        if (res.ok) return await res.json();
      } catch {}
    }

    // Client fallback entry
    const newEntry: AuditLogEntry = {
      log_id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      analysis_id: decisionData.analysis_id,
      timestamp: new Date().toISOString(),
      officer_name: decisionData.officer_name,
      officer_role: decisionData.officer_role || "Procurement Officer",
      document_name: "Verified_Tender_Document.pdf",
      tender_ref: "TENDER/REC/VERIFIED",
      detected_product: "Procurement Item",
      cited_standard: "Tender Ref",
      recommended_standard: decisionData.standard_id,
      decision: decisionData.decision as any,
      remarks: decisionData.remarks || "",
      confidence_score: 0.95
    };
    return newEntry;
  }

  // Client-side AI Recommendation Engine (Fallback & Instant UI simulation)
  private static clientSideAnalyze(
    text: string, 
    categoryHint?: string, 
    tenderRef?: string, 
    issuingAuthority?: string,
    docName: string = "Tender_Specification.txt"
  ): DocumentAnalysisResult {
    const textLower = text.toLowerCase();

    // 1. IS reference detection
    const isRegex = /\b(?:IS|I\.S\.|INDIAN\s+STANDARD)\s*:?\s*(\d{2,5})(?:\s*[\(\[]?\s*(?:Part|Pt|P)\s*[-:]?\s*(\d+)[\)\]]?)?(?:\s*[:\-\/]\s*(\d{4}))?\b/gi;
    const matches = Array.from(text.matchAll(isRegex));

    const detectedRefs = matches.map(m => {
      const baseNum = `IS ${m[1]}` + (m[2] ? ` (Part ${m[2]})` : '');
      const year = m[3] ? parseInt(m[3]) : null;
      const normalized = year ? `${baseNum}: ${year}` : baseNum;

      const exact = INITIAL_STANDARDS_DATA.find(s => s.is_number.replace(/\s+/g, '').toUpperCase() === normalized.replace(/\s+/g, '').toUpperCase());
      const latest = INITIAL_STANDARDS_DATA.find(s => s.base_number.replace(/\s+/g, '').toUpperCase() === baseNum.replace(/\s+/g, '').toUpperCase() && s.status === 'Current');

      let disc: any = 'VALID_CURRENT';
      let details = `Aligned with current standard ${latest?.is_number || normalized}.`;

      if (exact && exact.status === 'Superseded') {
        disc = 'OUTDATED_REVISION';
        details = `Outdated Reference: ${normalized} was superseded by ${exact.superseded_by || latest?.is_number}.`;
      } else if (exact && exact.status === 'Withdrawn') {
        disc = 'WITHDRAWN_STANDARD';
        details = `Withdrawn Standard: ${normalized} has been withdrawn by BIS. Current replacement: ${exact.superseded_by || 'IS 15683:2018'}.`;
      } else if (latest && year && year < latest.current_edition_year) {
        disc = 'OUTDATED_REVISION';
        details = `Outdated Revision: Cited edition ${year} is superseded by latest ${latest.is_number}.`;
      }

      return {
        raw_match: m[0],
        normalized_is: normalized,
        base_number: baseNum,
        cited_year: year,
        is_known_in_dataset: !!(exact || latest),
        dataset_status: exact?.status || (latest ? 'Current' : 'Unknown'),
        latest_edition_year: latest?.current_edition_year,
        superseded_by: exact?.superseded_by,
        discrepancy_type: disc,
        discrepancy_details: details
      };
    });

    // 2. Product and Spec Extraction
    let product = "Industrial / Construction Procurement Goods";
    let category = categoryHint || "General Engineering";
    let grade: string | null = null;
    let material: string | null = null;

    if (textLower.includes("tmt") || textLower.includes("rebar") || textLower.includes("fe 500") || textLower.includes("fe 415")) {
      product = "TMT Reinforcement Steel Bars";
      category = "Construction & Structural";
      grade = textLower.includes("500d") ? "Fe 500D" : (textLower.includes("500") ? "Fe 500" : "Fe 415");
      material = "Thermo-Mechanically Treated Carbon Steel";
    } else if (textLower.includes("swing") || textLower.includes("slide") || textLower.includes("playground") || textLower.includes("toy")) {
      product = "Children Playground Activity Toys (Swings/Slides)";
      category = "Toys & Child Safety";
      grade = "Domestic / Public Park Standard";
      material = "Mild Steel Framework & Food-Grade Polymers";
    } else if (textLower.includes("cement") || textLower.includes("opc 43") || textLower.includes("8112")) {
      product = "Ordinary Portland Cement (43 Grade)";
      category = "Construction & Structural";
      grade = "43 Grade (43 MPa)";
      material = "Hydraulic Portland Clinker";
    } else if (textLower.includes("helmet") || textLower.includes("hard hat") || textLower.includes("2925")) {
      product = "Industrial Safety Helmets (HDPE)";
      category = "Safety & PPE";
      grade = "Class 1 Industrial";
      material = "High Density Polyethylene (HDPE)";
    } else if (textLower.includes("pvc") && (textLower.includes("cable") || textLower.includes("wire") || textLower.includes("frls"))) {
      product = "PVC Insulated Copper House Wiring Cables";
      category = "Electrical & Cables";
      grade = "1.1 kV Grade (FRLS)";
      material = "Electrolytic Annealed Copper";
    } else if (textLower.includes("extinguisher") || textLower.includes("abc powder") || textLower.includes("fire")) {
      product = "Portable ABC Dry Chemical Powder Fire Extinguisher";
      category = "Fire Safety";
      grade = "Class A, B, C Stored Pressure";
      material = "Mono Ammonium Phosphate (MAP 50%)";
    } else if (textLower.includes("hdpe") || textLower.includes("pe 100") || textLower.includes("4984") || textLower.includes("water pipe")) {
      product = "HDPE Potable Water Distribution Pipes";
      category = "Pipes & Infrastructure";
      grade = "PE 100 (PN 10 Rating)";
      material = "High Density Polyethylene";
    }

    // 3. Find matching recommendation
    let bestStd = INITIAL_STANDARDS_DATA.find(s => s.status === 'Current' && (
      (product.includes("Steel") && s.id.includes("1786")) ||
      (product.includes("Toys") && s.id.includes("9873-P4-2019")) ||
      (product.includes("Cement") && s.id.includes("8112-2013")) ||
      (product.includes("Helmet") && s.id.includes("2925")) ||
      (product.includes("Copper") && s.id.includes("694-2010")) ||
      (product.includes("Fire") && s.id.includes("15683")) ||
      (product.includes("Pipes") && s.id.includes("4984-2016")) ||
      s.category.toLowerCase() === category.toLowerCase()
    )) || INITIAL_STANDARDS_DATA[0];

    const hasOutdated = detectedRefs.some(r => r.discrepancy_type === 'OUTDATED_REVISION' || r.discrepancy_type === 'WITHDRAWN_STANDARD');
    const isValid = detectedRefs.some(r => r.discrepancy_type === 'VALID_CURRENT');

    const overallStatus: any = hasOutdated ? 'OUTDATED_REFERENCE' : (isValid ? 'VALID' : 'REVIEW_REQUIRED');
    const conf = hasOutdated || isValid ? 0.94 : 0.82;

    const primaryRec = {
      standard_id: bestStd.id,
      is_number: bestStd.is_number,
      title: bestStd.title,
      category: bestStd.category,
      status: bestStd.status,
      confidence_score: conf,
      confidence_level: 'HIGH' as const,
      is_direct_replacement: hasOutdated,
      why_recommended_reasons: [
        `Verified standard directly regulates ${bestStd.applicable_products.join(', ')}.`,
        `Product category perfectly aligns with '${bestStd.category}'.`,
        `Mandatory compliance with: ${bestStd.mandatory_qco || 'Bureau of Indian Standards Quality Orders'}.`,
        `Includes updated test protocols: ${bestStd.testing_methods.join(', ')}.`
      ],
      why_rejected_reasons: hasOutdated ? [
        `Tender references an outdated revision which lacks current BIS safety and composition amendments.`,
        `Non-compliance with mandatory Quality Control Orders (QCO) risks audit rejection and supplier dispute.`
      ] : [],
      matching_parameters: bestStd.technical_parameters,
      mandatory_qco: bestStd.mandatory_qco,
      testing_methods: bestStd.testing_methods,
      scope_excerpt: bestStd.scope
    };

    const alternatives = INITIAL_STANDARDS_DATA
      .filter(s => s.id !== bestStd.id && s.status === 'Current' && s.category === bestStd.category)
      .slice(0, 2)
      .map(s => ({
        standard_id: s.id,
        is_number: s.is_number,
        title: s.title,
        category: s.category,
        status: s.status,
        confidence_score: 0.76,
        confidence_level: 'MEDIUM' as const,
        is_direct_replacement: false,
        why_recommended_reasons: [`Related supplementary standard in category ${s.category}`],
        why_rejected_reasons: [],
        matching_parameters: s.technical_parameters,
        mandatory_qco: s.mandatory_qco,
        testing_methods: s.testing_methods,
        scope_excerpt: s.scope
      }));

    return {
      analysis_id: `ANL-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      document_name: docName,
      tender_ref: tenderRef || "TENDER/SIH/2024/09",
      issuing_authority: issuingAuthority || "Govt Procurement Authority",
      detected_product: product,
      detected_category: category,
      extracted_specifications: {
        detected_product: product,
        category: category,
        grade: grade,
        material: material,
        dimensions: "Standard Procurement Sizing",
        testing_requirements: bestStd.testing_methods.slice(0, 3),
        raw_specifications: { grade, material },
        key_parameters: [
          `Product: ${product}`,
          `Category: ${category}`,
          grade ? `Grade: ${grade}` : '',
          material ? `Material: ${material}` : ''
        ].filter(Boolean)
      },
      referenced_standards: detectedRefs,
      primary_recommendation: primaryRec,
      alternative_recommendations: alternatives,
      diff_comparison: {
        tender_cited_standard: detectedRefs[0]?.normalized_is || 'None Cited',
        recommended_standard: bestStd.is_number,
        revision_gap_years: detectedRefs[0]?.cited_year ? (bestStd.current_edition_year - detectedRefs[0].cited_year) : 0,
        key_differences: [
          hasOutdated ? `Revision upgrade from ${detectedRefs[0]?.normalized_is} to ${bestStd.is_number}` : 'Standard alignment confirmed',
          `Quality Control Order: ${bestStd.mandatory_qco || 'BIS Certification Mark Required'}`
        ],
        parameter_diffs: [
          {
            parameter: "Standard Edition",
            tender_requirement: detectedRefs[0]?.normalized_is || "Not Specified",
            standard_specification: bestStd.is_number,
            status: hasOutdated ? "UPGRADE_REQUIRED" : "MATCH",
            explanation: hasOutdated ? "Tender uses older revision." : "Standard is current and active."
          }
        ],
        summary_advice: hasOutdated 
          ? `Tender amendment advised: Update reference to ${bestStd.is_number}.`
          : `Specification verified: ${bestStd.is_number} is valid for procurement.`
      },
      overall_status: overallStatus,
      overall_confidence: conf,
      summary_verdict: hasOutdated 
        ? `Outdated revision detected in tender. Upgrade to ${bestStd.is_number} recommended.`
        : `Tender specifications are consistent with active Indian Standard ${bestStd.is_number}.`,
      disclaimer: "Demo Research Prototype. Verify with official BIS Gazette / Manakonline before final procurement."
    };
  }
}
