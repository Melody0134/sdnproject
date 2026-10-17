import { useEffect, useState } from 'react';
import { teamApi } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Card, CardHeader, CardBody, Button, Badge, EmptyState } from '../../../components/common';
import Avatar from '../../../components/common/Avatar';
import { formatRelative } from '../../../utils/format';

const RequestsPanel = ({ teamId, onChanged }) => {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await teamApi.teamRequests(teamId, { status: 'pending' });
      setRequests(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  const decide = async (requestId, decision) => {
    setBusyId(requestId);
    try {
      await teamApi.decideRequest(requestId, { decision });
      toast.success(decision === 'accepted' ? 'Đã chấp nhận thành viên' : 'Đã từ chối yêu cầu');
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader title="Yêu cầu tham gia" subtitle={`${requests.length} yêu cầu đang chờ duyệt`} />
      <CardBody className="space-y-3">
        {loading ? (
          <p className="py-4 text-center text-sm text-slate-400">Đang tải...</p>
        ) : requests.length === 0 ? (
          <EmptyState title="Không có yêu cầu nào" description="Các yêu cầu tham gia mới sẽ xuất hiện tại đây." />
        ) : (
          requests.map((req) => (
            <div key={req._id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <Avatar name={req.applicant?.name} src={req.applicant?.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800">{req.applicant?.name}</p>
                    {req.applicant?.gpa != null && <Badge tone="success">GPA {req.applicant.gpa}</Badge>}
                    <span className="text-xs text-slate-400">{req.applicant?.major}</span>
                  </div>
                  {req.message && <p className="mt-1 text-sm text-slate-600">“{req.message}”</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(req.applicant?.skills || []).slice(0, 6).map((skill) => (
                      <Badge key={skill} tone="brand">{skill}</Badge>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{formatRelative(req.createdAt)}</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  loading={busyId === req._id}
                  onClick={() => decide(req._id, 'rejected')}
                >
                  Từ chối
                </Button>
                <Button size="sm" loading={busyId === req._id} onClick={() => decide(req._id, 'accepted')}>
                  Chấp nhận
                </Button>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
};

export default RequestsPanel;
