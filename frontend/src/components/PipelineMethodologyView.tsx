import React, { useState } from 'react';
import { 
  Workflow, 
  FileText, 
  Code, 
  Cpu, 
  Database, 
  GitBranch, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowDown, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

export const PipelineMethodologyView: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const pipelineSteps = [
    {
      step: 1,
      title: "Tender Document Ingestion & Parsing",
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      shortDesc: "Extracts text from PDF, DOCX, and raw specification text.",
      techStack: "PyPDF, python-docx, Regular Expressions, String Cleaners",
      detail: "Ingests unstructured procurement documents. Strips non-printable ASCII noise, normalizes line breaks, and extracts structured clauses from tender tables, scope summaries, and technical annexures."
    },
    {
      step: 2,
      title: "NLP Entity & Specification Extraction",
      icon: <Code className="w-5 h-5 text-indigo-600" />,
      shortDesc: "Extracts product identity, materials, grades, dimensions & tests.",
      techStack: "Rule-based Named Entity Recognition (NER), Custom Regex Matchers",
      detail: "Identifies procurement entities such as product classifications (e.g. TMT Steel, HDPE Pipes), material grades (Fe 500D, PE 100, Class A), dimensional limits, tensile strength, and quality test clauses."
    },
    {
      step: 3,
      title: "IS Reference Detection & Regex Normalization",
      icon: <Cpu className="w-5 h-5 text-sky-600" />,
      shortDesc: "Matches all Indian Standard (IS) notation variations.",
      techStack: "Deterministic Regex Automata (`IS \\d+(?:\\(Part \\d+\\))?(?::\\d{4})?`)",
      detail: "Detects various IS notations (e.g., IS 9873(P-4):2017, IS:1786-2008) and decomposes them into standard base numbers, part numbers, and cited publication years."
    },
    {
      step: 4,
      title: "Semantic Vector & Keyword Retrieval",
      icon: <Database className="w-5 h-5 text-emerald-600" />,
      shortDesc: "Dense semantic matching against the Indian Standards dataset.",
      techStack: "TF-IDF Weighted Cosine Similarity / Sentence-Transformers",
      detail: "Computes cosine similarity between tender product descriptions and standard titles, scopes, and technical keywords to surface all candidate standards."
    },
    {
      step: 5,
      title: "Standards Revision Timeline & QCO Graph",
      icon: <GitBranch className="w-5 h-5 text-amber-600" />,
      shortDesc: "Detects superseded revisions and withdrawn standards.",
      techStack: "Graph Revision Traversal & Bureau of Indian Standards (BIS) Catalog",
      detail: "Cross-checks cited standard editions against active revision timelines. If a tender cites an obsolete edition (e.g., IS 1786:1985), the engine automatically identifies the active replacement (IS 1786:2008)."
    },
    {
      step: 6,
      title: "Specification Compatibility Matrix",
      icon: <Workflow className="w-5 h-5 text-purple-600" />,
      shortDesc: "Validates technical tolerances, chemical limits & test methods.",
      techStack: "Multi-parameter Rule Evaluation Matrix",
      detail: "Performs constraint verification between tender requirements (e.g., elongation 16%, MAP 50%) and standard limits, ensuring full alignment."
    },
    {
      step: 7,
      title: "Confidence Scoring Formulation",
      icon: <Sparkles className="w-5 h-5 text-blue-600" />,
      shortDesc: "Computes composite confidence percentage.",
      techStack: "Weighted Composite Function: Entity + Revision + Spec + Semantic",
      detail: "Scores candidates based on Direct Entity Match (35%), Active Revision Alignment (25%), Specification Parameter Coverage (25%), and Semantic Overlap (15%)."
    },
    {
      step: 8,
      title: "Explainable AI (XAI) Rationale Generator",
      icon: <BookOpen className="w-5 h-5 text-teal-600" />,
      shortDesc: "Produces 5-point evidence rationale and rejection reasons.",
      techStack: "Natural Language Rationale Synthesizer",
      detail: "Generates clear, transparent justifications for procurement officers, articulating why the standard was recommended and why older editions were rejected."
    },
    {
      step: 9,
      title: "Human-in-the-Loop Signoff & Audit Logging",
      icon: <ShieldCheck className="w-5 h-5 text-rose-600" />,
      shortDesc: "Procurement officer review, approval, and tamper-proof log.",
      techStack: "Role-Based Verification Workflow, Audit Log Repository",
      detail: "Empowers the procurement officer with final discretionary authority. Records officer ID, timestamp, and verification remarks for statutory audit compliance."
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Workflow className="w-5 h-5 text-blue-600" />
          <span>AI Architecture & Recommendation Pipeline</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed visual breakdown of how IS Standard Advisor processes unstructured tender documents into verifiable Indian Standard recommendations.
        </p>
      </div>

      {/* Visual Pipeline Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-2">
          {pipelineSteps.map((item, idx) => {
            const isSelected = selectedStep === idx;
            return (
              <div
                key={item.step}
                onClick={() => setSelectedStep(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Step {item.step}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-400'}`} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.shortDesc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-600/60 shadow-lg sticky top-28 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                Pipeline Stage 0{pipelineSteps[selectedStep].step}
              </span>
              <span className="text-xs text-slate-400 font-medium">SIH26108 Methodology</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {pipelineSteps[selectedStep].icon}
                <span>{pipelineSteps[selectedStep].title}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {pipelineSteps[selectedStep].shortDesc}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Technical Implementation</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {pipelineSteps[selectedStep].detail}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Underlying Technologies & Algorithms</h4>
                <div className="p-3 bg-slate-900 text-blue-200 rounded-xl font-mono text-[11px]">
                  {pipelineSteps[selectedStep].techStack}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100 text-xs">
              <button
                disabled={selectedStep === 0}
                onClick={() => setSelectedStep(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg font-medium"
              >
                ← Previous Stage
              </button>
              <button
                disabled={selectedStep === pipelineSteps.length - 1}
                onClick={() => setSelectedStep(prev => Math.min(pipelineSteps.length - 1, prev + 1))}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg font-medium"
              >
                Next Stage →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
