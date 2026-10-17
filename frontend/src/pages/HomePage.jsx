import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon';
import { useAuth } from '../context/AuthContext';

const PILLARS = [
  {
    number: '01',
    icon: 'teams',
    title: 'Đồng đội hợp gu',
    description: 'Tìm người cùng môn học, kỹ năng và cách làm việc để mỗi dự án đi xa hơn.',
  },
  {
    number: '02',
    icon: 'courses',
    title: 'Lộ trình rõ ràng',
    description: 'Gom khóa học, tài liệu và deadline vào đúng nơi bạn cần nhìn thấy.',
  },
  {
    number: '03',
    icon: 'sparkles',
    title: 'Tiến bộ có chủ đích',
    description: 'Biến việc học mỗi ngày thành những bước nhỏ có thể bắt đầu ngay.',
  },
];

const HomePage = () => {
  const { user } = useAuth();
  const actionHref = user ? '/app' : '/register';

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fb] text-[#111a35]">
      <section className="relative border-b border-[#dce3f1]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(33,59,145,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(33,59,145,0.055)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_88%)]" />
        <div className="pointer-events-none absolute right-[-9rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-[#d9e4ff] blur-3xl" />

        <nav className="relative mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link to="/" aria-label="STE trang chủ" className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-[#dce3f1] transition hover:-translate-y-0.5">
            <img src="/logo-web.png" alt="STE - Smart Student Environment" className="h-9 w-auto max-w-[180px] object-contain" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold sm:gap-5">
            <a href="#why-ste" className="hidden text-[#52617f] transition hover:text-[#2447d1] md:inline">Vì sao STE?</a>
            {!user && <Link to="/login" className="hidden text-[#52617f] transition hover:text-[#2447d1] sm:inline">Đăng nhập</Link>}
            <Link to={actionHref} className="inline-flex items-center gap-2 rounded-lg bg-[#2447d1] px-4 py-2.5 text-white shadow-lg shadow-[#2447d1]/20 transition hover:-translate-y-0.5 hover:bg-[#1f38a8] focus:outline-none focus:ring-2 focus:ring-[#2447d1] focus:ring-offset-2">
              {user ? 'Mở ứng dụng' : 'Tham gia STE'}
              <Icon name="link" className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-10 lg:pb-24 lg:pt-16">
          <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-16">
            <div className="relative max-w-xl">
              <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.19em] text-[#f26a1b]"><span className="h-px w-8 bg-[#f26a1b]" /> Built for FPT students</p>
              <h1 className="max-w-[620px] text-[3.3rem] font-black leading-[0.97] tracking-[-0.065em] text-[#111a35] sm:text-6xl lg:text-[5rem]">Học tốt hơn,<span className="block text-[#2447d1]">cùng nhau.</span></h1>
              <p className="mt-7 max-w-[34rem] text-base leading-7 text-[#52617f] sm:text-lg sm:leading-8">Một không gian để tìm đồng đội, quản lý môn học và biến ý tưởng thành kết quả.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link to={actionHref} className="inline-flex items-center gap-3 rounded-lg bg-[#f26a1b] px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#f26a1b]/20 transition hover:-translate-y-0.5 hover:bg-[#dc5510] active:translate-y-px focus:outline-none focus:ring-2 focus:ring-[#f26a1b] focus:ring-offset-2">{user ? 'Vào không gian học tập' : 'Bắt đầu miễn phí'}<Icon name="search" className="h-4 w-4" /></Link>
                <a href="#why-ste" className="inline-flex items-center gap-2 px-1 py-3 text-sm font-bold text-[#52617f] transition hover:text-[#2447d1]">Xem cách STE hoạt động <span aria-hidden="true">↓</span></a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8092c0]"><span>Quick facts</span></div>
              <div className="space-y-2">
                <div className="grid grid-cols-[56px_1fr] gap-5 rounded-xl py-6 transition hover:bg-white/70">
                  <span className="font-mono text-sm font-bold text-[#f26a1b]">01</span>
                  <div><h2 className="text-xl font-black tracking-tight text-[#111a35]">Team matching</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#52617f]">Tìm đồng đội có kỹ năng và mục tiêu phù hợp với bạn.</p></div>
                </div>
                <div className="grid grid-cols-[56px_1fr] gap-5 rounded-xl py-6 transition hover:bg-white/70">
                  <span className="font-mono text-sm font-bold text-[#2447d1]">02</span>
                  <div><h2 className="text-xl font-black tracking-tight text-[#111a35]">Course workspace</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#52617f]">Quản lý môn học, tài liệu và deadline trong một không gian.</p></div>
                </div>
                <div className="grid grid-cols-[56px_1fr] gap-5 rounded-xl py-6 transition hover:bg-white/70">
                  <span className="font-mono text-sm font-bold text-[#2447d1]">03</span>
                  <div><h2 className="text-xl font-black tracking-tight text-[#111a35]">Student community</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#52617f]">Chia sẻ kiến thức và cùng nhau tạo nên những dự án tốt hơn.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-ste" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2447d1]">Một nền tảng, nhiều bước tiến</p>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[#111a35] sm:text-4xl">Mọi thứ bạn cần để học và làm việc nhóm tốt hơn.</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-12">
          {PILLARS.map((pillar, index) => (
            <article key={pillar.number} className={`group relative overflow-hidden rounded-2xl border border-[#dce3f1] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#aebff1] hover:shadow-[0_20px_45px_-28px_rgba(36,71,209,0.6)] ${index === 0 ? 'bg-[#111a35] text-white md:col-span-5' : index === 1 ? 'bg-white md:col-span-4' : 'bg-[#e8efff] md:col-span-3'}`}>
              <div className="flex items-start justify-between"><span className={`font-mono text-xs font-bold ${index === 0 ? 'text-[#f7a77c]' : 'text-[#8092c0]'}`}>{pillar.number}</span><Icon name={pillar.icon} className={`h-5 w-5 ${index === 0 ? 'text-[#f7a77c]' : 'text-[#2447d1]'}`} /></div>
              <h3 className="mt-16 text-xl font-black tracking-tight">{pillar.title}</h3>
              <p className={`mt-3 text-sm leading-6 ${index === 0 ? 'text-white/65' : 'text-[#52617f]'}`}>{pillar.description}</p>
              <span className={`absolute -bottom-5 -right-2 text-[8rem] font-black leading-none transition group-hover:translate-x-1 ${index === 0 ? 'text-white/[0.04]' : 'text-[#2447d1]/[0.06]'}`}>{pillar.number}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#dce3f1] bg-[#e8efff]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-10 lg:py-16">
          <div><p className="text-2xl font-black tracking-tight text-[#111a35]">Bước tiếp theo của bạn bắt đầu từ đây.</p><p className="mt-2 text-sm text-[#52617f]">Tạo tài khoản và tìm không gian học tập phù hợp.</p></div>
          <Link to={actionHref} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2447d1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1f38a8] focus:outline-none focus:ring-2 focus:ring-[#2447d1] focus:ring-offset-2">{user ? 'Mở ứng dụng' : 'Tạo tài khoản'} <Icon name="link" className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
