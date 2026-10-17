import { cn } from '../../utils/cn';
import Icon from './Icon';

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-orange-50 text-accent-600',
  success: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
};

const StatCard = ({ label, value, icon, tone = 'brand', hint }) => (
  <div className="card-base flex items-center gap-4 p-5">
    <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl', TONES[tone])}>
      <Icon name={icon} className="h-6 w-6" />
    </span>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  </div>
);

export default StatCard;
