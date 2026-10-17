import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import {
  Card,
  CardBody,
  Badge,
  Button,
  LoadingState,
  ErrorState,
  Modal,
  Textarea,
  Input,
  TagInput,
  ConfirmDialog,
} from '../../components/common';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/layout/PageHeader';
import { TEAM_STATUS_LABELS } from '../../utils/constants';
import WorkspacePanel from './team/WorkspacePanel';
import RequestsPanel from './team/RequestsPanel';
import TeammatesPanel from './team/TeammatesPanel';
import ChatPanel from './team/ChatPanel';

const STATUS_TONE = { recruiting: 'success', full: 'warning', closed: 'neutral' };

const TeamDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data, loading, error, run } = useAsync(() => teamApi.get(id), [id]);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [joining, setJoining] = useState(false);
  const [confirm, setConfirm] = useState(null);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={run} />;

  const team = data?.data?.team;
  if (!team) return <ErrorState message="Không tìm thấy nhóm" />;

  const isLeader = team.leader?._id === user?.id;
  const isMember = team.members?.some((m) => m.user?._id === user?.id);
  const isStudent = user?.role === 'student';

  const openEdit = () => {
    setEditForm({
      name: team.name,
      topic: team.topic || '',
      major: team.major || '',
      description: team.description || '',
      skillsNeeded: team.skillsNeeded || [],
      maxMembers: team.maxMembers,
      status: team.status,
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    setSavingEdit(true);
    try {
      await teamApi.update(id, { ...editForm, maxMembers: Number(editForm.maxMembers) });
      toast.success('Đã cập nhật thông tin nhóm');
      setEditOpen(false);
      run();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const submitJoin = async () => {
    setJoining(true);
    try {
      await teamApi.requestJoin(id, { message: joinMessage });
      toast.success('Đã gửi yêu cầu tham gia');
      setJoinOpen(false);
      setJoinMessage('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setJoining(false);
    }
  };

  const removeMember = async (memberId) => {
    try {
      await teamApi.removeMember(id, memberId);
      toast.success('Đã xóa thành viên');
      run();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const leaveTeam = async () => {
    try {
      await teamApi.leave(id);
      toast.success('Bạn đã rời nhóm');
      navigate('/app/teams');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteTeam = async () => {
    try {
      await teamApi.remove(id);
      toast.success('Đã xóa nhóm');
      navigate('/app/teams');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title={team.name}
        description={team.topic || team.major}
        action={
          <div className="flex gap-2">
            {isLeader && (
              <Button variant="secondary" onClick={openEdit}>
                <Icon name="edit" className="h-4 w-4" /> Chỉnh sửa
              </Button>
            )}
            {isLeader ? (
              <Button variant="danger" onClick={() => setConfirm('delete')}>Xóa nhóm</Button>
            ) : isMember ? (
              <Button variant="danger" onClick={() => setConfirm('leave')}>Rời nhóm</Button>
            ) : (
              isStudent && team.status === 'recruiting' && <Button onClick={() => setJoinOpen(true)}>Xin tham gia</Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody>
              <div className="mb-3 flex items-center gap-2">
                <Badge tone={STATUS_TONE[team.status]}>{TEAM_STATUS_LABELS[team.status]}</Badge>
                <span className="text-sm text-slate-400">{team.members?.length}/{team.maxMembers} thành viên</span>
              </div>
              <p className="whitespace-pre-line text-sm text-slate-600">{team.description || 'Nhóm chưa có mô tả.'}</p>
              {team.skillsNeeded?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Kỹ năng đang cần</p>
                  <div className="flex flex-wrap gap-1.5">
                    {team.skillsNeeded.map((skill) => (
                      <Badge key={skill} tone="brand">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {isMember && <ChatPanel teamId={id} />}
          {isMember && <WorkspacePanel teamId={id} />}
          {isLeader && <RequestsPanel teamId={id} onChanged={run} />}
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <p className="mb-3 text-sm font-semibold text-slate-700">Thành viên nhóm</p>
              <div className="space-y-2">
                {team.members?.map((member) => (
                  <div key={member.user?._id} className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name={member.user?.name} src={member.user?.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{member.user?.name}</p>
                        <p className="text-xs text-slate-400">{member.user?.major}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {member.role === 'leader' ? (
                        <Badge tone="brand">Trưởng nhóm</Badge>
                      ) : (
                        isLeader && (
                          <button
                            type="button"
                            onClick={() => removeMember(member.user?._id)}
                            className="rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label="Xóa thành viên"
                          >
                            <Icon name="close" className="h-4 w-4" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {isLeader && <TeammatesPanel teamId={id} />}
        </div>
      </div>

      {editForm && (
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Chỉnh sửa nhóm"
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button>
              <Button onClick={submitEdit} loading={savingEdit}>Lưu</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="Tên nhóm" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Chủ đề" value={editForm.topic} onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })} />
              <Input label="Ngành" value={editForm.major} onChange={(e) => setEditForm({ ...editForm, major: e.target.value })} />
            </div>
            <Textarea label="Mô tả" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <TagInput label="Kỹ năng cần tuyển" value={editForm.skillsNeeded} onChange={(skillsNeeded) => setEditForm({ ...editForm, skillsNeeded })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Số thành viên tối đa"
                type="number"
                min="1"
                max="20"
                value={editForm.maxMembers}
                onChange={(e) => setEditForm({ ...editForm, maxMembers: e.target.value })}
              />
              <div>
                <label className="label-base">Trạng thái</label>
                <select
                  className="input-base"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="recruiting">Đang tuyển</option>
                  <option value="full">Đã đủ thành viên</option>
                  <option value="closed">Đã đóng</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        title="Gửi yêu cầu tham gia"
        footer={
          <>
            <Button variant="secondary" onClick={() => setJoinOpen(false)}>Hủy</Button>
            <Button onClick={submitJoin} loading={joining}>Gửi</Button>
          </>
        }
      >
        <Textarea
          label="Lời nhắn tới trưởng nhóm"
          value={joinMessage}
          onChange={(e) => setJoinMessage(e.target.value)}
          placeholder="Giới thiệu bản thân và lý do muốn tham gia..."
        />
      </Modal>

      <ConfirmDialog
        open={confirm === 'delete'}
        title="Xóa nhóm"
        message="Toàn bộ dữ liệu nhóm sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?"
        confirmLabel="Xóa nhóm"
        onConfirm={deleteTeam}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'leave'}
        title="Rời nhóm"
        message="Bạn có chắc muốn rời khỏi nhóm này?"
        confirmLabel="Rời nhóm"
        onConfirm={leaveTeam}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
};

export default TeamDetailPage;
