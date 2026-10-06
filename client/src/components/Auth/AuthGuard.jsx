import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthSession } from '../../utils/authUtils';

export const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { isAuthenticated, isDemo, user } = getAuthSession();
  if (!isAuthenticated && !isDemo) {
    return <Navigate to="/login" replace />;
  }
  if (requireOnboarding && isAuthenticated && user?.hasCompletedOnboarding === false) {
    return <Navigate to="/guide" replace />;
  }
  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = getAuthSession();
  if (isAuthenticated) {
    if (user?.hasCompletedOnboarding === false) {
      return <Navigate to="/guide" replace />;
    }
    return <Navigate to="/expenses" replace />;
  }
  return children;
};

export const RootRedirect = () => {
  const { isAuthenticated, isDemo, user } = getAuthSession();
  if (isAuthenticated || isDemo) {
    if (isAuthenticated && user?.hasCompletedOnboarding === false) {
      return <Navigate to="/guide" replace />;
    }
    return <Navigate to="/expenses" replace />;
  }
  return <Navigate to="/login" replace />;
};
