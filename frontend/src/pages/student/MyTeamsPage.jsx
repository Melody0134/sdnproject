import { useState } from 'react';
import { Link } from 'react-router-dom';
import { teamApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { Card, CardBody, Badge, Button, LoadingState, EmptyState } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import PageHeader from '../../components/layout/PageHeader';
import Icon from '../../components/common/Icon';
import { TEAM_STATUS_LABELS } from '../../utils/constants';
import CreateTeamModal from './CreateTeamModal';

const STATUS_TONE = { recruiting: 'success', full: 'warning', closed: 'neutral' };

const MyTeamsPage = () => {
  const { user } = useAuth();
  const { data, loading, run } = useAsync(() => teamApi.mine(), []);
  const [createOpen, setCreateOpen] = useState(false);

  if (loading) return <LoadingState />;
  const teams = data?.data?.teams || [];

  return (
    <div>
      <PageHeader
        title="Nhóm của tôi"
        description="Các nhóm bạn đang tham gia hoặc làm trưởng nhóm."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Icon name="plus" className="h-4 w-4" /> Tạo nhóm
          </Button>
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          title="Bạn chưa tham gia nhóm nào"
          description="Hãy để AI gợi ý nhóm phù hợp, hoặc tự tạo nhóm để bắt đầu tuyển thành viên."
          action={
            <div className="flex gap-2">
              <Link to="/app/teams/discover">
                <Button variant="secondary">Tìm nhóm</Button>
              </Link>
              <Button onClick={() => setCreateOpen(true)}>Tạo nhóm</Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => {
            const isLeader = team.leader?._id === user?.id || team.leader === user?.id;
            return (
              <Card key={team._id} className="transition hover:shadow-float">
                <CardBody>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/app/teams/${team._id}`} className="font-semibold text-slate-900 hover:text-brand-600">
                      {team.name}
                    </Link>
                    <div className="flex gap-1.5">
                      {isLeader && <Badge tone="brand">Trưởng nhóm</Badge>}
                      <Badge tone={STATUS_TONE[team.status]}>{TEAM_STATUS_LABELS[team.status]}</Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{team.topic || team.major}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Avatar name={team.leader?.name} src={team.leader?.avatarUrl} size="sm" />
                      {team.leader?.name}
                    </div>
                    <span className="text-xs text-slate-400">{team.members?.length}/{team.maxMembers} thành viên</span>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={run} />
    </div>
  );
};

export default MyTeamsPage;
