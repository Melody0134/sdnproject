import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assignmentApi, courseApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  LoadingState,
  EmptyState,
  ConfirmDialog,
} from '../components/common';
import Icon from '../components/common/Icon';
import PageHeader from '../components/layout/PageHeader';
import { formatDate } from '../utils/format';

const emptyForm = { course: '', title: '', description: '', dueDate: '', maxScore: 10, isPublished: true };

const statusMeta = (status) => {
  if (status === 'graded') return { tone: 'success', label: 'Đã chấm' };
  if (status === 'submitted') return { tone: 'accent', label: 'Đã nộp' };
  return { tone: 'neutral', label: 'Chưa nộp' };
};

const AssignmentsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.role === 'student';
  const canManage = user?.role === 'lecturer' || user?.role === 'admin';

  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (courseFilter) params.course = courseFilter;
      const res = await assignmentApi.list(params);
      setAssignments(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseFilter]);

  useEffect(() => {
    courseApi
      .list({ limit: 100, ...(isStudent ? { enrolled: 'true' } : { mine: 'true' }) })
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]));
  }, [isStudent]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, course: courses[0]?._id || '' });
    setEditorOpen(true);
  };

  const openEdit = (assignment) => {
    setEditing(assignment);
    setForm({
      course: assignment.course?._id || '',
      title: assignment.title,
      description: assignment.description || '',
      dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 10) : '',
      maxScore: assignment.maxScore,
      isPublished: assignment.isPublished,
    });
    setEditorOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || (!editing && !form.course)) {
      return toast.error('Vui lòng chọn học phần và nhập tiêu đề');
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        maxScore: Number(form.maxScore) || 10,
        isPublished: form.isPublished,
      };
      if (editing) {
        await assignmentApi.update(editing._id, payload);
        toast.success('Đã cập nhật bài tập');
      } else {
        payload.course = form.course;
        await assignmentApi.create(payload);
        toast.success('Đã tạo bài tập');
      }
      setEditorOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await assignmentApi.remove(toDelete._id);
      toast.success('Đã xóa bài tập');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Bài tập"
        description={isStudent ? 'Nộp bài và theo dõi kết quả các bài tập.' : 'Giao bài tập và chấm điểm cho sinh viên.'}
        action={
          canManage ? (
            <Button onClick={openCreate}>
              <Icon name="plus" className="h-4 w-4" /> Tạo bài tập
            </Button>
          ) : null
        }
      />

      <div className="mb-5 max-w-xs">
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">Tất cả học phần</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <LoadingState />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Chưa có bài tập"
          description={isStudent ? 'Chưa có bài tập trong học phần bạn đã ghi danh.' : 'Hãy tạo bài tập đầu tiên.'}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((item) => {
            const meta = statusMeta(item.mySubmission?.status);
            return (
              <Card key={item._id}>
                <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{item.title}</span>
                      {item.course && <Badge tone="brand">{item.course.code}</Badge>}
                      {!item.isPublished && <Badge tone="warning">Nháp</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.dueDate ? `Hạn nộp: ${formatDate(item.dueDate)}` : 'Không có hạn nộp'} · Tối đa {item.maxScore} điểm
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isStudent ? (
                      item.mySubmission?.status === 'graded' ? (
                        <span className="text-sm font-bold text-emerald-600">
                          {item.mySubmission.score}/{item.maxScore}
                        </span>
                      ) : (
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      )
                    ) : (
                      <Badge tone="brand">{item.gradedCount || 0}/{item.submissionCount || 0} đã chấm</Badge>
                    )}
                    <Link to={`/app/assignments/${item._id}`}>
                      <Button variant="secondary" size="sm">
                        {isStudent ? 'Xem & nộp' : 'Xem bài nộp'}
                      </Button>
                    </Link>
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(item)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? 'Chỉnh sửa bài tập' : 'Tạo bài tập'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>Hủy</Button>
            <Button onClick={save} loading={saving}>{editing ? 'Lưu' : 'Tạo'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
            <Select label="Học phần" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              <option value="">Chọn học phần</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
              ))}
            </Select>
          )}
          <Input label="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Mô tả / yêu cầu" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Hạn nộp" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <Input label="Điểm tối đa" type="number" min="1" max="100" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            Công bố cho sinh viên (bỏ chọn để lưu nháp)
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xóa bài tập"
        message={`Xóa bài tập "${toDelete?.title}"? Mọi bài nộp cũng sẽ bị xóa.`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default AssignmentsPage;
