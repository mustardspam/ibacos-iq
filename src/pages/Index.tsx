
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import ChangePassword from './ChangePassword';

const Index = () => {
  const { isAuthenticated, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded mx-auto mb-4 flex items-center justify-center animate-pulse" style={{ backgroundColor: 'hsl(215, 44%, 18%)' }}>
            <span className="text-white font-bold text-xl">IQ</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user needs to change password (first login)
  if (profile?.first_login) {
    return <ChangePassword />;
  }
  
  return <Dashboard />;
};

export default Index;
