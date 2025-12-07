import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import DownloadSummary from './DownloadSummary';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';  // Import the ProtectedRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/download-summary" 
          element={
            <ProtectedRoute>
              <DownloadSummary />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
