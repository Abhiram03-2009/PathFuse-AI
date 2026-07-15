
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import pathFuseLogo from '@/assets/pathfuse-icon.png';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/30 animate-fade-in">
          <img src={pathFuseLogo} alt="PathFuse AI" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <div className="animate-fade-in">{children}</div>;
};

export default ProtectedRoute;
