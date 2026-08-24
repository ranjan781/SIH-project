import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, CheckCircle2, XCircle,
  ExternalLink, X, Database, Loader2, BookOpen,
  Hash, ShieldCheck, FileText, RefreshCw
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { StandardRecord } from '../types';

interface StandardsExplorerViewProps {
  standards?: StandardRecord[];
}

const CSV_CATEGORIES = [
  'Cement & Concrete', 'Steel & Metal Products', 'Water Supply & Pipes',
  'Electrical & Wiring', 'Safety Equipment', 'Plastic Products',
  'Bricks & Clay Products', 'Timber & Wood Products', 'Paints & Coatings',
  'Aggregates & Sand', 'Adhesives', 'Furniture',
];

export const StandardsExplorerView: React.FC<StandardsExplorerViewProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [catalogResults, setCatalogResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(152);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // IS Number direct lookup state
  const [isLookupInput, setIsLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ApiService.getCatalogStats().then(stats => {
      setTotalCount(stats.total_standards || 152);
    });
    loadCatalog('', 'all');
  }, []);

  const loadCatalog = useCallback(async (query: string, category: string) => {
    setIsLoading(true);
    try {
      const results = await ApiService.searchCatalog(query, category === 'all' ? undefined : category, 40);
      setCatalogResults(results);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadCatalog(searchTerm, selectedCategory);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm, selectedCategory, loadCatalog]);

  const handleIsLookup = async () => {
    if (!isLookupInput.trim()) return;
    setIsLookupLoading(true);
    setLookupResult(null);
    try {
      const result = await ApiService.lookupStandard(isLookupInput.trim());
      setLookupResult(result);
    } finally {
      setIsLookupLoading(false);
    }
  };

  const getCertBadge = (cert: string) => {
    if (!cert) return null;
    const lower = cert.toLowerCase();
    if (lower.startsWith('yes')) return { label: 'ISI Mark Required', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    if (lower.includes('not applicable')) return { label: 'Guidelines Standard', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
    return { label: cert.slice(0, 30), cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              BIS Standard Corpus
            </span>
            <span className="text-xs text-slate-400 font-mono">bis_standards_dataset_expanded.csv</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Indian Standards (IS) Catalog Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Search all {totalCount} indexed Indian Standards across 12 procurement sectors with live TF-IDF vector similarity.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{totalCount}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Standards</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">12</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Sectors</div>
          </div>
        </div>
      </div>

      {/* IS Number Lookup Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Direct IS Standard Lookup</h2>
          <span className="text-xs text-slate-400">— Lookup by exact IS number string</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={isLookupInput}
            onChange={e => setIsLookupInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleIsLookup()}
            placeholder="Enter IS number (e.g. IS 1786:2008, IS 269:2015, IS 4984:2016...)"
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
          />
          <button
            onClick={handleIsLookup}
            disabled={isLookupLoading || !isLookupInput.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isLookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Lookup
          </button>
        </div>

        {lookupResult && (
          <div className={`p-4 rounded-xl border text-xs ${
            lookupResult.found === false
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          }`}>
            {lookupResult.found === false ? (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{lookupResult.message || `Standard not found.`}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{lookupResult.IS_number}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {lookupResult.category}
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{lookupResult.title}</div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{lookupResult.scope_description}</p>
                <div className="flex gap-4 pt-1 text-slate-500 flex-wrap">
                  <span>Version: <strong className="text-slate-800 dark:text-slate-200">{lookupResult.latest_version}</strong></span>
                  <span>Amendment: <strong className="text-slate-800 dark:text-slate-200">{lookupResult.amendment || '—'}</strong></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by IS number, product title, keyword..."
            className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="all">All 12 Sectors</option>
            {CSV_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-200 transition-colors font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>

          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {CSV_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Showing {catalogResults.length} Standards
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">TF-IDF Vector Search</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">IS Number</th>
                <th className="px-5 py-3">Title & Scope</th>
                <th className="px-5 py-3">Sector</th>
                <th className="px-5 py-3">Version</th>
                <th className="px-5 py-3">Amendment</th>
                <th className="px-5 py-3">Certification</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {catalogResults.length > 0 ? (
                catalogResults.map((rec, idx) => {
                  const certBadge = getCertBadge(rec.certification_required);
                  return (
                    <tr
                      key={`${rec.IS_number}-${idx}`}
                      onClick={() => setSelectedRecord(rec)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {rec.IS_number}
                        {rec.similarity_score > 0 && (
                          <div className="text-[10px] text-blue-600 font-sans font-normal">
                            {(rec.similarity_score * 100).toFixed(0)}% match
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 max-w-sm">
                        <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{rec.title}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{rec.scope_description}</p>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {rec.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-[130px]">
                        <span className="line-clamp-2">{rec.latest_version}</span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <span>{rec.amendment || '—'}</span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {certBadge && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${certBadge.cls}`}>
                            {certBadge.label.startsWith('ISI') ? <ShieldCheck className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                            {certBadge.label}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5">
                          View <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching BIS dataset...</span>
                      </div>
                    ) : (
                      'No standards found matching your search. Try a different keyword.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl border border-slate-300 dark:border-slate-700 animate-fadeIn">
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between rounded-t-2xl sticky top-0 z-10 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200">
                    {selectedRecord.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedRecord.latest_version}</span>
                </div>
                <h3 className="text-lg font-bold mt-1.5 font-mono">{selectedRecord.IS_number}</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{selectedRecord.title}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-1">Standard Scope</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedRecord.scope_description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-1">Latest Version</h4>
                  <p className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200">
                    {selectedRecord.latest_version}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-1">Amendment Status</h4>
                  <p className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    {selectedRecord.amendment || '—'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-1">Certification Requirement</h4>
                <p className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">
                  {selectedRecord.certification_required || 'Not specified'}
                </p>
              </div>

              {selectedRecord.normative_refs && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider mb-1.5">
                    Normative Reference Standards
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.normative_refs.split(';').map((ref: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg font-mono text-xs">
                        {ref.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
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
