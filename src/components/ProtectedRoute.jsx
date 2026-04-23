import React from 'react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // For now, just render children since we have mock auth
  return children;
};

export default ProtectedRoute;