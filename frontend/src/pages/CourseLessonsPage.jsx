import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { courseApi, lessonApi, materialApi, quizApi } from '../api';
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
import { downloadProtectedFile } from '../utils/download';

const emptyForm = { title: '', content: '', order: 0, materials: [], quiz: '' };

const CourseLessonsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.role === 'student';
  const canManage = user?.role === 'lecturer' || user?.role === 'admin';

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const [courseMaterials, setCourseMaterials] = useState([]);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [courseRes, lessonRes] = await Promise.all([courseApi.get(id), lessonApi.list(id)]);
      setCourse(courseRes.data.course);
      setLessons(lessonRes.data.lessons);
      setCompletedCount(lessonRes.data.completedCount);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (!canManage) return;
    materialApi
      .list({ course: id, limit: 100 })
      .then((res) => setCourseMaterials(res.data))
      .catch(() => setCourseMaterials([]));
    quizApi
      .list({ course: id, limit: 100 })
      .then((res) => setCourseQuizzes(res.data))
      .catch(() => setCourseQuizzes([]));
  }, [id, canManage]);

  const toggleComplete = async (lesson) => {
    setBusyId(lesson._id);
    try {
      if (lesson.completed) await lessonApi.uncomplete(lesson._id);
      else await lessonApi.complete(lesson._id);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: lessons.length + 1 });
    setEditorOpen(true);
  };

  const openEdit = (lesson) => {
    setEditing(lesson);
    setForm({
      title: lesson.title,
      content: lesson.content || '',
      order: lesson.order || 0,
      materials: (lesson.materials || []).map((m) => m._id),
      quiz: lesson.quiz?._id || '',
    });
    setEditorOpen(true);
  };

  const toggleMaterial = (materialId) =>
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.includes(materialId)
        ? prev.materials.filter((mid) => mid !== materialId)
        : [...prev.materials, materialId],
    }));

  const save = async () => {
    if (!form.title.trim()) return toast.error('Vui lòng nhập tiêu đề bài học');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        order: Number(form.order) || 0,
        materials: form.materials,
        quiz: form.quiz || null,
      };
      if (editing) {
        await lessonApi.update(editing._id, payload);
        toast.success('Đã cập nhật bài học');
      } else {
        payload.course = id;
        await lessonApi.create(payload);
        toast.success('Đã thêm bài học');
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
      await lessonApi.remove(toDelete._id);
      toast.success('Đã xóa bài học');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const downloadMaterial = async (material) => {
    setDownloadingId(material._id);
    try {
      await downloadProtectedFile(() => materialApi.download(material._id), material.fileName || material.title || 'material-download');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <LoadingState />;

  const percent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={course ? `${course.code} — Nội dung học phần` : 'Nội dung học phần'}
        description={course?.title || ''}
        action={
          <div className="flex gap-2">
            <Link to={isStudent ? '/app/course-catalog' : '/app/courses'}>
              <Button variant="secondary">Quay lại</Button>
            </Link>
            {canManage && (
              <Button onClick={openCreate}>
                <Icon name="plus" className="h-4 w-4" /> Thêm bài học
              </Button>
            )}
          </div>
        }
      />

      {isStudent && lessons.length > 0 && (
        <Card className="mb-5">
          <CardBody>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Tiến độ học tập</span>
              <span className="font-semibold text-brand-600">
                {completedCount}/{lessons.length} bài · {percent}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
          </CardBody>
        </Card>
      )}

      {lessons.length === 0 ? (
        <EmptyState
          title="Chưa có bài học"
          description={canManage ? 'Bấm “Thêm bài học” để xây dựng nội dung học phần.' : 'Giảng viên chưa đăng nội dung.'}
        />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Card key={lesson._id}>
              <CardBody>
                <div className="flex items-start gap-3">
                  {isStudent && (
                    <button
                      type="button"
                      disabled={busyId === lesson._id}
                      onClick={() => toggleComplete(lesson)}
                      className={
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ' +
                        (lesson.completed
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 text-transparent hover:border-brand-400')
                      }
                      title={lesson.completed ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành'}
                    >
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === lesson._id ? null : lesson._id)}
                      className="block w-full text-left"
                    >
                      <p className="font-semibold text-slate-800">
                        <span className="mr-2 text-slate-400">Bài {index + 1}.</span>
                        {lesson.title}
                      </p>
                    </button>

                    {expanded === lesson._id && (
                      <div className="mt-3 space-y-3">
                        {lesson.content && (
                          <p className="whitespace-pre-line text-sm text-slate-600">{lesson.content}</p>
                        )}
                        {lesson.materials?.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tài liệu đính kèm</p>
                            {lesson.materials.map((material) => (
                              <button
                                key={material._id}
                                type="button"
                                 onClick={() => downloadMaterial(material)}
                                 disabled={downloadingId === material._id}
                                className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
                              >
                                <Icon name="materials" className="h-4 w-4" /> {material.title}
                              </button>
                            ))}
                          </div>
                        )}
                        {lesson.quiz && (
                          <Link
                            to={`/app/quizzes/${lesson.quiz._id}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
                          >
                            <Icon name="quiz" className="h-4 w-4" /> Làm trắc nghiệm: {lesson.quiz.title}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  {lesson.completed && <Badge tone="success">Hoàn thành</Badge>}
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(lesson)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(lesson)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>Hủy</Button>
            <Button onClick={save} loading={saving}>{editing ? 'Lưu' : 'Thêm'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Input label="Tiêu đề bài học" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="w-24">
              <Input label="Thứ tự" type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </div>
          </div>
          <Textarea label="Nội dung" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          {courseMaterials.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">Tài liệu đính kèm</p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-3">
                {courseMaterials.map((material) => (
                  <label key={material._id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.materials.includes(material._id)}
                      onChange={() => toggleMaterial(material._id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                    {material.title}
                  </label>
                ))}
              </div>
            </div>
          )}
          <Select label="Trắc nghiệm đính kèm (tùy chọn)" value={form.quiz} onChange={(e) => setForm({ ...form, quiz: e.target.value })}>
            <option value="">Không gắn</option>
            {courseQuizzes.map((quiz) => (
              <option key={quiz._id} value={quiz._id}>{quiz.title}</option>
            ))}
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xóa bài học"
        message={`Xóa bài học "${toDelete?.title}"? Tiến độ của sinh viên với bài này cũng bị xóa.`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default CourseLessonsPage;
