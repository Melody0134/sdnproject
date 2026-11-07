import { Link, useParams } from 'react-router-dom';
import { courseApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Card, CardBody, Button, LoadingState, ErrorState, EmptyState } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import PageHeader from '../../components/layout/PageHeader';

const cellText = (grade) => {
  if (!grade || grade.status === 'missing') return '—';
  if (grade.status === 'graded') return grade.score;
  return 'Đã nộp';
};

const cellClass = (grade) => {
  if (!grade || grade.status === 'missing') return 'text-slate-300';
  if (grade.status === 'graded') return 'font-semibold text-emerald-600';
  return 'text-accent-600';
};

const CourseGradebookPage = () => {
  const { id } = useParams();
  const { data, loading, error, run } = useAsync(() => courseApi.gradebook(id), [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={run} />;

  const gradebook = data?.data;
  const assignments = gradebook?.assignments || [];
  const students = gradebook?.students || [];

  return (
    <div>
      <PageHeader
        title={`Sổ điểm — ${gradebook?.course?.code || ''}`}
        description={`${gradebook?.course?.title || ''} · ${students.length} sinh viên · ${assignments.length} bài tập`}
        action={
          <Link to="/app/courses">
            <Button variant="secondary">Quay lại</Button>
          </Link>
        }
      />

      {students.length === 0 ? (
        <EmptyState title="Chưa có sinh viên" description="Chưa có sinh viên nào ghi danh học phần này." />
      ) : (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Sinh viên</th>
                  {assignments.map((a) => (
                    <th key={a._id} className="px-4 py-3 text-center" title={a.title}>
                      {a.title.length > 16 ? `${a.title.slice(0, 16)}…` : a.title}
                      <span className="block font-normal text-slate-300">/{a.maxScore}</span>
                    </th>
                  ))}
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
                    {assignments.map((a) => {
                      const grade = row.grades[a._id];
                      return (
                        <td key={a._id} className={`px-4 py-3 text-center ${cellClass(grade)}`}>
                          {cellText(grade)}
                        </td>
                      );
                    })}
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

export default CourseGradebookPage;
