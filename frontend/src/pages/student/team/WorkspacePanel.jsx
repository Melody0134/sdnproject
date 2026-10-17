import { useEffect, useState } from 'react';
import { teamApi } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Card, CardHeader, CardBody, Button, Input, Modal, EmptyState, ConfirmDialog } from '../../../components/common';
import Icon from '../../../components/common/Icon';
import Avatar from '../../../components/common/Avatar';
import { formatFileSize, formatRelative } from '../../../utils/format';
import { downloadProtectedFile } from '../../../utils/download';

const WorkspacePanel = ({ teamId }) => {
  const toast = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState({ title: '', linkUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await teamApi.resources(teamId);
      setResources(res.data.resources);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [teamId]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      await teamApi.uploadFile(teamId, formData);
      toast.success('Đã tải tài liệu lên');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const submitLink = async () => {
    setSavingLink(true);
    try {
      await teamApi.addLink(teamId, link);
      toast.success('Đã thêm liên kết');
      setLink({ title: '', linkUrl: '' });
      setLinkOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingLink(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await teamApi.removeResource(teamId, toDelete._id);
      toast.success('Đã xóa');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const downloadResource = async (resource) => {
    setDownloadingId(resource._id);
    try {
      await downloadProtectedFile(
        () => teamApi.downloadResource(teamId, resource._id),
        resource.fileName || resource.title || 'team-resource-download',
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Không gian làm việc nhóm"
        subtitle="Tài liệu và liên kết dùng chung của nhóm"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setLinkOpen(true)}>
              <Icon name="link" className="h-4 w-4" /> Thêm liên kết
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700">
              <Icon name="upload" className="h-4 w-4" />
              {uploading ? 'Đang tải...' : 'Tải file'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        }
      />
      <CardBody className="space-y-2">
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-400">Đang tải...</p>
        ) : resources.length === 0 ? (
          <EmptyState title="Chưa có tài nguyên" description="Tải lên tài liệu hoặc chia sẻ liên kết đầu tiên cho nhóm." />
        ) : (
          resources.map((res) => (
            <div key={res._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon name={res.type === 'link' ? 'link' : 'materials'} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  {res.type === 'link' ? (
                    <a href={res.linkUrl} target="_blank" rel="noreferrer" className="truncate font-medium text-slate-800 hover:text-brand-600">
                      {res.title}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => downloadResource(res)}
                      disabled={downloadingId === res._id}
                      className="truncate text-left font-medium text-slate-800 hover:text-brand-600 disabled:opacity-60"
                    >
                      {downloadingId === res._id ? 'Đang tải...' : res.title}
                    </button>
                  )}
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Avatar name={res.uploadedBy?.name} size="sm" className="h-4 w-4 text-[8px]" />
                    {res.uploadedBy?.name} · {formatRelative(res.createdAt)}
                    {res.type === 'file' && res.size ? ` · ${formatFileSize(res.size)}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setToDelete(res)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Xóa"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </CardBody>

      <Modal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Chia sẻ liên kết"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLinkOpen(false)}>Hủy</Button>
            <Button onClick={submitLink} loading={savingLink}>Thêm</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tiêu đề" value={link.title} onChange={(e) => setLink({ ...link, title: e.target.value })} />
          <Input
            label="Đường dẫn (URL)"
            placeholder="https://..."
            value={link.linkUrl}
            onChange={(e) => setLink({ ...link, linkUrl: e.target.value })}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xóa tài nguyên"
        message={`Bạn có chắc muốn xóa "${toDelete?.title}" khỏi nhóm?`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </Card>
  );
};

export default WorkspacePanel;
