import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm">{subtitle}</p>}
    </div>
  );
}
