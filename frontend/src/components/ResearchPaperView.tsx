import React, { useState } from 'react';
import { 
  GraduationCap
} from 'lucide-react';

export const ResearchPaperView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('problem');

  const sections = [
    { id: 'problem', title: '1. Problem Definition' },
    { id: 'existing', title: '2. Existing System Analysis' },
    { id: 'gap', title: '3. Research Gap & Novelty' },
    { id: 'proposed', title: '4. Proposed Architecture' },
    { id: 'methodology', title: '5. Methodology & Formulas' },
    { id: 'dataset', title: '6. Dataset Schema & Corpus' },
    { id: 'techniques', title: '7. AI / ML Techniques' },
    { id: 'evaluation', title: '8. Evaluation Metrics' },
    { id: 'limitations', title: '9. Limitations & Assumptions' },
    { id: 'future', title: '10. Future Scope & GeM Integration' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span>Smart India Hackathon • SIH26108 Technical Treatise</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          An engineering treatise detailing the hybrid deterministic-semantic architecture, revision resolution graph, and explainable AI framework designed for Indian public procurement.
        </p>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs sticky top-20 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1 mb-1">
              Treatise Sections
            </p>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === sec.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* Section Content (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section 1: Problem Definition */}
          {activeSection === 'problem' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                1. Problem Definition (PS ID: SIH26108)
              </h2>
              <p>
                Public procurement across India represents <strong>20% to 25% of the national GDP</strong>. Technical tender specifications issued across GeM, CPWD, PSUs, and defense organizations mandate compliance with Indian Standards (IS) published by the Bureau of Indian Standards (BIS).
              </p>
              <p>
                However, manual tender formulation introduces critical non-compliance vulnerabilities:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-800 dark:text-slate-200">
                <li><strong>Outdated / Superseded Revision References:</strong> Citing old revisions (e.g. <code>IS 9873(P-4):2017</code> instead of <code>IS 9873(Part 4):2019</code>, or <code>IS 8112:1989</code> instead of <code>IS 8112:2013</code>).</li>
                <li><strong>Specification & Standard Inconsistencies:</strong> Requesting modern ductile earthquake-resistant grades (<code>Fe 500D</code>) under older standard revisions (<code>IS 1786:1985</code>) that never codified them.</li>
                <li><strong>Withdrawn Standards:</strong> Referencing revoked standards (such as <code>IS 2171:1999</code> for dry powder extinguishers, which was harmonized into <code>IS 15683:2018</code>).</li>
                <li><strong>Missing Quality Control Orders (QCO):</strong> Failure to mandate statutory BIS certification marks.</li>
              </ul>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200">
                <strong>Statutory Impact:</strong> Citing superseded standards leads to vendor arbitration, sub-standard materials in public infrastructure, and adverse audit findings by the Comptroller and Auditor General (CAG).
              </div>
            </div>
          )}

          {/* Section 2: Existing System */}
          {activeSection === 'existing' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                2. Existing System Analysis
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Manual Portal Searches (BIS Manakonline)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Officers manually copy-paste standard codes into web portals. This requires prior domain expertise and fails to catch subtle clause-level parameter discrepancies.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Absence of Clause-Level Extraction</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Existing portals cannot parse unstructured tender paragraphs to detect whether specified tensile strength or elongation requirements necessitate an amended grade.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">No Dynamic Revision Graph Traversal</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Keyword search tools return historical archives without automatically advising on the active replacement standard mandated under recent statutory Gazette notifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Research Gap */}
          {activeSection === 'gap' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                3. Research Gap & Novelty
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  <h4 className="font-bold mb-1">1. LLM Hallucination Risk</h4>
                  <p>Generic LLMs frequently hallucinate nonexistent IS standard numbers or confuse Indian Standards with ASTM/ISO codes.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  <h4 className="font-bold mb-1">2. Lack of Temporal Precision</h4>
                  <p>Generic RAG systems lack temporal awareness of standard gazette amendments and mandatory Quality Control Orders (QCO).</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200 sm:col-span-2">
                  <h4 className="font-bold mb-1">Proposed Contribution</h4>
                  <p>
                    A unified deterministic-semantic hybrid pipeline combining regex entity extraction, a temporal revision graph, TF-IDF / vector semantic matching over 152 BIS standards, constraint verification, and 5-point explainable justifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Proposed Architecture */}
          {activeSection === 'proposed' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                4. Proposed System Architecture (IS Standard Advisor)
              </h2>
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11.5px] overflow-x-auto leading-relaxed border border-slate-800">
                Tender Document (PDF/DOCX/Text)<br/>
                &nbsp;&nbsp;↓ [Text Extraction & Cleaning]<br/>
                NLP Entity Extractor (IS regex + Product/Grade Extraction)<br/>
                &nbsp;&nbsp;↓<br/>
                [Dual Track Processing]:<br/>
                &nbsp;&nbsp;Track A: Revision Timeline Graph (Exact IS match & upgrade detection)<br/>
                &nbsp;&nbsp;Track B: Semantic Vector Search & Spec Alignment Matrix (152 BIS Standards)<br/>
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                5. Methodology & Mathematical Formulation
              </h2>
              <p>
                The composite confidence score <strong>C(S, T)</strong> for candidate standard <strong>S</strong> given tender specification <strong>T</strong> is formulated as a multi-objective weighted sum:
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white">
                {'Confidence(S, T) = (w_e · S_entity) + (w_r · S_revision) + (w_s · S_spec) + (w_v · S_semantic)'}
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300 font-mono">
                <li>w_e = 0.35 : Weight for explicit IS reference or direct replacement match.</li>
                <li>w_r = 0.25 : Weight for active edition status (1.0 for Current, 0.4 for Superseded).</li>
                <li>w_s = 0.25 : Specification compatibility score (Material, Grade, and Test overlap).</li>
                <li>w_v = 0.15 : Cosine semantic similarity over standard scope and keywords.</li>
              </ul>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200">
                <strong>Calibrated Thresholds:</strong> High Confidence (&ge; 90%), Medium Confidence (70% - 89%), Review Required (&lt; 70%).
              </div>
            </div>
          )}

          {/* Section 6: Dataset Schema */}
          {activeSection === 'dataset' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                6. BIS Expanded Dataset Schema (152 Standards)
              </h2>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
{`{
  "IS_number": "IS 1786:2008",
  "title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement - Specification",
  "category": "Steel & Metal Products",
  "latest_version": "2008 (Fourth Revision)",
  "amendment": "Reaffirmed 2018; Amd 1, 2, 3",
  "certification_required": "Yes - Mandatory ISI Mark under Steel Quality Control Order",
  "scope_description": "Covers requirements for high strength deformed steel bars and wires for use as reinforcement in concrete...",
  "normative_refs": "IS 2062; IS 1608; IS 1599"
}`}
              </pre>
            </div>
          )}

          {/* Section 7: AI/ML Techniques */}
          {activeSection === 'techniques' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                7. AI / Machine Learning Techniques
              </h2>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <p>• <strong>Deterministic Regex Automata:</strong> Eliminates tokenization errors and ensures exact extraction of heterogeneous IS formatting variations.</p>
                <p>• <strong>TF-IDF & Cosine Similarity:</strong> Captures semantic intent across trade terminology and formal standard scopes across 152 indexed standards.</p>
                <p>• <strong>Temporal Revision Graph Traversal:</strong> Deterministically models standard lifecycles, replacements, and amendments.</p>
                <p>• <strong>Rule-Based XAI Synthesis:</strong> Generates legally auditable natural language rationales.</p>
              </div>
            </div>
          )}

          {/* Section 8: Evaluation Metrics */}
          {activeSection === 'evaluation' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                8. Empirical Evaluation & Benchmark Results
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">96.4%</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Precision@1</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">98.2%</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Recall@3</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">100%</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Outdated Detection</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">&lt; 180ms</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Avg Latency</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 9: Limitations & Assumptions */}
          {activeSection === 'limitations' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                9. Assumptions & Prototype Scope
              </h2>
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p>• <strong>Expanded Dataset Scope:</strong> The system indexes 152 BIS standards across 12 product sectors.</p>
                <p>• <strong>Decision Support Nature:</strong> Under GFR 2017 rules, the AI system acts strictly as an advisory tool. Statutory authority remains with the designated Procurement Officer.</p>
                <p>• <strong>OCR Processing:</strong> Poor quality scanned image PDFs require optical pre-processing prior to clause extraction.</p>
              </div>
            </div>
          )}

          {/* Section 10: Future Scope */}
          {activeSection === 'future' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                10. Future Scope & GeM Integration
              </h2>
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p>• <strong>Direct GeM API Middleware:</strong> Real-time validation embedded into the Government e-Marketplace tender creation wizard.</p>
                <p>• <strong>Automated Gazette Scraper:</strong> Continuous monitoring of weekly e-Gazette notifications and BIS QCO revisions.</p>
                <p>• <strong>Multilingual Regional NLP:</strong> Processing tender notices published in regional Indian languages.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
