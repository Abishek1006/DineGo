import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import WaiterDashboard from './pages/WaiterDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TableSeats from './pages/TableSeats';
import GroupItems from './pages/GroupItems';
import Unauthorized from './pages/Unauthorized';
import WaiterActiveGroups from './pages/WaiterActiveGroups';
import FoodManagement from './pages/FoodManagement';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected routes */}
      <Route 
        path="/waiter-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['WAITER', 'MANAGER', 'ADMIN']}>
            <WaiterDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/manager-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/food-management" 
        element={
          <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <FoodManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/table/:id" 
        element={
          <ProtectedRoute allowedRoles={['WAITER', 'MANAGER', 'ADMIN']}>
            <TableSeats />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/group/:id" 
        element={
          <ProtectedRoute allowedRoles={['WAITER', 'MANAGER', 'ADMIN']}>
            <GroupItems />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/waiter-active-groups" 
        element={
          <ProtectedRoute allowedRoles={['WAITER', 'MANAGER', 'ADMIN']}>
            <WaiterActiveGroups />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'ADMIN' ? (
              <Navigate to="/admin-dashboard" replace />
            ) : user.role === 'MANAGER' ? (
              <Navigate to="/manager-dashboard" replace />
            ) : (
              <Navigate to="/waiter-dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
