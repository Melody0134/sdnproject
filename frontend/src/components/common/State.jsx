import { cn } from '../../utils/cn';

export const Spinner = ({ className }) => (
  <span
    className={cn('inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent', className)}
  />
);

export const LoadingState = ({ label = 'Đang tải dữ liệu...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
    <Spinner />
    <p className="text-sm">{label}</p>
  </div>
);

export const EmptyState = ({ title = 'Chưa có dữ liệu', description, icon, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/50 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
      {icon || (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      )}
    </div>
    <div>
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);

export const ErrorState = ({ message = 'Đã xảy ra lỗi', onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
    <p className="text-sm font-medium text-rose-600">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="text-sm font-semibold text-brand-600 hover:underline">
        Thử lại
      </button>
    )}
  </div>
);
