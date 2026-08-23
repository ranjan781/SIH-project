import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>RESEARCH & DEMO NOTICE:</strong> This application operates on a curated <strong>Demo Research Dataset</strong> (Not an Official BIS Database). All recommendations require mandatory human verification by authorized procurement officers prior to tender issuance.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-amber-800 shrink-0 font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>SIH26108 Evaluation Prototype</span>
        </div>
      </div>
    </div>
  );
};
