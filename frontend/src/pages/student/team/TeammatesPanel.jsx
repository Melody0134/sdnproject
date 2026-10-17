import { useEffect, useState } from 'react';
import { teamApi } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Card, CardHeader, CardBody, Badge, Button, EmptyState } from '../../../components/common';
import Avatar from '../../../components/common/Avatar';

const TeammatesPanel = ({ teamId }) => {
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await teamApi.recommendedTeammates(teamId, { limit: 6 });
        setCandidates(res.data.recommendations);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teamId]);

  const invite = async (candidateId) => {
    setInviting(candidateId);
    try {
      await teamApi.invite(teamId, { inviteeId: candidateId });
      setCandidates((current) => current.filter(({ candidate }) => candidate._id !== candidateId));
      toast.success('Đã gửi lời mời vào nhóm');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setInviting(null);
    }
  };

  return (
    <Card>
      <CardHeader title="Ứng viên gợi ý" subtitle="Sinh viên phù hợp với kỹ năng nhóm đang cần" />
      <CardBody className="space-y-3">
        {loading ? (
          <p className="py-4 text-center text-sm text-slate-400">Đang phân tích...</p>
        ) : candidates.length === 0 ? (
          <EmptyState title="Chưa có ứng viên phù hợp" description="Bổ sung kỹ năng cần tuyển để nhận gợi ý tốt hơn." />
        ) : (
          candidates.map(({ candidate, score }) => (
            <div key={candidate._id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <Avatar name={candidate.name} src={candidate.avatarUrl} />
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{candidate.name}</p>
                  <p className="text-xs text-slate-400">{candidate.major}{candidate.gpa != null ? ` · GPA ${candidate.gpa}` : ''}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(candidate.skills || []).slice(0, 4).map((skill) => (
                      <Badge key={skill} tone="brand">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">{score}%</span>
                <Button size="sm" onClick={() => invite(candidate._id)} loading={inviting === candidate._id}>Mời</Button>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
};

export default TeammatesPanel;
