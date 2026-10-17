import { cn } from '../../utils/cn';

export const Input = ({ label, error, className, id, ...props }) => (
  <div className={className}>
    {label && (
      <label htmlFor={id} className="label-base">
        {label}
      </label>
    )}
    <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={cn('input-base', error && 'border-rose-400 focus:ring-rose-100')} {...props} />
    {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className, id, rows = 4, ...props }) => (
  <div className={className}>
    {label && (
      <label htmlFor={id} className="label-base">
        {label}
      </label>
    )}
    <textarea
      id={id}
      rows={rows}
      className={cn('input-base resize-y', error && 'border-rose-400 focus:ring-rose-100')}
      aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props}
    />
    {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);

export const Select = ({ label, error, className, id, children, ...props }) => (
  <div className={className}>
    {label && (
      <label htmlFor={id} className="label-base">
        {label}
      </label>
    )}
    <select id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={cn('input-base', error && 'border-rose-400')} {...props}>
      {children}
    </select>
    {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);
