import { cn } from '../../utils/cn';
import { initialsOf } from '../../utils/format';

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };

const Avatar = ({ name, src, size = 'md', className }) => {
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', SIZES[size], className)} />;
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700',
        SIZES[size],
        className
      )}
    >
      {initialsOf(name)}
    </span>
  );
};

export default Avatar;
