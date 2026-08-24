import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-[#fffbeb] dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/50 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-200">
      <div className="max-w-[1520px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          <span className="text-[11.5px] leading-tight">
            <strong>RESEARCH & DEMO ENVIRONMENT:</strong> Operating on a curated <strong>Demo Research Dataset (28+ Standards)</strong>. Recommendations assist technical committees and require authorized officer signoff before tender gazetting.
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-amber-800 dark:text-amber-300 shrink-0 font-medium text-[11px]">
          <Info className="w-3 h-3" />
          <span>SIH26108 Evaluation Protocol</span>
        </div>
      </div>
    </div>
  );
};
