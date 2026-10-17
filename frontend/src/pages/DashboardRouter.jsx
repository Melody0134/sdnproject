import { useAuth } from '../context/AuthContext';
import StudentDashboard from './student/StudentDashboard';
import LecturerDashboard from './lecturer/LecturerDashboard';
import AdminDashboard from './admin/AdminDashboard';
import FeedPage from './FeedPage';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'lecturer') return <LecturerDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'club_leader') return <FeedPage />;
  return <StudentDashboard />;
};

export default DashboardRouter;
