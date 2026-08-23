import React, { useState } from 'react';
import { 
  Workflow, 
  FileText, 
  Code, 
  Cpu, 
  Database, 
  GitBranch, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const PipelineMethodologyView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<number>(0);

  const pipelineNodes = [
    {
      id: 0,
      name: "Document Ingestion",
      icon: <FileText className="w-4 h-4" />,
      whatItDoes: "Parses PDF, DOCX, and text procurement documents, strips ASCII control noise, and standardizes technical clause formatting.",
      input: "Unstructured tender files (PDF / DOCX / TXT)",
      output: "Sanitized clean technical clause text stream",
      tech: "PyPDF, python-docx, ASCII RegEx cleaners"
    },
    {
      id: 1,
      name: "NLP Entity Extraction",
      icon: <Code className="w-4 h-4" />,
      whatItDoes: "Extracts product identity, procurement categories, materials, grades, dimensions, and testing constraints.",
      input: "Clean clause text",
      output: "Structured entities (Grade: Fe 500D, Material: TMT Steel)",
      tech: "Custom Named Entity Recognition (NER) automata"
    },
    {
      id: 2,
      name: "IS Regex Normalizer",
      icon: <Cpu className="w-4 h-4" />,
      whatItDoes: "Decomposes and normalizes heterogeneous standard notations (e.g. IS 9873(P-4):2017) into canonical base numbers and cited years.",
      input: "Tender strings matching IS pattern variations",
      output: "Base IS, Part, and publication year tuple",
      tech: "Deterministic RegEx Automata"
    },
    {
      id: 3,
      name: "Revision Knowledge Graph",
      icon: <GitBranch className="w-4 h-4" />,
      whatItDoes: "Cross-checks cited standard editions against historical revision timelines to detect superseded or withdrawn standards.",
      input: "Cited IS base number and year",
      output: "Active current replacement standard & QCO order",
      tech: "Temporal Revision Graph Traversal"
    },
    {
      id: 4,
      name: "Vector & Semantic Retrieval",
      icon: <Database className="w-4 h-4" />,
      whatItDoes: "Performs dense semantic vector similarity matching between extracted product requirements and candidate standards scopes.",
      input: "Tender product description & technical keywords",
      output: "Ranked candidate standards by cosine similarity",
      tech: "TF-IDF Weighted Cosine Similarity"
    },
    {
      id: 5,
      name: "Specification Compatibility Rule Engine",
      icon: <Workflow className="w-4 h-4" />,
      whatItDoes: "Validates technical constraints, material grades, tensile/proof stress parameters, and mandatory testing standards.",
      input: "Extracted specs vs Standard parameter limits",
      output: "Multi-parameter match score matrix",
      tech: "Constraint Satisfaction Rule Matrix"
    },
    {
      id: 6,
      name: "Confidence Scoring Calculator",
      icon: <Sparkles className="w-4 h-4" />,
      whatItDoes: "Computes composite confidence score C(S, T) weighting entity match, revision status, specification alignment, and semantic overlap.",
      input: "Individual component sub-scores",
      output: "Composite confidence percentage (0% - 100%)",
      tech: "Multi-Objective Weighted Scoring Function"
    },
    {
      id: 7,
      name: "Explainable AI (XAI) Generator",
      icon: <BookOpen className="w-4 h-4" />,
      whatItDoes: "Produces 5-point evidence-backed natural language justifications explaining why the standard was recommended and why older editions were flagged.",
      input: "Evaluation result & gap analysis data",
      output: "Human-readable procurement compliance report",
      tech: "Natural Language Rationale Synthesizer"
    },
    {
      id: 8,
      name: "Human-in-the-Loop Signoff",
      icon: <ShieldCheck className="w-4 h-4" />,
      whatItDoes: "Provides authorized procurement officers with discretionary review, signoff, and tamper-evident audit logging.",
      input: "Officer decision (Accept / Flag / Reject) & remarks",
      output: "Official compliance certificate & audit log entry",
      tech: "Role-Based Verification & Audit Repository"
    }
  ];

  const current = pipelineNodes[activeNode];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-page-enter">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
            Architecture
          </span>
          <span className="text-xs text-slate-400">SIH26108 Pipeline Walkthrough</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          End-to-End AI Recommendation Pipeline Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Interactive node graph showing how unstructured tender text is ingested, parsed, verified across BIS revision graphs, and synthesized into explainable recommendations.
        </p>
      </div>

      {/* Connected Nodes Visual Flow */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Interactive Pipeline Nodes (Click any node to inspect Input / Output)
        </h2>

        {/* Nodes Horizontal / Grid Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {pipelineNodes.map((node, idx) => {
            const isActive = activeNode === idx;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNode(idx)}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all card-hover-lift ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-mono font-bold ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    0{idx + 1}
                  </span>
                  <div className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                    {node.icon}
                  </div>
                </div>
                <div className="text-[11px] font-bold tracking-tight line-clamp-2">
                  {node.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Node Detail Inspection Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-300 dark:border-slate-700 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-mono font-bold">
              0{current.id + 1}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{current.name}</h3>
          </div>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded font-semibold">
            Technology: {current.tech}
          </span>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">What This Stage Does</h4>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
            {current.whatItDoes}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Data Input</span>
            <p className="font-mono text-slate-800 dark:text-slate-200 text-[11.5px]">{current.input}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Data Output</span>
            <p className="font-mono text-slate-800 dark:text-slate-200 text-[11.5px]">{current.output}</p>
          </div>
        </div>

        {/* Stepper controls */}
        <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            disabled={activeNode === 0}
            onClick={() => setActiveNode(prev => Math.max(0, prev - 1))}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
          >
            ← Previous Node
          </button>
          <span className="text-slate-400 font-mono text-[11px]">Node {activeNode + 1} of {pipelineNodes.length}</span>
          <button
            disabled={activeNode === pipelineNodes.length - 1}
            onClick={() => setActiveNode(prev => Math.min(pipelineNodes.length - 1, prev + 1))}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-medium"
          >
            Next Node →
          </button>
        </div>
      </div>
    </div>
  );
};
