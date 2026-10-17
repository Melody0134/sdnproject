import { useEffect, useState } from 'react';
import { announcementApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Card, CardBody, Badge, Modal, LoadingState, EmptyState, Input } from '../components/common';
import Avatar from '../components/common/Avatar';
import PageHeader from '../components/layout/PageHeader';
import { formatRelative, formatDateTime } from '../utils/format';

const AUDIENCE_LABELS = { all: 'Tất cả', students: 'Sinh viên', lecturers: 'Giảng viên' };

const AnnouncementsViewPage = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const query = search.trim();
        const res = await announcementApi.list({ limit: 50, search: query.length >= 2 ? query : undefined });
        if (active) setItems(res.data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Thông báo"
        description="Thông báo học vụ từ giảng viên và nhà trường. Nhấn vào một thông báo để xem toàn bộ nội dung."
      />

      <div className="mx-auto mb-5 max-w-2xl">
        <Input id="announcement-search" label="Tìm thông báo" placeholder="Tìm theo tiêu đề hoặc nội dung" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có thông báo" description="Hiện chưa có thông báo nào dành cho bạn." />
      ) : (
        <div className="mx-auto max-w-2xl space-y-3">
          {items.map((item) => (
            <Card key={item._id}>
              <button type="button" onClick={() => setSelected(item)} className="w-full text-left">
                <CardBody className="transition hover:bg-slate-50">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    {item.isBroadcast && <Badge tone="accent">Toàn hệ thống</Badge>}
                    {item.scope === 'course' && item.course && <Badge tone="brand">{item.course.code}</Badge>}
                    <Badge tone="neutral">{AUDIENCE_LABELS[item.audience]}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-slate-600">{item.content}</p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Avatar name={item.author?.name} src={item.author?.avatarUrl} size="sm" className="h-5 w-5 text-[9px]" />
                    {item.author?.name} · {formatRelative(item.createdAt)}
                  </p>
                </CardBody>
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || ''} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {selected.isBroadcast && <Badge tone="accent">Toàn hệ thống</Badge>}
              {selected.scope === 'course' && selected.course && (
                <Badge tone="brand">{selected.course.code} — {selected.course.title}</Badge>
              )}
              <Badge tone="neutral">{AUDIENCE_LABELS[selected.audience]}</Badge>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{selected.content}</p>
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
              <Avatar name={selected.author?.name} src={selected.author?.avatarUrl} size="sm" className="h-6 w-6 text-[10px]" />
              {selected.author?.name} · {formatDateTime(selected.createdAt)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementsViewPage;
