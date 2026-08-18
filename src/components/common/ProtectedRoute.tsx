import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    // Optionally render a loading spinner or component while Auth0 is checking authentication status
    return <div>Loading authentication...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
