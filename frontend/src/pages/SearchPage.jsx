import { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Card, CardBody, Badge, Button, Input, LoadingState, EmptyState } from '../components/common';
import Icon from '../components/common/Icon';
import PageHeader from '../components/layout/PageHeader';
import { POST_TYPE_LABELS, TEAM_STATUS_LABELS } from '../utils/constants';

const SECTION_META = {
  courses: { label: 'Học phần', icon: 'courses' },
  materials: { label: 'Tài liệu', icon: 'materials' },
  posts: { label: 'Bài đăng', icon: 'feed' },
  teams: { label: 'Nhóm', icon: 'teams' },
  quizzes: { label: 'Trắc nghiệm', icon: 'quiz' },
};

const SearchPage = () => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    if (query.trim().length < 2) {
      toast.error('Từ khóa cần ít nhất 2 ký tự');
      return;
    }
    setLoading(true);
    try {
      const res = await searchApi.global(query.trim());
      setResults(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = results
    ? Object.values(results).reduce((sum, list) => sum + list.length, 0)
    : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Tìm kiếm" description="Tìm học phần, tài liệu, bài đăng, nhóm và trắc nghiệm." />

      <form onSubmit={search} className="mb-6 flex gap-2">
        <Input
          className="flex-1"
          placeholder="Nhập từ khóa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <Button type="submit" loading={loading}>
          <Icon name="search" className="h-4 w-4" /> Tìm
        </Button>
      </form>

      {loading ? (
        <LoadingState />
      ) : !results ? null : totalCount === 0 ? (
        <EmptyState title="Không tìm thấy kết quả" description={`Không có kết quả cho "${query}".`} />
      ) : (
        <div className="space-y-6">
          {results.courses.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{SECTION_META.courses.label}</h2>
              <div className="space-y-2">
                {results.courses.map((course) => (
                  <Card key={course._id}>
                    <CardBody className="flex items-center gap-3 py-3">
                      <Icon name="courses" className="h-5 w-5 text-brand-500" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{course.code} — {course.title}</p>
                        {course.semester && <p className="text-xs text-slate-400">Học kỳ: {course.semester}</p>}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.materials.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{SECTION_META.materials.label}</h2>
              <div className="space-y-2">
                {results.materials.map((material) => (
                  <Card key={material._id}>
                    <CardBody className="flex items-center gap-3 py-3">
                      <Icon name="materials" className="h-5 w-5 text-brand-500" />
                      <div className="flex-1">
                        <Link to="/app/materials" className="font-medium text-slate-800 hover:text-brand-600">
                          {material.title}
                        </Link>
                        {material.course?.code && <p className="text-xs text-slate-400">{material.course.code}</p>}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.posts.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{SECTION_META.posts.label}</h2>
              <div className="space-y-2">
                {results.posts.map((post) => (
                  <Card key={post._id}>
                    <CardBody className="flex items-center gap-3 py-3">
                      <Icon name="feed" className="h-5 w-5 text-brand-500" />
                      <div className="flex-1">
                        <Link to="/app/feed" className="font-medium text-slate-800 hover:text-brand-600">
                          {post.title}
                        </Link>
                      </div>
                      <Badge tone={post.type === 'event' ? 'accent' : 'brand'}>{POST_TYPE_LABELS[post.type] || post.type}</Badge>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.teams.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{SECTION_META.teams.label}</h2>
              <div className="space-y-2">
                {results.teams.map((team) => (
                  <Card key={team._id}>
                    <CardBody className="flex items-center gap-3 py-3">
                      <Icon name="teams" className="h-5 w-5 text-brand-500" />
                      <div className="flex-1">
                        <Link to={`/app/teams/${team._id}`} className="font-medium text-slate-800 hover:text-brand-600">
                          {team.name}
                        </Link>
                        <p className="text-xs text-slate-400">{team.memberCount}/{team.maxMembers} thành viên</p>
                      </div>
                      <Badge tone="neutral">{TEAM_STATUS_LABELS[team.status] || team.status}</Badge>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.quizzes.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{SECTION_META.quizzes.label}</h2>
              <div className="space-y-2">
                {results.quizzes.map((quiz) => (
                  <Card key={quiz._id}>
                    <CardBody className="flex items-center gap-3 py-3">
                      <Icon name="quiz" className="h-5 w-5 text-brand-500" />
                      <div className="flex-1">
                        <Link to={`/app/quizzes/${quiz._id}`} className="font-medium text-slate-800 hover:text-brand-600">
                          {quiz.title}
                        </Link>
                        {quiz.course?.code && <p className="text-xs text-slate-400">{quiz.course.code}</p>}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
