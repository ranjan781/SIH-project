import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  X, 
  Layers
} from 'lucide-react';
import type { StandardRecord } from '../types';

interface StandardsExplorerViewProps {
  standards: StandardRecord[];
}

export const StandardsExplorerView: React.FC<StandardsExplorerViewProps> = ({ standards }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStandard, setSelectedStandard] = useState<StandardRecord | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(standards.map(s => s.category))).sort();
  }, [standards]);

  const filteredStandards = useMemo(() => {
    return standards.filter(s => {
      const matchCat = selectedCategory === 'all' || s.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchStatus = selectedStatus === 'all' || s.status.toLowerCase() === selectedStatus.toLowerCase();
      
      const q = searchTerm.toLowerCase().trim();
      const matchQuery = !q || (
        s.is_number.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.scope.toLowerCase().includes(q) ||
        s.keywords.some(k => k.toLowerCase().includes(q)) ||
        s.applicable_products.some(p => p.toLowerCase().includes(q))
      );

      return matchCat && matchStatus && matchQuery;
    });
  }, [standards, selectedCategory, selectedStatus, searchTerm]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 animate-page-enter">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              BIS Corpus
            </span>
            <span className="text-xs text-slate-400">Research Standards Repository</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Indian Standards (IS) Catalog Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search active specifications, superseded revision histories, quality control orders, and prescribed test methods.
          </p>
        </div>

        <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
          {filteredStandards.length} of {standards.length} Standards
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search standard (e.g. IS 1786), product, or keyword..."
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-800 focus:outline-none"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-1 focus:ring-slate-800 focus:outline-none"
          >
            <option value="all">All Sectors ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-1 focus:ring-slate-800 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Current">Current (Active)</option>
            <option value="Superseded">Superseded</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Standards Table (Compact, clean rows) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-2.5">IS Number</th>
                <th className="px-4 py-2.5">Standard Title & Scope</th>
                <th className="px-4 py-2.5">Product Sector</th>
                <th className="px-4 py-2.5">Edition Year</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Mandatory QCO</th>
                <th className="px-4 py-2.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStandards.length > 0 ? (
                filteredStandards.map((std) => {
                  const isCurrent = std.status === 'Current';
                  const isSuperseded = std.status === 'Superseded';

                  return (
                    <tr 
                      key={std.id} 
                      onClick={() => setSelectedStandard(std)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {std.is_number}
                        {std.amendments.length > 0 && (
                          <div className="text-[10px] text-slate-500 font-sans font-normal">
                            {std.amendments.length} Amd
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-sm">
                        <div className="font-semibold text-slate-800 line-clamp-1">{std.title}</div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{std.scope}</p>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                        {std.category}
                      </td>

                      <td className="px-4 py-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {std.current_edition_year}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isCurrent 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : (isSuperseded ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200')
                        }`}>
                          {isCurrent ? <CheckCircle2 className="w-3 h-3" /> : (isSuperseded ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />)}
                          <span>{std.status}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-xs text-[11px] text-slate-600">
                        {std.mandatory_qco ? (
                          <span className="line-clamp-1 text-slate-800 font-medium">
                            {std.mandatory_qco}
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard guidelines</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-0.5">
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No standards matching the filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Profile Drawer */}
      {selectedStandard && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl border border-slate-300 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-[#0f172a] text-white flex items-start justify-between rounded-t-xl sticky top-0 z-10 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                    {selectedStandard.category}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    selectedStandard.status === 'Current' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {selectedStandard.status}
                  </span>
                </div>
                <h3 className="text-base font-bold mt-1 font-mono">{selectedStandard.is_number}</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{selectedStandard.title}</p>
              </div>

              <button
                onClick={() => setSelectedStandard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1">Standard Scope</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedStandard.scope}
                </p>
              </div>

              {selectedStandard.mandatory_qco && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1">
                    Quality Control Order (QCO)
                  </h4>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
                    {selectedStandard.mandatory_qco}
                  </p>
                </div>
              )}

              {/* Revision Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1.5">Revision Timeline</h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedStandard.revisions_timeline.map((yr, idx) => (
                    <span 
                      key={idx}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        yr === selectedStandard.current_edition_year 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {yr} {yr === selectedStandard.current_edition_year && '★ Current'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Applicable Products */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1">Applicable Products</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedStandard.applicable_products.map((prod, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium">
                      {prod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testing Standards */}
              {selectedStandard.testing_methods.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1">Prescribed Testing Methods</h4>
                  <ul className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                    {selectedStandard.testing_methods.map((test, i) => (
                      <li key={i} className="text-slate-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parameters */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1">Technical Parameters</h4>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[10.5px] font-mono overflow-x-auto">
                  {JSON.stringify(selectedStandard.technical_parameters, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStandard(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
