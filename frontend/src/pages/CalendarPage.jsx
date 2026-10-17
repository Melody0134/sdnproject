import { Link } from 'react-router-dom';
import { calendarApi } from '../api';
import { useAsync } from '../hooks/useAsync';
import { Card, CardBody, Badge, LoadingState, ErrorState, EmptyState } from '../components/common';
import Icon from '../components/common/Icon';
import PageHeader from '../components/layout/PageHeader';
import { formatDateTime } from '../utils/format';

const dayKeyOf = (date) => new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

const CalendarPage = () => {
  const { data, loading, error, run } = useAsync(() => calendarApi.upcoming(), []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={run} />;

  const items = data?.data || [];
  const grouped = items.reduce((acc, item) => {
    const key = dayKeyOf(item.date);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Lịch & hạn chót" description="Hạn nộp bài tập và sự kiện sắp diễn ra." />

      {items.length === 0 ? (
        <EmptyState title="Không có mục nào sắp tới" description="Bạn không có hạn nộp hoặc sự kiện nào." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, dayItems]) => (
            <section key={day}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{day}</h2>
              <div className="space-y-2">
                {dayItems.map((item) => (
                  <Card key={`${item.kind}-${item.id}`}>
                    <CardBody className="flex items-center gap-3">
                      <span
                        className={
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ' +
                          (item.kind === 'assignment' ? 'bg-brand-50 text-brand-600' : 'bg-orange-50 text-accent-600')
                        }
                      >
                        <Icon name={item.kind === 'assignment' ? 'requests' : 'bell'} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {item.kind === 'assignment' ? (
                          <Link to={`/app/assignments/${item.id}`} className="font-medium text-slate-800 hover:text-brand-600">
                            {item.title}
                          </Link>
                        ) : (
                          <p className="font-medium text-slate-800">{item.title}</p>
                        )}
                        <p className="text-xs text-slate-400">
                          {formatDateTime(item.date)}
                          {item.course ? ` · ${item.course.code}` : ''}
                          {item.author ? ` · ${item.author}` : ''}
                        </p>
                      </div>
                      {item.kind === 'assignment' ? (
                        item.submitted ? (
                          <Badge tone="success">Đã nộp</Badge>
                        ) : (
                          <Badge tone="warning">Hạn nộp</Badge>
                        )
                      ) : (
                        <Badge tone="accent">Sự kiện</Badge>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
