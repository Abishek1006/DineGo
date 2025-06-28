import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { user, isAuthenticated, isManager } = useAuth();
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    role: 'WAITER' // Always default to WAITER for public registration
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Ensure role is always WAITER for non-authenticated users
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Force WAITER role for public registration
    const registrationData = {
      ...userData,
      role: isAuthenticated ? userData.role : 'WAITER'
    };

    const result = await register(registrationData);
    
    if (result.success) {
      if (isAuthenticated) {
        // If user is already logged in (manager/admin creating new user)
        setSuccess('User created successfully!');
        setUserData({ username: '', password: '', role: 'WAITER' });
      } else {
        // If this is a new user registration, redirect to login
        setSuccess('Registration successful! Please login with your new account.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isAuthenticated ? 'Create User' : 'Join DineGo'}
          </h2>
          <p className="text-gray-600">
            {isAuthenticated ? 'Add a new user to the system' : 'Create your account to get started'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={userData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={userData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
            
            {isManager && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="WAITER">Waiter</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                <p className="font-medium">New users will be registered as Waiters</p>
                <p className="mt-1">Contact a manager or admin to change your role later.</p>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : (
                isAuthenticated ? 'Create User' : 'Register'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 