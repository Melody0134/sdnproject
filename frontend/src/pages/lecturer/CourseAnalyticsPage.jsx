import { Link, useParams } from 'react-router-dom';
import { courseApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Card, CardBody, Badge, Button, LoadingState, ErrorState, EmptyState } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import PageHeader from '../../components/layout/PageHeader';

const CourseAnalyticsPage = () => {
  const { id } = useParams();
  const { data, loading, error, run } = useAsync(() => courseApi.analytics(id), [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={run} />;

  const analytics = data?.data;
  const totals = analytics?.totals || {};
  const students = analytics?.students || [];

  const summary = [
    { label: 'Sinh viên', value: totals.students || 0 },
    { label: 'Bài tập', value: totals.assignments || 0 },
    { label: 'Trắc nghiệm', value: totals.quizzes || 0 },
    { label: 'Bài học', value: totals.lessons || 0 },
    { label: 'Có nguy cơ', value: totals.atRisk || 0, danger: true },
  ];

  return (
    <div>
      <PageHeader
        title={`Phân tích lớp — ${analytics?.course?.code || ''}`}
        description={analytics?.course?.title || ''}
        action={
          <Link to="/app/courses">
            <Button variant="secondary">Quay lại</Button>
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardBody className="py-4 text-center">
              <p className={'text-2xl font-bold ' + (item.danger ? 'text-rose-600' : 'text-brand-600')}>{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {students.length === 0 ? (
        <EmptyState title="Chưa có sinh viên" description="Chưa có sinh viên nào ghi danh học phần này." />
      ) : (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Sinh viên</th>
                  <th className="px-4 py-3 text-center">Bài nộp</th>
                  <th className="px-4 py-3 text-center">Điểm TB</th>
                  <th className="px-4 py-3 text-center">Trắc nghiệm</th>
                  <th className="px-4 py-3 text-center">Bài học</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {students.map((row) => (
                  <tr key={row.student._id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={row.student.name} src={row.student.avatarUrl} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800">{row.student.name}</p>
                          <p className="text-xs text-slate-400">{row.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {row.submittedCount}/{row.totalAssignments}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.avgPercent == null ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className={row.avgPercent < 50 ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-600'}>
                          {row.avgPercent}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{row.quizAttempts}</td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {row.lessonsCompleted}/{row.totalLessons}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.atRisk ? <Badge tone="danger">Nguy cơ</Badge> : <Badge tone="success">Ổn định</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default CourseAnalyticsPage;
