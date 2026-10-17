import { Link } from 'react-router-dom';
import { Card, CardBody, Badge, Button } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import { MatchScoreBadge } from '../../components/common/MatchScore';
import { TEAM_STATUS_LABELS } from '../../utils/constants';

const STATUS_TONE = { recruiting: 'success', full: 'warning', closed: 'neutral' };

const TeamCard = ({ team, score, onJoin, joinable }) => (
  <Card className="flex h-full flex-col transition hover:shadow-float">
    <CardBody className="flex flex-1 flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/app/teams/${team._id}`} className="font-semibold text-slate-900 hover:text-brand-600">
            {team.name}
          </Link>
          <p className="mt-0.5 text-sm text-slate-500">{team.topic || team.major || 'Chưa có chủ đề'}</p>
        </div>
        {typeof score === 'number' ? (
          <MatchScoreBadge score={score} />
        ) : (
          <Badge tone={STATUS_TONE[team.status]}>{TEAM_STATUS_LABELS[team.status]}</Badge>
        )}
      </div>

      {team.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{team.description}</p>}

      <div className="mt-3 flex flex-wrap gap-1">
        {(team.skillsNeeded || []).slice(0, 5).map((skill) => (
          <Badge key={skill} tone="brand">{skill}</Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Avatar name={team.leader?.name} src={team.leader?.avatarUrl} size="sm" />
          <span className="truncate">{team.leader?.name}</span>
        </div>
        <span className="text-xs text-slate-400">
          {team.members?.length}/{team.maxMembers} thành viên
        </span>
      </div>
    </CardBody>

    {joinable && (
      <div className="border-t border-slate-100 p-3">
        <Button variant="secondary" size="sm" className="w-full" onClick={() => onJoin(team)}>
          Gửi yêu cầu tham gia
        </Button>
      </div>
    )}
  </Card>
);

export default TeamCard;
