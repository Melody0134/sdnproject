import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invitationApi } from '../../api';
import { Badge, Button, Card, CardBody, EmptyState, ErrorState, LoadingState } from '../../components/common';
import PageHeader from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';

const InvitationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const load = async () => {
    setLoading(true);
    try {
      const response = await invitationApi.mine({ limit: 50 });
      setItems(response.data || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const decide = async (item, isAccepted) => {
    try {
      if (isAccepted) await invitationApi.accept(item._id);
      else await invitationApi.reject(item._id);
      toast.success(isAccepted ? 'Đã tham gia nhóm.' : 'Đã từ chối lời mời.');
      load();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };
  return <div><PageHeader title="Lời mời vào nhóm" description="Xem và phản hồi lời mời từ các trưởng nhóm." />{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? <EmptyState title="Chưa có lời mời nào" /> : <div className="space-y-3">{items.map((item) => <Card key={item._id}><CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Link to={item.team?._id ? `/app/teams/${item.team._id}` : '/app/teams'} className="font-semibold text-slate-900 hover:text-brand-600">{item.team?.name || 'Nhóm không còn tồn tại'}</Link><Badge tone={item.status === 'pending' ? 'brand' : 'neutral'}>{item.status === 'pending' ? 'Đang chờ' : item.status}</Badge></div><p className="mt-1 text-sm text-slate-500">Mời bởi {item.invitedBy?.name || 'thành viên nhóm'}</p></div>{item.status === 'pending' && <div className="flex gap-2"><Button variant="secondary" onClick={() => decide(item, false)}>Từ chối</Button><Button onClick={() => decide(item, true)}>Chấp nhận</Button></div>}</CardBody></Card>)}</div>}</div>;
};

export default InvitationsPage;
