import { useEffect, useState } from 'react';
import { quizApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Modal, Select } from '../../components/common';
import { downloadProtectedFile } from '../../utils/download';

const QuizImportModal = ({ open, onClose, onSaved, courses }) => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setCourse('');
      setIsPublished(true);
      setFile(null);
    }
  }, [open]);

  const download = (type) => downloadProtectedFile(() => quizApi[type](), `ste-quiz-${type}.xlsx`).catch((err) => toast.error(err.message));

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return toast.error('Vui lòng nhập tiêu đề bộ câu hỏi');
    if (!file) return toast.error('Vui lòng chọn file Excel');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('course', course || '');
      formData.append('isPublished', String(isPublished));
      formData.append('file', file);
      await quizApi.import(formData);
      toast.success('Đã tạo bộ câu hỏi từ Excel');
      onClose();
      onSaved();
    } catch (err) {
      const details = Array.isArray(err.details) ? `\n${err.details.join('\n')}` : '';
      toast.error(`${err.message}${details}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Tạo quiz từ Excel" size="md" footer={(
      <><Button variant="secondary" onClick={onClose}>Hủy</Button><Button type="submit" form="quiz-import-form" loading={saving}>Tạo bộ câu hỏi</Button></>
    )}>
      <form id="quiz-import-form" onSubmit={submit} className="space-y-4">
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
          <p className="font-semibold">Format file</p>
          <p className="mt-1 leading-5">Sheet Questions gồm questionText, optionA đến optionF và correctAnswers. Dùng A hoặc A,C cho đáp án đúng.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => download('template')}>Tải file trống</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => download('sample')}>Tải file mẫu</Button>
          </div>
        </div>
        <Input label="Tên bộ câu hỏi" required value={title} onChange={(event) => setTitle(event.target.value)} />
        <Select label="Học phần" value={course} onChange={(event) => setCourse(event.target.value)}>
          <option value="">Không gắn học phần</option>
          {courses.map((item) => <option key={item._id} value={item._id}>{item.code} — {item.title}</option>)}
        </Select>
        <Select label="Trạng thái" value={isPublished ? 'published' : 'draft'} onChange={(event) => setIsPublished(event.target.value === 'published')}>
          <option value="published">Công bố ngay</option>
          <option value="draft">Lưu nháp</option>
        </Select>
        <label className="block text-sm font-medium text-slate-700">
          File Excel (.xlsx)
          <input className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-700" type="file" accept=".xlsx" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        </label>
        {file && <p className="text-xs text-slate-500">Đã chọn: {file.name}</p>}
      </form>
    </Modal>
  );
};

export default QuizImportModal;
