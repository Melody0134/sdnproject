import { cn } from '../../utils/cn';

const toneForScore = (score) => {
  if (score >= 70) return 'text-emerald-600 bg-emerald-50';
  if (score >= 45) return 'text-amber-600 bg-amber-50';
  return 'text-slate-500 bg-slate-100';
};

export const MatchScoreBadge = ({ score }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', toneForScore(score))}>
    <span className="text-base leading-none">◆</span>
    {score}% phù hợp
  </span>
);

const LABELS = {
  gpa: 'GPA',
  skills: 'Kỹ năng',
  interests: 'Sở thích',
  major: 'Ngành học',
  description: 'Mô tả',
};

export const MatchBreakdown = ({ breakdown }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
    {Object.entries(breakdown).map(([key, value]) => (
      <div key={key}>
        <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>{LABELS[key] || key}</span>
          <span>{Math.round(value * 100)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.round(value * 100)}%` }} />
        </div>
      </div>
    ))}
  </div>
);
