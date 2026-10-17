import { useAuth } from '../context/AuthContext';
import AnnouncementsPage from './lecturer/AnnouncementsPage';
import AnnouncementsViewPage from './AnnouncementsViewPage';

const AnnouncementsRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'lecturer' || user?.role === 'admin') return <AnnouncementsPage />;
  return <AnnouncementsViewPage />;
};

export default AnnouncementsRouter;
