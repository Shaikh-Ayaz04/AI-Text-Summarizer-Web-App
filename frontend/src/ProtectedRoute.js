import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // or use context/auth hook

  if (!token) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children; // If logged in, render the requested component
};

export default ProtectedRoute;
