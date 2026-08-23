import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  X, 
  FileText,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { StandardRecord } from '../types';

interface StandardsExplorerViewProps {
  standards: StandardRecord[];
}

export const StandardsExplorerView: React.FC<StandardsExplorerViewProps> = ({ standards }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStandard, setSelectedStandard] = useState<StandardRecord | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(standards.map(s => s.category))).sort();
  }, [standards]);

  // Filtered standards
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Indian Standards (IS) Catalog Explorer</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search and explore curated Indian Standards specifications, testing protocols, amendments, and Quality Control Orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
            {filteredStandards.length} of {standards.length} Standards Shown
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search IS number (e.g. IS 1786), product, or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Current">Current (Active)</option>
            <option value="Superseded">Superseded</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Standards Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">IS Number</th>
                <th className="px-5 py-3.5">Title & Scope</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Year</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Quality Control Order (QCO)</th>
                <th className="px-5 py-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStandards.length > 0 ? (
                filteredStandards.map((std) => {
                  const isCurrent = std.status === 'Current';
                  const isSuperseded = std.status === 'Superseded';
                  const isWithdrawn = std.status === 'Withdrawn';

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* IS Number */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {std.is_number}
                        {std.amendments.length > 0 && (
                          <div className="text-[10px] text-blue-600 font-sans font-medium mt-0.5">
                            {std.amendments.length} Amendments
                          </div>
                        )}
                      </td>

                      {/* Title */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="font-semibold text-slate-800 line-clamp-1">{std.title}</div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{std.scope}</p>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 font-medium text-slate-700 whitespace-nowrap">
                        {std.category}
                      </td>

                      {/* Year */}
                      <td className="px-5 py-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {std.current_edition_year}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isCurrent 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : (isSuperseded ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                        }`}>
                          {isCurrent ? <CheckCircle2 className="w-3 h-3" /> : (isSuperseded ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />)}
                          <span>{std.status}</span>
                        </span>
                      </td>

                      {/* Mandatory QCO */}
                      <td className="px-5 py-4 max-w-xs text-[11px] text-slate-600">
                        {std.mandatory_qco ? (
                          <span className="line-clamp-2 text-indigo-950 font-medium bg-indigo-50/60 p-1.5 rounded border border-indigo-100">
                            {std.mandatory_qco}
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard BIS guidelines</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStandard(std)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No Indian Standards matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standard Details Modal Drawer */}
      {selectedStandard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between rounded-t-2xl sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    {selectedStandard.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedStandard.status === 'Current' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {selectedStandard.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1 font-mono">{selectedStandard.is_number}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedStandard.title}</p>
              </div>

              <button
                onClick={() => setSelectedStandard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Standard Scope</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedStandard.scope}
                </p>
              </div>

              {selectedStandard.mandatory_qco && (
                <div>
                  <h4 className="font-bold text-indigo-950 uppercase text-[11px] mb-1">
                    Mandatory Quality Control Order (QCO)
                  </h4>
                  <p className="text-indigo-900 bg-indigo-50 p-3 rounded-xl border border-indigo-200 font-medium">
                    {selectedStandard.mandatory_qco}
                  </p>
                </div>
              )}

              {/* Revision Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2">Historical Revisions Timeline</h4>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedStandard.revisions_timeline.map((yr, idx) => (
                    <span 
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        yr === selectedStandard.current_edition_year 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {yr} {yr === selectedStandard.current_edition_year && '★ Current'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Applicable Products */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1.5">Applicable Products</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStandard.applicable_products.map((prod, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-medium">
                      {prod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testing Protocols */}
              {selectedStandard.testing_methods.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1.5">Prescribed Testing Standards</h4>
                  <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedStandard.testing_methods.map((test, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span className="font-mono">{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Parameters */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1.5">Technical Specifications & Limits</h4>
                <pre className="p-3 bg-slate-900 text-blue-200 rounded-xl text-[11px] font-mono overflow-x-auto">
                  {JSON.stringify(selectedStandard.technical_parameters, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStandard(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
