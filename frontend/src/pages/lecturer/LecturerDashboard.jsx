import { Link } from 'react-router-dom';
import { courseApi, materialApi, quizApi, teamApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Card, CardHeader, CardBody, LoadingState, Button } from '../../components/common';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/layout/PageHeader';
import { formatRelative } from '../../utils/format';

const LecturerDashboard = () => {
  const { data, loading } = useAsync(
    () =>
      Promise.all([
        courseApi.list({ mine: 'true', limit: 100 }),
        materialApi.list({ limit: 5 }),
        quizApi.list({ mine: 'true', limit: 5 }),
        teamApi.list({ limit: 100 }),
      ]),
    []
  );

  if (loading) return <LoadingState />;

  const [courses, materials, quizzes, teams] = data || [];

  return (
    <div>
      <PageHeader
        title="Bảng điều khiển giảng viên"
        description="Quản lý học phần, tài liệu, bộ câu hỏi và theo dõi hoạt động nhóm sinh viên."
        action={
          <Link to="/app/courses">
            <Button>Quản lý học phần</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Học phần phụ trách" value={courses?.pagination?.total || 0} icon="courses" tone="brand" />
        <StatCard label="Tài liệu đã đăng" value={materials?.pagination?.total || 0} icon="materials" tone="accent" />
        <StatCard label="Bộ câu hỏi" value={quizzes?.pagination?.total || 0} icon="quiz" tone="violet" />
        <StatCard label="Nhóm đang hoạt động" value={teams?.pagination?.total || 0} icon="teams" tone="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Tài liệu gần đây"
            action={<Link to="/app/materials" className="text-sm font-semibold text-brand-600 hover:underline">Quản lý</Link>}
          />
          <CardBody className="space-y-3">
            {(materials?.data || []).length === 0 ? (
              <p className="text-sm text-slate-400">Chưa có tài liệu nào.</p>
            ) : (
              (materials?.data || []).map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.course?.code} · {formatRelative(item.createdAt)}</p>
                  </div>
                  <span className="text-xs text-slate-400">{item.downloadCount} lượt tải</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Bộ câu hỏi của tôi"
            action={<Link to="/app/quizzes" className="text-sm font-semibold text-brand-600 hover:underline">Quản lý</Link>}
          />
          <CardBody className="space-y-3">
            {(quizzes?.data || []).length === 0 ? (
              <p className="text-sm text-slate-400">Chưa tạo bộ câu hỏi nào.</p>
            ) : (
              (quizzes?.data || []).map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.questionCount} câu hỏi</p>
                  </div>
                  {item.isPublished === false && (
                    <span className="text-xs font-medium text-slate-400">Nháp</span>
                  )}
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LecturerDashboard;
