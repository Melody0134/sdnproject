import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi, quizApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardBody, Badge, Button, Select, LoadingState, EmptyState, ConfirmDialog } from '../components/common';
import Icon from '../components/common/Icon';
import PageHeader from '../components/layout/PageHeader';
import { formatRelative } from '../utils/format';
import QuizBuilderModal from './lecturer/QuizBuilderModal';
import QuizImportModal from './lecturer/QuizImportModal';

const QuizzesPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = ['lecturer', 'admin'].includes(user?.role);
  const isStudent = user?.role === 'student';

  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (courseFilter) params.course = courseFilter;
      const [quizRes, courseRes] = await Promise.all([quizApi.list(params), courseApi.list({ limit: 100 })]);
      setQuizzes(quizRes.data);
      setCourses(courseRes.data);
      if (isStudent) {
        const attemptRes = await quizApi.myAttempts({ limit: 100 });
        setAttempts(attemptRes.data);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseFilter]);

  const bestScore = (quizId) => {
    const related = attempts.filter((a) => a.quiz?._id === quizId);
    if (!related.length) return null;
    return related.reduce((best, a) => Math.max(best, a.score / a.totalQuestions), 0);
  };

  const confirmDelete = async () => {
    try {
      await quizApi.remove(toDelete._id);
      toast.success('Đã xóa bộ câu hỏi');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openCreate = () => {
    setEditingQuiz(null);
    setBuilderOpen(true);
  };

  const openEdit = (quiz) => {
    setEditingQuiz(quiz);
    setBuilderOpen(true);
  };

  const togglePublish = async (quiz) => {
    try {
      await quizApi.update(quiz._id, { isPublished: !quiz.isPublished });
      toast.success(quiz.isPublished ? 'Đã chuyển về nháp' : 'Đã công bố cho sinh viên');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title={isStudent ? 'Ôn tập & Kiểm tra' : 'Bộ câu hỏi'}
        description="Luyện tập với các bộ câu hỏi trắc nghiệm do giảng viên biên soạn."
        action={
          canManage && <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setImportOpen(true)}>Nhập Excel</Button><Button onClick={openCreate}><Icon name="plus" className="h-4 w-4" /> Tạo thủ công</Button></div>
        }
      />

      <div className="mb-5">
        <Select className="sm:w-64" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">Tất cả học phần</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>{course.code} — {course.title}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <LoadingState />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="Chưa có bộ câu hỏi"
          description={
            canManage
              ? 'Bấm "Tạo thủ công" hoặc "Nhập Excel" để tạo bộ câu hỏi cho sinh viên.'
              : 'Hiện chưa có bộ câu hỏi nào được công bố. Vui lòng quay lại sau.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const best = isStudent ? bestScore(quiz._id) : null;
            return (
              <Card key={quiz._id} className="flex h-full flex-col">
                <CardBody className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Icon name="quiz" className="h-5 w-5" />
                    </span>
                    {canManage && (
                      <Badge tone={quiz.isPublished ? 'success' : 'neutral'}>
                        {quiz.isPublished ? 'Đã công bố' : 'Nháp'}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-3 font-semibold text-slate-800">{quiz.title}</p>
                  <p className="text-xs text-slate-400">
                    {quiz.course?.code ? `${quiz.course.code} · ` : ''}
                    {quiz.questionCount} câu hỏi · {formatRelative(quiz.createdAt)}
                  </p>

                  {best != null && (
                    <p className="mt-2 text-sm font-medium text-emerald-600">
                      Điểm cao nhất: {Math.round(best * 100)}%
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link to={`/app/quizzes/${quiz._id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        {isStudent ? 'Làm bài' : 'Xem trước'}
                      </Button>
                    </Link>
                    {canManage && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(quiz)}>
                          <Icon name="edit" className="h-4 w-4" /> Sửa
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => togglePublish(quiz)}>
                          {quiz.isPublished ? 'Ẩn' : 'Công bố'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setToDelete(quiz)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
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

      <QuizBuilderModal
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setEditingQuiz(null);
        }}
        onSaved={load}
        courses={courses}
        quiz={editingQuiz}
      />

      <QuizImportModal open={importOpen} onClose={() => setImportOpen(false)} onSaved={load} courses={courses} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xóa bộ câu hỏi"
        message={`Xóa "${toDelete?.title}" và toàn bộ kết quả liên quan?`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default QuizzesPage;
