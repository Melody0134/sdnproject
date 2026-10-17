import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { eventApi } from '../api';
import { Badge, Button, Card, CardBody, ErrorState, LoadingState } from '../components/common';
import Avatar from '../components/common/Avatar';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDateTime } from '../utils/format';

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isManager, setIsManager] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await eventApi.get(id);
      const nextEvent = response.data.post;
      setEvent(nextEvent);
      const manager = user?.role === 'admin' || nextEvent.author?._id === user?.id;
      setIsManager(manager);
      if (manager) {
        const participantResponse = await eventApi.participants(id, { limit: 100 });
        setParticipants(participantResponse.data || []);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const updateRegistration = async () => {
    setSaving(true);
    try {
      if (event.isRegistered) await eventApi.cancel(id);
      else await eventApi.register(id);
      toast.success(event.isRegistered ? 'Đã hủy đăng ký sự kiện.' : 'Đăng ký sự kiện thành công.');
      load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeParticipant = async (participantId) => {
    try {
      await eventApi.removeParticipant(id, participantId);
      setParticipants((current) => current.filter((item) => item.participant?._id !== participantId));
      setEvent((current) => ({ ...current, registrationCount: Math.max((current.registrationCount || 1) - 1, 0) }));
      toast.success('Đã xóa người tham gia.');
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  if (loading) return <LoadingState label="Đang tải sự kiện..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const isFull = event.capacity && event.registrationCount >= event.capacity && !event.isRegistered;
  return <div><PageHeader title={event.title} description="Chi tiết và trạng thái đăng ký sự kiện" action={<Link to="/app/feed" className="text-sm font-semibold text-brand-600 hover:underline">Quay lại bảng tin</Link>} />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card><CardBody className="space-y-5"><div className="flex flex-wrap gap-2"><Badge tone="brand">Sự kiện</Badge>{event.isRegistered && <Badge tone="success">Đã đăng ký</Badge>}{isFull && <Badge tone="warning">Đã đủ chỗ</Badge>}</div><p className="whitespace-pre-wrap text-slate-700">{event.content}</p><dl className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase text-slate-400">Thời gian</dt><dd className="mt-1 text-sm font-medium text-slate-800">{formatDateTime(event.eventDate)}</dd></div><div><dt className="text-xs font-semibold uppercase text-slate-400">Số người đăng ký</dt><dd className="mt-1 text-sm font-medium text-slate-800">{event.registrationCount || 0}{event.capacity ? ` / ${event.capacity}` : ''}</dd></div></dl><Button onClick={updateRegistration} loading={saving} disabled={isFull} variant={event.isRegistered ? 'secondary' : 'primary'}>{event.isRegistered ? 'Hủy đăng ký' : 'Đăng ký tham gia'}</Button></CardBody></Card>
      <Card><CardBody><h2 className="font-semibold text-slate-900">Người tham gia</h2>{isManager ? (participants.length ? <div className="mt-4 space-y-3">{participants.map((item) => <div key={item._id} className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><Avatar size="sm" name={item.participant?.name} src={item.participant?.avatarUrl} /><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{item.participant?.name}</p><p className="truncate text-xs text-slate-500">{item.participant?.major}</p></div></div><button type="button" onClick={() => removeParticipant(item.participant?._id)} className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">Xóa</button></div>)}</div> : <p className="mt-3 text-sm text-slate-500">Chưa có người đăng ký.</p>) : <p className="mt-3 text-sm text-slate-500">Danh sách chỉ hiển thị cho người tổ chức.</p>}</CardBody></Card>
    </div>
  </div>;
};

export default EventDetailPage;
