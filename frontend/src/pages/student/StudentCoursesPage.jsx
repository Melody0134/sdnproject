import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody, Badge, Button, LoadingState, EmptyState } from '../../components/common';
import PageHeader from '../../components/layout/PageHeader';

const StudentCoursesPage = () => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter === 'enrolled') params.enrolled = 'true';
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
  }, [filter]);

  const toggle = async (course) => {
    setBusyId(course._id);
    try {
      if (course.isEnrolled) {
        await courseApi.unenroll(course._id);
        toast.success('Đã hủy ghi danh');
      } else {
        await courseApi.enroll(course._id);
        toast.success('Đã ghi danh học phần');
      }
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Học phần" description="Ghi danh các học phần để nhận tài liệu, bài tập và thông báo." />

      <div className="mb-5 flex gap-2">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'enrolled', label: 'Đã ghi danh' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={
              'rounded-lg px-4 py-2 text-sm font-medium transition ' +
              (filter === tab.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50')
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : courses.length === 0 ? (
        <EmptyState title="Không có học phần" description="Chưa có học phần phù hợp." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course._id}>
              <CardBody className="flex h-full flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">{course.code}</span>
                  {course.isEnrolled && <Badge tone="success">Đã ghi danh</Badge>}
                </div>
                <p className="font-medium text-slate-700">{course.title}</p>
                {course.lecturer?.name && (
                  <p className="text-xs text-slate-400">GV: {course.lecturer.name}</p>
                )}
                <p className="text-xs text-slate-400">{course.enrollmentCount || 0} sinh viên đã ghi danh</p>
                {course.isEnrolled && (
                  <Link
                    to={`/app/courses/${course._id}/lessons`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    Xem nội dung bài học →
                  </Link>
                )}
                <div className="mt-auto pt-2">
                  <Button
                    variant={course.isEnrolled ? 'secondary' : 'primary'}
                    className="w-full"
                    loading={busyId === course._id}
                    onClick={() => toggle(course)}
                  >
                    {course.isEnrolled ? 'Hủy ghi danh' : 'Ghi danh'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
