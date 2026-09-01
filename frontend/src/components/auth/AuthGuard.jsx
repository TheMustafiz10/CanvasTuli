import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthGuard = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="auth-guard-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to home (since you don't have /login page)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If roles are specified and user doesn't have the required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      return (
        <div className="auth-guard-access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
          <p>Required role: {allowedRoles.join(' or ')}</p>
          <p>Your role: {user?.role || 'None'}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      );
    }
  }

  // If authenticated and has required role, render the children
  return children;
};

export default AuthGuard;