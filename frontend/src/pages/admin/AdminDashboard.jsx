import { adminApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Card, CardHeader, CardBody, Badge, LoadingState } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/layout/PageHeader';
import { ROLE_LABELS, TEAM_STATUS_LABELS, POST_TYPE_LABELS } from '../../utils/constants';
import { formatRelative } from '../../utils/format';

const AdminDashboard = () => {
  const { data, loading } = useAsync(() => adminApi.stats(), []);
  const { data: activityData } = useAsync(() => adminApi.activity(), []);
  if (loading) return <LoadingState />;

  const stats = data?.data?.stats || {};
  const activity = activityData?.data?.activity || {};

  return (
    <div>
      <PageHeader title="Tổng quan hệ thống" description="Giám sát toàn bộ hoạt động của nền tảng STE." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng người dùng" value={stats.totalUsers || 0} icon="users" tone="brand" />
        <StatCard label="Tổng số nhóm" value={stats.totalTeams || 0} icon="teams" tone="accent" />
        <StatCard label="Học phần" value={stats.totalCourses || 0} icon="courses" tone="violet" />
        <StatCard label="Tài liệu" value={stats.totalMaterials || 0} icon="materials" tone="success" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bộ câu hỏi" value={stats.totalQuizzes || 0} icon="quiz" tone="brand" />
        <StatCard label="Lượt làm quiz" value={stats.totalAttempts || 0} icon="check" tone="success" />
        <StatCard label="Bài đăng bị ẩn" value={stats.hiddenPosts || 0} icon="feed" tone="accent" />
        <StatCard
          label="Nhóm đang tuyển"
          value={stats.teamsByStatus?.recruiting || 0}
          icon="search"
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Người dùng theo vai trò" />
          <CardBody className="space-y-3">
            {Object.entries(stats.usersByRole || {}).map(([role, count]) => {
              const percent = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0;
              return (
                <div key={role}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{ROLE_LABELS[role] || role}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Nhóm theo trạng thái" />
          <CardBody className="space-y-3">
            {Object.entries(stats.teamsByStatus || {}).map(([status, count]) => {
              const percent = stats.totalTeams ? Math.round((count / stats.totalTeams) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{TEAM_STATUS_LABELS[status] || status}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-accent-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Người dùng mới" />
          <CardBody className="space-y-3">
            {(activity.users || []).map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <Avatar name={u.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">{u.name}</p>
                  <p className="truncate text-xs text-slate-400">{u.email}</p>
                </div>
                <Badge tone="brand">{ROLE_LABELS[u.role] || u.role}</Badge>
              </div>
            ))}
            {(activity.users || []).length === 0 && <p className="text-sm text-slate-400">Chưa có dữ liệu.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Nhóm mới tạo" />
          <CardBody className="space-y-3">
            {(activity.teams || []).map((t) => (
              <div key={t._id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{t.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {t.leader?.name} · {formatRelative(t.createdAt)}
                  </p>
                </div>
                <Badge tone="accent">{TEAM_STATUS_LABELS[t.status] || t.status}</Badge>
              </div>
            ))}
            {(activity.teams || []).length === 0 && <p className="text-sm text-slate-400">Chưa có dữ liệu.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Bài đăng gần đây" />
          <CardBody className="space-y-3">
            {(activity.posts || []).map((p) => (
              <div key={p._id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{p.title}</p>
                  <p className="truncate text-xs text-slate-400">
                    {p.author?.name} · {formatRelative(p.createdAt)}
                  </p>
                </div>
                <Badge tone={p.status === 'hidden' ? 'danger' : 'neutral'}>
                  {p.status === 'hidden' ? 'Đã ẩn' : POST_TYPE_LABELS[p.type] || p.type}
                </Badge>
              </div>
            ))}
            {(activity.posts || []).length === 0 && <p className="text-sm text-slate-400">Chưa có dữ liệu.</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
