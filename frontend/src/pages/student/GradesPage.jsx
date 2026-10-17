import { assignmentApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Card, CardBody, Badge, LoadingState, ErrorState, EmptyState } from '../../components/common';
import PageHeader from '../../components/layout/PageHeader';

const GradesPage = () => {
  const { data, loading, error, run } = useAsync(() => assignmentApi.myGradebook(), []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={run} />;

  const assignments = data?.data?.assignments || [];
  const quizzes = data?.data?.quizzes || [];
  const empty = assignments.length === 0 && quizzes.length === 0;

  return (
    <div>
      <PageHeader title="Điểm số của tôi" description="Tổng hợp kết quả bài tập và bài trắc nghiệm của bạn." />

      {empty && <EmptyState title="Chưa có điểm" description="Bạn chưa có bài tập hoặc trắc nghiệm nào được ghi nhận." />}

      {assignments.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Bài tập</h2>
          <div className="space-y-3">
            {assignments.map((item) => (
              <Card key={item.assignmentId}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.course?.code || ''}</p>
                    {item.feedback && <p className="mt-1 text-sm text-slate-500">Nhận xét: {item.feedback}</p>}
                  </div>
                  {item.status === 'graded' ? (
                    <span className="text-lg font-bold text-brand-600">
                      {item.score}/{item.maxScore}
                    </span>
                  ) : (
                    <Badge tone="accent">Chờ chấm</Badge>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {quizzes.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Trắc nghiệm</h2>
          <div className="space-y-3">
            {quizzes.map((item) => (
              <Card key={item.quizId}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      {item.course?.code ? `${item.course.code} · ` : ''}
                      {item.attempts} lượt làm
                    </p>
                  </div>
                  <span className="text-lg font-bold text-brand-600">
                    {item.bestScore}/{item.totalQuestions}
                  </span>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default GradesPage;
