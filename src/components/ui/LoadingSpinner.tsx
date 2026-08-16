import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={32} className="animate-spin text-sky-500" />
      <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{label}</p>
    </div>
  );
}
