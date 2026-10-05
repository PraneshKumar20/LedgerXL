import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthSession } from '../../utils/authUtils';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isDemo } = getAuthSession();
  if (!isAuthenticated && !isDemo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = getAuthSession();
  if (isAuthenticated) {
    return <Navigate to="/expenses" replace />;
  }
  return children;
};

export const RootRedirect = () => {
  const { isAuthenticated, isDemo } = getAuthSession();
  if (isAuthenticated || isDemo) {
    return <Navigate to="/expenses" replace />;
  }
  return <Navigate to="/login" replace />;
};
