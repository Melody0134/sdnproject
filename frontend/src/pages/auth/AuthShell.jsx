import Icon from '../../components/common/Icon';

const HIGHLIGHTS = [
  { title: 'AI Teammate Matching', desc: 'Ghép nhóm đồ án dựa trên GPA, kỹ năng, ngành học và mối quan tâm.' },
  { title: 'Tài liệu học tập tin cậy', desc: 'Kho tài liệu do giảng viên kiểm duyệt kèm quiz ôn tập tự động.' },
  { title: 'Không gian làm việc nhóm', desc: 'Chia sẻ tài liệu, liên kết và quản lý thành viên trong một nơi.' },
];

const AuthShell = ({ title, subtitle, children }) => (
  <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white lg:flex">
      <div className="flex items-center">
        <div className="rounded-2xl bg-white px-4 py-2 shadow-lg shadow-brand-900/10">
          <img src="/logo-web.png" alt="STE - Smart Student Environment" className="h-12 w-auto max-w-[240px] object-contain" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold leading-snug">
          Môi trường học tập thông minh
          <br />
          dành cho sinh viên FPT
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/70">
          AI không thay thế tư duy học thuật, mà hỗ trợ tiếp cận nguồn tri thức đáng tin cậy.
        </p>
        <div className="mt-8 space-y-4">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Icon name="check" className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/50">© 2026 STE · Đại học FPT</p>
    </div>

    <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
);

export default AuthShell;
