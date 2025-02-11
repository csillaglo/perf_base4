import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/database';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  excludeRoles?: UserRole[];
}

export function PrivateRoute({ children, requiredRoles, excludeRoles }: PrivateRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check if user's role is in the excluded roles list
  if (excludeRoles && role && excludeRoles.includes(role as UserRole)) {
    return <Navigate to="/" />;
  }

  if (requiredRoles && !requiredRoles.includes(role as UserRole)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}