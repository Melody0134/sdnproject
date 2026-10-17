import { gamificationApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { Card, CardBody, Badge, LoadingState, ErrorState, EmptyState } from '../components/common';
import Avatar from '../components/common/Avatar';
import PageHeader from '../components/layout/PageHeader';
import { cn } from '../utils/cn';

const RANK_STYLES = {
  1: 'bg-amber-100 text-amber-700',
  2: 'bg-slate-200 text-slate-600',
  3: 'bg-orange-100 text-orange-700',
};

const LeaderboardPage = () => {
  const { user } = useAuth();
  const { data, loading, error, run } = useAsync(() => gamificationApi.leaderboard(), []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={run} />;

  const top = data?.data?.top || [];
  const me = data?.data?.me;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Bảng xếp hạng"
        description="Điểm hoạt động tính từ bài tập, trắc nghiệm, bài học hoàn thành và bình luận."
      />

      {me && (
        <Card className="mb-6 border-brand-200 bg-brand-50/40">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-brand-700 shadow-sm">
                #{me.rank}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{me.points} điểm hoạt động</p>
                <p className="text-sm text-slate-500">
                  {me.stats.submissionCount} bài nộp · {me.stats.quizAttempts} lượt trắc nghiệm · {me.stats.lessonsCompleted} bài học · {me.stats.comments} bình luận
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {me.badges.map((badge) => (
                <span
                  key={badge.key}
                  title={badge.description}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                    badge.earned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {badge.earned ? '🏅' : '🔒'} {badge.label}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {top.length === 0 ? (
        <EmptyState title="Chưa có dữ liệu" description="Chưa có sinh viên nào có hoạt động." />
      ) : (
        <Card>
          <CardBody className="p-0">
            {top.map((row) => {
              const isMe = row.student._id === user?.id;
              return (
                <div
                  key={row.student._id}
                  className={cn(
                    'flex items-center gap-3 border-b border-slate-50 px-5 py-3 last:border-0',
                    isMe && 'bg-brand-50/50'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      RANK_STYLES[row.rank] || 'bg-slate-50 text-slate-500'
                    )}
                  >
                    {row.rank}
                  </span>
                  <Avatar name={row.student.name} src={row.student.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">
                      {row.student.name}
                      {isMe && <span className="ml-1.5 text-xs font-semibold text-brand-600">(Bạn)</span>}
                    </p>
                    {row.student.major && <p className="text-xs text-slate-400">{row.student.major}</p>}
                  </div>
                  <Badge tone="brand">{row.points} điểm</Badge>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default LeaderboardPage;
