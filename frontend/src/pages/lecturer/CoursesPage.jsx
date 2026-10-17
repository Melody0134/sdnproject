import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi, userApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody, Badge, Button, Input, Textarea, Select, Modal, LoadingState, EmptyState, ConfirmDialog } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/layout/PageHeader';

const emptyForm = { code: '', title: '', description: '', semester: '', lecturer: '' };

const CoursesPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (!isAdmin) params.mine = 'true';
      const res = await courseApi.list(params);
      setCourses(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (isAdmin) {
      userApi
        .list({ role: 'lecturer', limit: 100 })
        .then((res) => setLecturers(res.data))
        .catch(() => setLecturers([]));
    }
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      code: course.code,
      title: course.title,
      description: course.description || '',
      semester: course.semester || '',
      lecturer: course.lecturer?._id || '',
    });
    setModalOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        title: form.title,
        description: form.description,
        semester: form.semester,
      };
      if (isAdmin && form.lecturer) payload.lecturer = form.lecturer;
      if (editing) {
        await courseApi.update(editing._id, payload);
        toast.success('Đã cập nhật học phần');
      } else {
        await courseApi.create(payload);
        toast.success('Đã tạo học phần');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await courseApi.remove(toDelete._id);
      toast.success('Đã xóa học phần');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý học phần"
        description="Tạo và quản lý các học phần bạn phụ trách."
        action={
          <Button onClick={openCreate}>
            <Icon name="plus" className="h-4 w-4" /> Thêm học phần
          </Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : courses.length === 0 ? (
        <EmptyState title="Chưa có học phần" description="Bấm “Thêm học phần” để tạo học phần đầu tiên." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course._id} className="flex h-full flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <Badge tone="brand">{course.code}</Badge>
                  {!course.isActive && <Badge tone="danger">Đã ẩn</Badge>}
                </div>
                <p className="mt-2 font-semibold text-slate-800">{course.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.description}</p>
                {course.semester && <p className="mt-1 text-xs text-slate-400">Học kỳ: {course.semester}</p>}
                <p className="mt-1 text-xs text-slate-400">{course.enrollmentCount || 0} sinh viên ghi danh</p>
                {isAdmin && course.lecturer && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <Avatar name={course.lecturer.name} src={course.lecturer.avatarUrl} size="sm" className="h-5 w-5 text-[9px]" />
                    {course.lecturer.name}
                  </div>
                )}
                <div className="mt-3 space-y-1.5">
                  <Link
                    to={`/app/courses/${course._id}/lessons`}
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
                  >
                    <Icon name="courses" className="h-4 w-4" /> Nội dung bài học
                  </Link>
                  <Link
                    to={`/app/courses/${course._id}/gradebook`}
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
                  >
                    <Icon name="chart" className="h-4 w-4" /> Sổ điểm & danh sách lớp
                  </Link>
                  <Link
                    to={`/app/courses/${course._id}/analytics`}
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
                  >
                    <Icon name="sparkles" className="h-4 w-4" /> Phân tích lớp học
                  </Link>
                </div>
                <div className="mt-auto flex gap-2 pt-4">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(course)}>
                    <Icon name="edit" className="h-4 w-4" /> Sửa
                  </Button>
                  <button
                    type="button"
                    onClick={() => setToDelete(course)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Chỉnh sửa học phần' : 'Thêm học phần'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={submit} loading={saving}>{editing ? 'Lưu' : 'Tạo'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Mã học phần" placeholder="CSD201" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input label="Học kỳ" placeholder="Fall 2026" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          </div>
          <Input label="Tên học phần" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          {isAdmin && (
            <Select label="Giảng viên phụ trách" value={form.lecturer} onChange={(e) => setForm({ ...form, lecturer: e.target.value })}>
              <option value="">-- Chọn giảng viên --</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer._id} value={lecturer._id}>
                  {lecturer.name} · {lecturer.email}
                </option>
              ))}
            </Select>
          )}
          <Textarea label="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xóa học phần"
        message={`Xóa học phần "${toDelete?.title}"? Toàn bộ tài liệu thuộc học phần cũng sẽ bị xóa.`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default CoursesPage;
