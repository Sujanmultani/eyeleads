import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-3 text-slate-400 select-none">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#B8952A]"></div>
        <p className="text-[10px] font-bold uppercase tracking-wider">Authorizing privileges...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && !user.isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
