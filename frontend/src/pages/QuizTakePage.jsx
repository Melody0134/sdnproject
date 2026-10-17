import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { quizApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { Card, CardBody, Button, Badge, LoadingState, ErrorState } from '../components/common';
import Icon from '../components/common/Icon';
import PageHeader from '../components/layout/PageHeader';
import { cn } from '../utils/cn';

const QuizTakePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.role === 'student';
  const { data, loading, error, run } = useAsync(() => quizApi.get(id), [id]);

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={run} />;

  const quiz = data?.data?.quiz;
  const questions = quiz?.questions || [];
  const answeredCount = questions.filter((_, index) => (answers[index]?.length ?? 0) > 0).length;

  const toggle = (index, oIndex) =>
    setAnswers((prev) => {
      const current = prev[index] ?? [];
      const next = current.includes(oIndex)
        ? current.filter((idx) => idx !== oIndex)
        : [...current, oIndex].sort((a, b) => a - b);
      return { ...prev, [index]: next };
    });

  const submit = async () => {
    if (answeredCount < questions.length) {
      toast.error('Vui lòng trả lời tất cả câu hỏi');
      return;
    }
    setSubmitting(true);
    try {
      const ordered = questions.map((_, index) => (answers[index] ?? []));
      const res = await quizApi.submit(id, { answers: ordered });
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const percent = result ? Math.round((result.score / result.totalQuestions) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={quiz.title}
        description={`${questions.length} câu hỏi · có thể chọn nhiều đáp án${quiz.course?.code ? ` · ${quiz.course.code}` : ''}`}
        action={
          <Link to="/app/quizzes">
            <Button variant="secondary">Quay lại</Button>
          </Link>
        }
      />

      {result && (
        <Card className="mb-6 border-brand-200 bg-brand-50/50">
          <CardBody className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold text-brand-700 shadow-sm">
              {percent}%
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Bạn trả lời đúng {result.score}/{result.totalQuestions} câu
              </p>
              <p className="text-sm text-slate-500">
                {percent >= 80 ? 'Xuất sắc! 🎉' : percent >= 50 ? 'Khá tốt, hãy tiếp tục ôn tập.' : 'Cần ôn lại kỹ hơn nhé.'}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {!isStudent && !result && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Chế độ xem trước dành cho giảng viên — đáp án đúng được đánh dấu sẵn.
        </div>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => {
          const reviewItem = result?.review?.[index];
          const previewCorrect = !isStudent ? question.correctIndexes || [] : null;

          return (
            <Card key={index}>
              <CardBody>
                <p className="mb-3 font-medium text-slate-800">
                  <span className="mr-2 text-brand-600">Câu {index + 1}.</span>
                  {question.questionText}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => {
                    const selected = (answers[index] ?? []).includes(oIndex);
                    const isCorrect = reviewItem
                      ? reviewItem.correctIndexes.includes(oIndex)
                      : previewCorrect?.includes(oIndex);
                    const isWrongPick =
                      reviewItem && reviewItem.selectedIndexes.includes(oIndex) && !reviewItem.correctIndexes.includes(oIndex);

                    return (
                      <button
                        key={oIndex}
                        type="button"
                        disabled={Boolean(result) || !isStudent}
                        onClick={() => toggle(index, oIndex)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition',
                          selected && !result ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:bg-slate-50',
                          isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                          isWrongPick && 'border-rose-300 bg-rose-50 text-rose-800'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold',
                            selected && !result ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 text-slate-500',
                            isCorrect && 'border-emerald-500 text-emerald-600'
                          )}
                        >
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        {option}
                        {isCorrect && <Icon name="check" className="ml-auto h-4 w-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {isStudent && !result && (
        <div className="sticky bottom-4 mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-float">
          <span className="text-sm text-slate-500">
            Đã trả lời {answeredCount}/{questions.length} câu
          </span>
          <Button onClick={submit} loading={submitting} disabled={answeredCount < questions.length}>
            Nộp bài
          </Button>
        </div>
      )}

      {result && (
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
          >
            Làm lại
          </Button>
          <Link to="/app/quizzes">
            <Button>Hoàn tất</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuizTakePage;
