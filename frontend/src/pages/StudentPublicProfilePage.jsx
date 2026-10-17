import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { userApi } from '../api';
import { Badge, Card, CardBody, ErrorState, LoadingState } from '../components/common';
import Avatar from '../components/common/Avatar';
import PageHeader from '../components/layout/PageHeader';

const StudentPublicProfilePage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { userApi.publicProfile(id).then((response) => setStudent(response.data.student)).catch((requestError) => setError(requestError.message)); }, [id]);
  if (error) return <ErrorState message={error} />;
  if (!student) return <LoadingState />;
  return <div><PageHeader title="Hồ sơ sinh viên" action={<Link to="/app/students" className="text-sm font-semibold text-brand-600 hover:underline">Quay lại tìm kiếm</Link>} /><Card><CardBody><div className="flex flex-col gap-5 sm:flex-row"><Avatar name={student.name} src={student.avatarUrl} size="lg" /><div className="min-w-0 flex-1"><h1 className="text-2xl font-bold text-slate-900">{student.name}</h1><p className="mt-1 text-slate-500">{student.major || 'Chưa cập nhật chuyên ngành'}</p>{student.description && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{student.description}</p>}<div className="mt-5 flex flex-wrap gap-2">{student.skills?.map((skill) => <Badge key={skill} tone="brand">{skill}</Badge>)}</div>{student.interests?.length > 0 && <div className="mt-5"><h2 className="text-sm font-semibold text-slate-900">Lĩnh vực quan tâm</h2><div className="mt-2 flex flex-wrap gap-2">{student.interests.map((interest) => <Badge key={interest} tone="neutral">{interest}</Badge>)}</div></div>}</div></div></CardBody></Card></div>;
};

export default StudentPublicProfilePage;
