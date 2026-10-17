import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { assignmentApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import {
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  Textarea,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components/common';
import Avatar from '../components/common/Avatar';
import PageHeader from '../components/layout/PageHeader';
import { formatDateTime } from '../utils/format';
import { downloadProtectedFile } from '../utils/download';

const AssignmentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.role === 'student';
  const canManage = user?.role === 'lecturer' || user?.role === 'admin';

  const { data, loading, error, run } = useAsync(() => assignmentApi.get(id), [id]);
  const assignment = data?.data?.assignment;

  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [grades, setGrades] = useState({});
  const [gradingId, setGradingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadSubmissions = async () => {
    setLoadingSubs(true);
    try {
      const res = await assignmentApi.submissions(id);
      setSubmissions(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    if (canManage) loadSubmissions();
  }, [id, canManage]);

  const submitWork = async () => {
    if (!content.trim() && !file) return toast.error('Vui lòng nhập nội dung hoặc đính kèm tệp');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (file) formData.append('file', file);
      await assignmentApi.submit(id, formData);
      toast.success('Đã nộp bài');
      setContent('');
      setFile(null);
      run();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const gradeValue = (row) =>
    grades[row._id] ?? { score: row.score == null ? '' : String(row.score), feedback: row.feedback || '' };

  const grade = async (row) => {
    const value = gradeValue(row);
    if (value.score === '') return toast.error('Vui lòng nhập điểm');
    setGradingId(row._id);
    try {
      await assignmentApi.grade(id, row._id, { score: Number(value.score), feedback: value.feedback.trim() });
      toast.success('Đã lưu điểm');
      loadSubmissions();
      run();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGradingId(null);
    }
  };

  const downloadSubmission = async (submission) => {
    setDownloadingId(submission._id);
    try {
      await downloadProtectedFile(() => assignmentApi.downloadSubmission(id, submission._id), submission.fileName || 'submission-download');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !assignment) return <ErrorState message={error || 'Không tìm thấy bài tập'} onRetry={run} />;

  const mine = assignment.mySubmission;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={assignment.title}
        description={assignment.course ? `${assignment.course.code} — ${assignment.course.title}` : ''}
        action={
          <Link to="/app/assignments">
            <Button variant="secondary">Quay lại</Button>
          </Link>
        }
      />

      <Card className="mb-5">
        <CardBody className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">Tối đa {assignment.maxScore} điểm</Badge>
            <span className="text-sm text-slate-500">
              {assignment.dueDate ? `Hạn nộp: ${formatDateTime(assignment.dueDate)}` : 'Không có hạn nộp'}
            </span>
          </div>
          {assignment.description && (
            <p className="whitespace-pre-line text-sm text-slate-700">{assignment.description}</p>
          )}
        </CardBody>
      </Card>

      {isStudent && (
        <>
          {mine && (
            <Card className="mb-5 border-brand-100">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">Bài nộp của bạn</p>
                  <Badge tone={mine.status === 'graded' ? 'success' : 'accent'}>
                    {mine.status === 'graded' ? 'Đã chấm' : 'Đã nộp'}
                  </Badge>
                </div>
                {mine.content && <p className="whitespace-pre-line text-sm text-slate-600">{mine.content}</p>}
                {mine.fileName && (
                  <button
                    type="button"
                     onClick={() => downloadSubmission(mine)}
                     disabled={downloadingId === mine._id}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    Mở tệp: {mine.fileName}
                  </button>
                )}
                <p className="text-xs text-slate-400">Nộp lúc {formatDateTime(mine.submittedAt)}</p>
                {mine.status === 'graded' && (
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="font-bold text-emerald-700">
                      Điểm: {mine.score}/{assignment.maxScore}
                    </p>
                    {mine.feedback && <p className="mt-1 text-sm text-emerald-800">Nhận xét: {mine.feedback}</p>}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody className="space-y-3">
              <p className="font-semibold text-slate-800">{mine ? 'Nộp lại bài' : 'Nộp bài'}</p>
              <Textarea
                label="Nội dung"
                rows={4}
                placeholder="Nhập nội dung hoặc ghi chú..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Tệp đính kèm (tùy chọn)</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
              <Button onClick={submitWork} loading={submitting}>Nộp bài</Button>
            </CardBody>
          </Card>
        </>
      )}

      {canManage && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Bài nộp của sinh viên</h2>
          {loadingSubs ? (
            <LoadingState />
          ) : submissions.length === 0 ? (
            <EmptyState title="Chưa có bài nộp" description="Chưa có sinh viên nào nộp bài." />
          ) : (
            <div className="space-y-3">
              {submissions.map((row) => {
                const value = gradeValue(row);
                return (
                  <Card key={row._id}>
                    <CardBody className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.student.name} src={row.student.avatarUrl} size="sm" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{row.student.name}</p>
                          <p className="text-xs text-slate-400">Nộp lúc {formatDateTime(row.submittedAt)}</p>
                        </div>
                        <Badge tone={row.status === 'graded' ? 'success' : 'accent'}>
                          {row.status === 'graded' ? 'Đã chấm' : 'Chưa chấm'}
                        </Badge>
                      </div>
                      {row.content && <p className="whitespace-pre-line text-sm text-slate-600">{row.content}</p>}
                      {row.fileName && (
                        <button
                          type="button"
                           onClick={() => downloadSubmission(row)}
                           disabled={downloadingId === row._id}
                          className="text-sm font-medium text-brand-600 hover:underline"
                        >
                          Mở tệp: {row.fileName}
                        </button>
                      )}
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="w-32">
                          <Input
                            label={`Điểm (tối đa ${assignment.maxScore})`}
                            type="number"
                            min="0"
                            max={assignment.maxScore}
                            value={value.score}
                            onChange={(e) => setGrades((prev) => ({ ...prev, [row._id]: { ...value, score: e.target.value } }))}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            label="Nhận xét"
                            value={value.feedback}
                            onChange={(e) => setGrades((prev) => ({ ...prev, [row._id]: { ...value, feedback: e.target.value } }))}
                          />
                        </div>
                        <Button size="sm" loading={gradingId === row._id} onClick={() => grade(row)}>
                          Lưu điểm
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentDetailPage;
