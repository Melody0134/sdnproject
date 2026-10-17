import { Link } from 'react-router-dom';
import { joinRequestApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { Card, CardBody, Badge, Button, LoadingState, EmptyState } from '../../components/common';
import PageHeader from '../../components/layout/PageHeader';
import { JOIN_STATUS_LABELS } from '../../utils/constants';
import { formatRelative } from '../../utils/format';

const STATUS_TONE = { pending: 'warning', accepted: 'success', rejected: 'danger', cancelled: 'neutral' };

const MyRequestsPage = () => {
  const toast = useToast();
  const { data, loading, run } = useAsync(() => joinRequestApi.mine({ limit: 50 }), []);

  if (loading) return <LoadingState />;
  const requests = data?.data || [];

  const cancel = async (requestId) => {
    try {
      await joinRequestApi.cancel(requestId);
      toast.success('Đã hủy yêu cầu');
      run();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Yêu cầu tham gia" description="Theo dõi trạng thái các yêu cầu tham gia nhóm bạn đã gửi." />

      {requests.length === 0 ? (
        <EmptyState
          title="Chưa có yêu cầu nào"
          description="Khi bạn gửi yêu cầu tham gia một nhóm, trạng thái sẽ hiển thị tại đây."
          action={
            <Link to="/app/teams/discover">
              <Button>Tìm nhóm ngay</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id}>
              <CardBody className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/app/teams/${req.team?._id}`} className="font-semibold text-slate-800 hover:text-brand-600">
                    {req.team?.name || 'Nhóm đã bị xóa'}
                  </Link>
                  <p className="text-sm text-slate-500">{req.team?.topic || req.team?.major}</p>
                  {req.message && <p className="mt-1 text-sm italic text-slate-400">“{req.message}”</p>}
                  <p className="mt-1 text-xs text-slate-400">Gửi {formatRelative(req.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge tone={STATUS_TONE[req.status]}>{JOIN_STATUS_LABELS[req.status]}</Badge>
                  {req.status === 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => cancel(req._id)}>Hủy yêu cầu</Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequestsPage;
