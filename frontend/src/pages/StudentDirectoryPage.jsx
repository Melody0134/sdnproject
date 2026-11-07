import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { userApi } from '../api';
import { Card, CardBody, EmptyState, ErrorState, Input, LoadingState } from '../components/common';
import Avatar from '../components/common/Avatar';
import PageHeader from '../components/layout/PageHeader';

const StudentDirectoryPage = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    try {
      const response = await userApi.searchStudents({ search: params.get('q') || '', limit: 30 });
      setStudents(response.data || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [params]);
  const submit = (event) => {
    event.preventDefault();
    setParams(query.trim() ? { q: query.trim() } : {});
  };
  return <div><PageHeader title="Tìm sinh viên" description="Tìm theo tên, chuyên ngành và kỹ năng công khai." /><form onSubmit={submit} className="mb-6 max-w-xl"><Input id="student-search" label="Từ khóa" placeholder="Tên, chuyên ngành hoặc kỹ năng" value={query} onChange={(event) => setQuery(event.target.value)} /></form>{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : students.length === 0 ? <EmptyState title="Không tìm thấy sinh viên phù hợp" /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{students.map((student) => <Link key={student._id} to={`/app/students/${student._id}`}><Card className="h-full transition hover:border-brand-300"><CardBody className="flex items-start gap-3"><Avatar name={student.name} src={student.avatarUrl} /><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{student.name}</p><p className="text-sm text-slate-500">{student.major || 'Chưa cập nhật chuyên ngành'}</p><p className="mt-2 line-clamp-2 text-xs text-slate-500">{student.skills?.join(' · ') || 'Chưa cập nhật kỹ năng'}</p></div></CardBody></Card></Link>)}</div>}</div>;
};

export default StudentDirectoryPage;
