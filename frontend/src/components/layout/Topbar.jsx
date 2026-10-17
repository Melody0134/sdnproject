import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import NotificationBell from './NotificationBell';

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Mở menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-800">Xin chào, {user?.name?.split(' ').slice(-1)[0]} 👋</p>
          <p className="text-xs text-slate-400">Chúc bạn một ngày học tập hiệu quả</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100"
          >
            <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user?.name}</span>
          </button>
          {menuOpen && (
            <div className="animate-fade-in absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-float">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <p className="mt-1 text-xs font-medium text-brand-600">{ROLE_LABELS[user?.role]}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                <Icon name="logout" className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
