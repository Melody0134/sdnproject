import { useEffect, useState } from 'react';
import { postApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody, Badge, Button, LoadingState, EmptyState, ConfirmDialog } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/layout/PageHeader';
import { POST_TYPE_LABELS } from '../../utils/constants';
import { formatRelative } from '../../utils/format';
import { cn } from '../../utils/cn';

const ModerationPage = () => {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await postApi.list(filter ? { type: filter, limit: 50 } : { limit: 50 });
      setPosts(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const toggle = async (post) => {
    try {
      await postApi.update(post._id, { status: post.status === 'published' ? 'hidden' : 'published' });
      toast.success(post.status === 'published' ? 'Đã ẩn bài đăng' : 'Đã hiển thị lại bài đăng');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await postApi.remove(toDelete._id);
      toast.success('Đã xóa bài đăng');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Kiểm duyệt bài đăng" description="Ẩn hoặc gỡ các bài đăng vi phạm trên bảng tin cộng đồng." />

      <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {[
          { key: '', label: 'Tất cả' },
          { key: 'event', label: 'Sự kiện' },
          { key: 'academic_update', label: 'Học vụ' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition',
              filter === item.key ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : posts.length === 0 ? (
        <EmptyState title="Không có bài đăng" />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post._id} className={cn(post.status === 'hidden' && 'opacity-70')}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">{post.title}</p>
                      <Badge tone={post.type === 'event' ? 'accent' : 'brand'}>{POST_TYPE_LABELS[post.type]}</Badge>
                      {post.status === 'hidden' && <Badge tone="danger">Đã ẩn</Badge>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <Avatar name={post.author?.name} src={post.author?.avatarUrl} size="sm" className="h-5 w-5 text-[9px]" />
                      {post.author?.name} · {formatRelative(post.createdAt)} · {post.reactionCount} cảm xúc
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => toggle(post)}>
                      {post.status === 'published' ? 'Ẩn' : 'Hiện'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setToDelete(post)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xóa bài đăng"
        message={`Xóa vĩnh viễn bài đăng "${toDelete?.title}"?`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default ModerationPage;
