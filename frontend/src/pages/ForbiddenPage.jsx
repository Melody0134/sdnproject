import { Link } from 'react-router-dom';

const ForbiddenPage = () => <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="text-sm font-semibold text-brand-600">403</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Bạn không có quyền truy cập</h1><p className="mt-2 text-slate-500">Tài khoản hiện tại không được phép xem khu vực này.</p><Link to="/app" className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Về bảng điều khiển</Link></div>;

export default ForbiddenPage;
