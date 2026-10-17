import { Link } from 'react-router-dom';

const NotFoundPage = () => <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="text-sm font-semibold text-brand-600">404</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Không tìm thấy trang</h1><p className="mt-2 text-slate-500">Đường dẫn này không tồn tại hoặc đã được thay đổi.</p><Link to="/app" className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Về bảng điều khiển</Link></div>;

export default NotFoundPage;
