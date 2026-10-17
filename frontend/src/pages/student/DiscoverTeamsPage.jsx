import { useEffect, useState } from 'react';
import { teamApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import {
  Button,
  Input,
  Select,
  LoadingState,
  EmptyState,
  Pagination,
  Modal,
  Textarea,
} from '../../components/common';
import { MatchBreakdown } from '../../components/common/MatchScore';
import PageHeader from '../../components/layout/PageHeader';
import Icon from '../../components/common/Icon';
import { cn } from '../../utils/cn';
import TeamCard from './TeamCard';
import CreateTeamModal from './CreateTeamModal';

const TABS = [
  { key: 'recommended', label: 'Gợi ý từ AI', icon: 'sparkles' },
  { key: 'search', label: 'Tìm kiếm nhóm', icon: 'search' },
];

const DiscoverTeamsPage = () => {
  const toast = useToast();
  const [tab, setTab] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: '', major: '', skill: '', status: 'recruiting', page: 1 });
  const [createOpen, setCreateOpen] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [joining, setJoining] = useState(false);

  const loadRecommended = async () => {
    setLoading(true);
    try {
      const res = await teamApi.recommended({ limit: 12 });
      setRecommendations(res.data.recommendations);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSearch = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 9 };
      if (filters.search) params.search = filters.search;
      if (filters.major) params.major = filters.major;
      if (filters.skill) params.skill = filters.skill;
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
    if (tab === 'recommended') loadRecommended();
  }, [tab]);

  useEffect(() => {
    if (tab === 'search') loadSearch();
  }, [tab, filters.page]);

  const applySearch = (event) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadSearch();
  };

  const submitJoin = async () => {
    setJoining(true);
    try {
      await teamApi.requestJoin(joinTarget._id, { message: joinMessage });
      toast.success('Đã gửi yêu cầu tham gia nhóm');
      setJoinTarget(null);
      setJoinMessage('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tìm nhóm & Ghép đội"
        description="Để AI gợi ý nhóm phù hợp nhất, hoặc chủ động tìm kiếm và tạo nhóm mới."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Icon name="plus" className="h-4 w-4" /> Tạo nhóm
          </Button>
        }
      />

      <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
              tab === item.key ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <form onSubmit={applySearch} className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            className="lg:col-span-2"
            placeholder="Tìm theo tên, chủ đề..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Input placeholder="Ngành học" value={filters.major} onChange={(e) => setFilters({ ...filters, major: e.target.value })} />
          <Input placeholder="Kỹ năng" value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })} />
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Mọi trạng thái</option>
            <option value="recruiting">Đang tuyển</option>
            <option value="full">Đã đủ</option>
            <option value="closed">Đã đóng</option>
          </Select>
          <Button type="submit" className="sm:col-span-2 lg:col-span-5">Tìm kiếm</Button>
        </form>
      )}

      {loading ? (
        <LoadingState />
      ) : tab === 'recommended' ? (
        recommendations.length === 0 ? (
          <EmptyState
            title="Chưa có nhóm phù hợp"
            description="Cập nhật kỹ năng, ngành học và mối quan tâm trong hồ sơ để nhận gợi ý tốt hơn, hoặc tự tạo nhóm mới."
            action={<Button onClick={() => setCreateOpen(true)}>Tạo nhóm mới</Button>}
          />
        ) : (
          <div className="space-y-4">
            {recommendations.map(({ team, score, breakdown }) => (
              <div key={team._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
                <TeamCardInline team={team} score={score} onJoin={setJoinTarget} />
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Mức độ phù hợp theo tiêu chí</p>
                  <MatchBreakdown breakdown={breakdown} />
                </div>
              </div>
            ))}
          </div>
        )
      ) : teams.length === 0 ? (
        <EmptyState title="Không tìm thấy nhóm nào" description="Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team._id} team={team} joinable={team.status === 'recruiting'} onJoin={setJoinTarget} />
            ))}
          </div>
          <Pagination pagination={pagination} onChange={(page) => setFilters({ ...filters, page })} />
        </>
      )}

      <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadRecommended} />

      <Modal
        open={Boolean(joinTarget)}
        onClose={() => setJoinTarget(null)}
        title={`Gửi yêu cầu tham gia: ${joinTarget?.name || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setJoinTarget(null)}>Hủy</Button>
            <Button onClick={submitJoin} loading={joining}>Gửi yêu cầu</Button>
          </>
        }
      >
        <Textarea
          label="Lời nhắn tới trưởng nhóm"
          placeholder="Giới thiệu ngắn về bản thân và lý do bạn muốn tham gia..."
          value={joinMessage}
          onChange={(e) => setJoinMessage(e.target.value)}
        />
      </Modal>
    </div>
  );
};

const TeamCardInline = ({ team, score, onJoin }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <a href={`/app/teams/${team._id}`} className="font-semibold text-slate-900 hover:text-brand-600">
        {team.name}
      </a>
      <p className="text-sm text-slate-500">{team.topic || team.major}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {(team.skillsNeeded || []).slice(0, 6).map((skill) => (
          <span key={skill} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {skill}
          </span>
        ))}
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">{score}% phù hợp</span>
      {team.status === 'recruiting' && (
        <Button size="sm" onClick={() => onJoin(team)}>Xin tham gia</Button>
      )}
    </div>
  </div>
);

export default DiscoverTeamsPage;
