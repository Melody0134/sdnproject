import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NAV_BY_ROLE } from '../../routes/navigation';
import { ROLE_LABELS } from '../../utils/constants';
import { cn } from '../../utils/cn';
import Icon from '../common/Icon';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const sections = NAV_BY_ROLE[user?.role] || [];
  const activePath = sections
    .flatMap((section) => section.items)
    .filter((item) => pathname === item.to || (!item.end && pathname.startsWith(`${item.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to;

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-[73px] items-center border-b border-slate-100 px-5 py-4">
          <img src="/logo-web.png" alt="STE - Smart Student Environment" className="h-10 w-full object-contain object-left" />
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    aria-current={activePath === item.to ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                      activePath === item.to
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-xs font-medium text-slate-400">Đăng nhập với vai trò</p>
          <p className="text-sm font-semibold text-brand-700">{ROLE_LABELS[user?.role]}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
