import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLayout from './MainLayout';

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}