import { useEffect, useState } from 'react';
import { courseApi, materialApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Modal,
  LoadingState,
  EmptyState,
  ConfirmDialog,
  Badge,
} from '../components/common';
import Icon from '../components/common/Icon';
import PageHeader from '../components/layout/PageHeader';
import { formatFileSize, formatRelative } from '../utils/format';
import { downloadProtectedFile } from '../utils/download';

const MaterialsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = ['lecturer', 'admin'].includes(user?.role);

  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ course: '', title: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ course: '', title: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadCourses = async () => {
    try {
      const res = await courseApi.list({ limit: 100 });
      setCourses(res.data);
    } catch {
      setCourses([]);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (courseFilter) params.course = courseFilter;
      if (search) params.search = search;
      const res = await materialApi.list(params);
      setMaterials(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    load();
  }, [courseFilter]);

  const download = async (material) => {
    setDownloadingId(material._id);
    try {
      await downloadProtectedFile(() => materialApi.download(material._id), material.fileName || material.title || 'material-download');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const submitUpload = async () => {
    if (!uploadForm.file || !uploadForm.course || !uploadForm.title) {
      toast.error('Vui lòng chọn học phần, nhập tiêu đề và chọn tệp');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('course', uploadForm.course);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      await materialApi.upload(formData);
      toast.success('Đã tải tài liệu lên');
      setUploadOpen(false);
      setUploadForm({ course: '', title: '', description: '', file: null });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (material) => {
    setEditing(material);
    setEditForm({
      course: material.course?._id || '',
      title: material.title,
      description: material.description || '',
    });
  };

  const submitEdit = async () => {
    if (!editForm.title || !editForm.course) {
      toast.error('Vui lòng chọn học phần và nhập tiêu đề');
      return;
    }
    setSavingEdit(true);
    try {
      await materialApi.update(editing._id, editForm);
      toast.success('Đã cập nhật tài liệu');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await materialApi.remove(toDelete._id);
      toast.success('Đã xóa tài liệu');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title={canManage ? 'Tài liệu giảng dạy' : 'Tài liệu học tập'}
        description="Kho tài liệu học tập tin cậy do giảng viên biên soạn."
        action={
          canManage && (
            <Button onClick={() => setUploadOpen(true)}>
              <Icon name="upload" className="h-4 w-4" /> Tải tài liệu
            </Button>
          )
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <Select className="sm:flex-1" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">Tất cả học phần</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.code} — {course.title}
            </option>
          ))}
        </Select>
        <form
          className="flex gap-2 sm:flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <Input className="flex-1" placeholder="Tìm tài liệu..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="submit" variant="secondary">Tìm</Button>
        </form>
      </div>

      {loading ? (
        <LoadingState />
      ) : materials.length === 0 ? (
        <EmptyState title="Chưa có tài liệu" description="Chưa có tài liệu nào cho bộ lọc hiện tại." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material._id} className="flex h-full flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name="materials" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">{material.title}</p>
                    <Badge tone="neutral" className="mt-1">{material.course?.code}</Badge>
                  </div>
                </div>
                {material.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{material.description}</p>}
                <p className="mt-2 text-xs text-slate-400">
                  {formatFileSize(material.size)} · {material.downloadCount} lượt tải · {formatRelative(material.createdAt)}
                </p>

                <div className="mt-auto flex gap-2 pt-4">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => download(material)} loading={downloadingId === material._id}>
                    <Icon name="download" className="h-4 w-4" /> Tải xuống
                  </Button>
                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(material)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(material)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Tải tài liệu lên"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Hủy</Button>
            <Button onClick={submitUpload} loading={uploading}>Tải lên</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Học phần" value={uploadForm.course} onChange={(e) => setUploadForm({ ...uploadForm, course: e.target.value })}>
            <option value="">-- Chọn học phần --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} — {course.title}
              </option>
            ))}
          </Select>
          <Input label="Tiêu đề tài liệu" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} />
          <Input label="Mô tả" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} />
          <div>
            <label className="label-base">Tệp tài liệu (PDF, DOCX, PPTX, TXT...)</label>
            <input
              type="file"
              className="input-base"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
            />
            <p className="mt-1 text-xs text-slate-400">Hỗ trợ PDF, DOCX, PPTX, TXT... tối đa theo giới hạn hệ thống.</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Chỉnh sửa tài liệu"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Hủy</Button>
            <Button onClick={submitEdit} loading={savingEdit}>Lưu thay đổi</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Học phần" value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}>
            <option value="">-- Chọn học phần --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} — {course.title}
              </option>
            ))}
          </Select>
          <Input label="Tiêu đề tài liệu" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <Input label="Mô tả" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xóa tài liệu"
        message={`Xóa tài liệu "${toDelete?.title}"?`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default MaterialsPage;
