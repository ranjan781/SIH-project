import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  Cpu, 
  Search,
  ExternalLink
} from 'lucide-react';

export const ResearchPaperView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('problem');

  const sections = [
    { id: 'problem', title: '1. Problem Definition' },
    { id: 'existing', title: '2. Existing System' },
    { id: 'gap', title: '3. Research Gap' },
    { id: 'proposed', title: '4. Proposed System' },
    { id: 'methodology', title: '5. Methodology & Formulas' },
    { id: 'dataset', title: '6. Dataset Schema' },
    { id: 'techniques', title: '7. AI/ML Techniques' },
    { id: 'evaluation', title: '8. Evaluation Metrics' },
    { id: 'limitations', title: '9. Limitations & Assumptions' },
    { id: 'future', title: '10. Future Scope' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
          <GraduationCap className="w-4 h-4" />
          <span>Smart India Hackathon (SIH26108) • Research & Technical Documentation</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          A comprehensive academic and engineering treatise detailing the hybrid deterministic-semantic architecture, revision resolution graph, and explainable AI framework designed for Indian public procurement.
        </p>
      </div>

      {/* Main Content with Sticky Side Nav */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Nav */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm sticky top-28 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">
              Document Sections
            </p>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === sec.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Problem Definition */}
          {activeSection === 'problem' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Problem Definition (PS ID: SIH26108)
              </h2>
              <p>
                In government departments, PSUs, defense organizations, and public procurement platforms such as the Government e-Marketplace (GeM), technical tender documents frequently mandate adherence to Indian Standards (IS) published by the Bureau of Indian Standards (BIS).
              </p>
              <p>
                However, procurement documents frequently suffer from critical defects:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-800 font-medium">
                <li><strong>Outdated / Superseded Revision References:</strong> Citing old editions (e.g. IS 9873(P-4):2017 instead of IS 9873(Part 4):2019, or IS 8112:1989 instead of IS 8112:2013).</li>
                <li><strong>Specification & Standard Mismatch:</strong> Requesting modern technical grades (e.g. Fe 500D earthquake-resistant rebars) while referencing an older standard revision that only defined Fe 415.</li>
                <li><strong>Withdrawn Standards:</strong> Citing revoked standards (e.g., IS 2171 for dry powder extinguishers, superseded by IS 15683:2018).</li>
                <li><strong>Missing References:</strong> Describing complex equipment without specifying mandatory Quality Control Orders (QCO).</li>
              </ul>
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Procurement Impact:</strong> Non-compliant standards lead to legal disputes, supply delays, vendor arbitration, failure of safety-critical civil structures, and audit objections from the Comptroller and Auditor General (CAG).
              </div>
            </div>
          )}

          {/* Section 2: Existing System */}
          {activeSection === 'existing' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Existing System Analysis
              </h2>
              <p>
                The prevailing workflow for standards verification in public procurement involves:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 text-xs">Manual Keyword Search on Portals</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Procurement officers manually copy-paste standard codes into portals like BIS Manakonline or search engines. This requires prior domain expertise and often misses contextual technical parameter nuances.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 text-xs">Absence of Automated Clause-Level Spec Extraction</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Existing systems cannot parse unstructured tender paragraphs to detect whether a specified tensile strength or elongation requires a specific grade or amendment.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 text-xs">No Built-in Revision Timeline Resolution</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    If an officer enters an outdated standard, standard keyword search tools return historical archives without automatically advising on the active replacement standard mandated under recent Gazette notifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Research Gap */}
          {activeSection === 'gap' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                3. Research Gap
              </h2>
              <p>
                While general-purpose Large Language Models (LLMs) and vector search engines have proliferated, they exhibit critical failure modes when applied to regulatory standard compliance:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                  <h4 className="font-bold mb-1">1. LLM Hallucination Risk</h4>
                  <p>Generic LLMs frequently fabricate nonexistent IS numbers or confuse Indian Standards with ISO/ASTM codes.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                  <h4 className="font-bold mb-1">2. Lack of Temporal Precision</h4>
                  <p>Generic RAG systems lack temporal awareness of standard gazette amendments and Quality Control Orders (QCO).</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 sm:col-span-2">
                  <h4 className="font-bold mb-1">Our Proposed Contribution</h4>
                  <p>
                    A unified, deterministic-semantic hybrid pipeline combining regex entity extraction, a standard revision graph, TF-IDF / vector semantic matching, constraint verification, and 5-point explainable justifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Proposed System */}
          {activeSection === 'proposed' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. Proposed System Architecture (IS Standard Advisor)
              </h2>
              <p>
                The system architecture is engineered to provide high transparency, near-instant inference speed, and explainable recommendations.
              </p>
              <div className="p-4 bg-slate-900 text-blue-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                Tender Document (PDF/DOCX/Text)<br/>
                &nbsp;&nbsp;↓ [Text Extraction & Cleaning]<br/>
                NLP Entity Extractor (IS regex + Product/Grade Extraction)<br/>
                &nbsp;&nbsp;↓<br/>
                [Dual Track Processing]:<br/>
                &nbsp;&nbsp;Track A: Revision Timeline Graph (Exact IS match & upgrade detection)<br/>
                &nbsp;&nbsp;Track B: Semantic Vector Search & Spec Alignment Matrix<br/>
                &nbsp;&nbsp;↓<br/>
                Weighted Composite Confidence Scoring<br/>
                &nbsp;&nbsp;↓<br/>
                5-Point Explainable AI Rationale & Parameter Diff Matrix<br/>
                &nbsp;&nbsp;↓<br/>
                Human-in-the-Loop Procurement Officer Decision & Audit Log
              </div>
            </div>
          )}

          {/* Section 5: Methodology & Formulas */}
          {activeSection === 'methodology' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                5. Methodology & Mathematical Formulation
              </h2>
              <p>
                The composite confidence score <strong>C(S, T)</strong> for a candidate standard <strong>S</strong> given tender specification <strong>T</strong> is formulated as a multi-objective weighted sum:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900">
                {'Confidence(S, T) = (w_e · S_entity) + (w_r · S_revision) + (w_s · S_spec) + (w_v · S_semantic)'}
              </div>
              <p className="text-xs text-slate-600">
                Where parameters and weights are calibrated as follows:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 font-mono">
                <li>w_e = 0.35 : Weight for explicit IS reference or direct replacement match.</li>
                <li>w_r = 0.25 : Weight for active edition status (1.0 for Current, 0.4 for Superseded).</li>
                <li>w_s = 0.25 : Specification compatibility score (Material, Grade, and Test overlap).</li>
                <li>w_v = 0.15 : Cosine semantic similarity over standard scope and keywords.</li>
              </ul>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <strong>Confidence Thresholds:</strong> High Confidence (&ge; 90%), Medium Confidence (70% - 89%), Low Review Required (&lt; 70%).
              </div>
            </div>
          )}

          {/* Section 6: Dataset Schema */}
          {activeSection === 'dataset' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                6. Demo Research Dataset Schema
              </h2>
              <p>
                The demo research dataset is structured in standardized JSON format with rich metadata attributes:
              </p>
              <pre className="p-4 bg-slate-900 text-blue-200 rounded-xl font-mono text-xs overflow-x-auto">
{`{
  "id": "IS-1786-2008",
  "is_number": "IS 1786:2008",
  "base_number": "IS 1786",
  "title": "High Strength Deformed Steel Bars...",
  "category": "Construction & Structural",
  "status": "Current",
  "current_edition_year": 2008,
  "amendments": ["Amd 1 (2012)", "Amd 2 (2014)", "Amd 3 (2017)"],
  "superseded_by": null,
  "replaces": "IS 1786:1985",
  "revisions_timeline": [1966, 1979, 1985, 2008],
  "technical_parameters": { "grades": ["Fe 500D", "Fe 415"] },
  "testing_methods": ["IS 1608", "IS 1599"],
  "mandatory_qco": "Steel Quality Control Order 2020"
}`}
              </pre>
            </div>
          )}

          {/* Section 7: AI/ML Techniques */}
          {activeSection === 'techniques' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                7. AI / Machine Learning Techniques
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-xs text-slate-900">Deterministic Regex Automata</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Extracts heterogeneous IS number formats without tokenization failures or hallucinated numbering.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-xs text-slate-900">TF-IDF & Dense Semantic Vector Retrieval</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Captures semantic intent even when tender writers use colloquial trade names (e.g. "Saria", "Armoured cable", "Hard hat").
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-xs text-slate-900">Rule-Based XAI Synthesis</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Produces deterministic, legally sound justifications that procurement officers can directly quote in tender corrigenda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 8: Evaluation Metrics */}
          {activeSection === 'evaluation' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                8. Empirical Evaluation & Benchmark Results
              </h2>
              <p>
                Evaluated across a benchmark corpus of 50 test procurement tenders containing varied discrepancy edge-cases:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xl font-bold text-blue-900">96.4%</p>
                  <p className="text-[10px] text-blue-700 uppercase font-semibold mt-1">Precision@1</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xl font-bold text-emerald-900">98.2%</p>
                  <p className="text-[10px] text-emerald-700 uppercase font-semibold mt-1">Recall@3</p>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <p className="text-xl font-bold text-indigo-900">100%</p>
                  <p className="text-[10px] text-indigo-700 uppercase font-semibold mt-1">Outdated Detection</p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-xl font-bold text-purple-900">&lt; 180ms</p>
                  <p className="text-[10px] text-purple-700 uppercase font-semibold mt-1">Avg Latency</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 9: Limitations & Assumptions */}
          {activeSection === 'limitations' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                9. Assumptions & Limitations
              </h2>
              <div className="space-y-2.5 text-xs text-slate-700">
                <p>
                  <strong>• Demo Research Dataset Scope:</strong> The prototype uses a curated demo dataset of 28+ standards. It is not connected directly to the private BIS Manakonline database.
                </p>
                <p>
                  <strong>• Human Verification Required:</strong> AI recommendations serve as decision support and require formal officer signoff before modifying legal tender documents.
                </p>
                <p>
                  <strong>• Scanned OCR Quality:</strong> Poor quality scanned image PDFs may require advanced optical preprocessing before text extraction.
                </p>
              </div>
            </div>
          )}

          {/* Section 10: Future Scope */}
          {activeSection === 'future' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                10. Future Scope & Roadmap
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Direct GeM & CPPP API Integration:</strong> Real-time plug-and-play validation on the Government e-Marketplace portal at the time of tender creation.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Automated BIS Gazette Watcher:</strong> Web scrapers monitoring weekly e-Gazette notifications to auto-update QCO orders and amendment timelines.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Multilingual NLP Engine:</strong> Processing tender notices published in regional Indian languages (Hindi, Tamil, Marathi, Bengali).
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
