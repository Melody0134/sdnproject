import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody, Badge, Input, Select, LoadingState, EmptyState, Pagination } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import PageHeader from '../../components/layout/PageHeader';
import { TEAM_STATUS_LABELS } from '../../utils/constants';
import { formatRelative } from '../../utils/format';

const STATUS_TONE = { recruiting: 'success', full: 'warning', closed: 'neutral' };

const MonitorTeamsPage = () => {
  const toast = useToast();
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      const res = await teamApi.list(params);
      setTeams(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters.page, filters.status]);

  return (
    <div>
      <PageHeader title="Giám sát nhóm dự án" description="Theo dõi tiến độ và hoạt động của các nhóm sinh viên." />

      <form
        className="mb-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters((prev) => ({ ...prev, page: 1 }));
          load();
        }}
      >
        <Input className="flex-1" placeholder="Tìm nhóm theo tên, chủ đề..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <Select className="sm:w-52" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">Mọi trạng thái</option>
          <option value="recruiting">Đang tuyển</option>
          <option value="full">Đã đủ</option>
          <option value="closed">Đã đóng</option>
        </Select>
      </form>

      {loading ? (
        <LoadingState />
      ) : teams.length === 0 ? (
        <EmptyState title="Không có nhóm nào" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team._id} className="transition hover:shadow-float">
                <CardBody>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/app/teams/${team._id}`} className="font-semibold text-slate-900 hover:text-brand-600">
                      {team.name}
                    </Link>
                    <Badge tone={STATUS_TONE[team.status]}>{TEAM_STATUS_LABELS[team.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{team.topic || team.major}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Avatar name={team.leader?.name} src={team.leader?.avatarUrl} size="sm" />
                      {team.leader?.name}
                    </div>
                    <span className="text-xs text-slate-400">{team.members?.length}/{team.maxMembers}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Tạo {formatRelative(team.createdAt)}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          <Pagination pagination={pagination} onChange={(page) => setFilters({ ...filters, page })} />
        </>
      )}
    </div>
  );
};

export default MonitorTeamsPage;
