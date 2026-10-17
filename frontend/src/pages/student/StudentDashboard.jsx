import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teamApi, joinRequestApi, announcementApi, postApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Card, CardHeader, CardBody, LoadingState, EmptyState, Badge, Button } from '../../components/common';
import StatCard from '../../components/common/StatCard';
import { MatchScoreBadge } from '../../components/common/MatchScore';
import PageHeader from '../../components/layout/PageHeader';
import { formatRelative } from '../../utils/format';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { data, loading } = useAsync(
    () =>
      Promise.all([
        teamApi.recommended({ limit: 3 }),
        teamApi.mine(),
        joinRequestApi.mine({ status: 'pending' }),
        announcementApi.list({ limit: 4 }),
        postApi.list({ type: 'event', limit: 3 }),
      ]),
    []
  );

  if (loading) return <LoadingState />;

  const [recommended, myTeams, pendingRequests, announcements, events] = data || [];
  const recommendations = recommended?.data?.recommendations || [];
  const teams = myTeams?.data?.teams || [];

  return (
    <div>
      <PageHeader
        title="Bảng điều khiển"
        description="Theo dõi nhóm, gợi ý ghép đội và thông tin học vụ mới nhất của bạn."
        action={
          <Link to="/app/teams/discover">
            <Button>Tìm nhóm với AI</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Nhóm của tôi" value={teams.length} icon="teams" tone="brand" />
        <StatCard label="Yêu cầu đang chờ" value={pendingRequests?.pagination?.total || 0} icon="requests" tone="accent" />
        <StatCard label="Kỹ năng" value={user?.skills?.length || 0} icon="sparkles" tone="violet" hint="Cập nhật trong hồ sơ" />
        <StatCard label="GPA" value={user?.gpa ?? '—'} icon="chart" tone="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Nhóm gợi ý cho bạn"
            subtitle="Dựa trên GPA, kỹ năng, ngành học và mối quan tâm"
            action={
              <Link to="/app/teams/discover" className="text-sm font-semibold text-brand-600 hover:underline">
                Xem tất cả
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {recommendations.length === 0 ? (
              <EmptyState
                title="Chưa có gợi ý phù hợp"
                description="Hãy cập nhật kỹ năng và mối quan tâm trong hồ sơ để nhận gợi ý chính xác hơn."
                action={
                  <Link to="/app/profile">
                    <Button variant="secondary" size="sm">Cập nhật hồ sơ</Button>
                  </Link>
                }
              />
            ) : (
              recommendations.map(({ team, score }) => (
                <Link
                  key={team._id}
                  to={`/app/teams/${team._id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{team.name}</p>
                    <p className="truncate text-sm text-slate-500">{team.topic || team.major}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(team.skillsNeeded || []).slice(0, 3).map((skill) => (
                        <Badge key={skill} tone="brand">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <MatchScoreBadge score={score} />
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Thông báo mới" />
            <CardBody className="space-y-3">
              {(announcements?.data || []).length === 0 ? (
                <p className="text-sm text-slate-400">Chưa có thông báo.</p>
              ) : (
                (announcements?.data || []).map((item) => (
                  <div key={item._id} className="border-l-2 border-brand-200 pl-3">
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">{formatRelative(item.createdAt)}</p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Sự kiện sắp tới" />
            <CardBody className="space-y-3">
              {(events?.data || []).length === 0 ? (
                <p className="text-sm text-slate-400">Chưa có sự kiện.</p>
              ) : (
                (events?.data || []).map((event) => (
                  <Link key={event._id} to="/app/feed" className="block rounded-lg p-2 transition hover:bg-slate-50">
                    <p className="text-sm font-medium text-slate-800">{event.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(event.tagsNeeded || []).map((tag) => (
                        <Badge key={tag} tone="accent">{tag}</Badge>
                      ))}
                    </div>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
