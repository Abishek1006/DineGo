import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI } from '../api/groups';
import { useAuth } from '../context/AuthContext';

const WaiterActiveGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsAPI.getUnsubmittedGroups();
      setGroups(data);
    } catch (err) {
      setError('Failed to load active groups');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    console.log("Enter in to handling tranform");
    // Navigate to the appropriate dashboard based on user role
    if (user?.role === 'ADMIN') {
      navigate('/admin-dashboard');
    } else if (user?.role === 'MANAGER') {
      navigate('/manager-dashboard');
    } else {
      navigate('/waiter-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Active Groups</h1>
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.length === 0 ? (
              <div className="text-center text-gray-500">No active groups found.</div>
            ) : (
              groups.map(group => (
                <div key={group.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-bold text-lg text-blue-700">{group.groupName}</div>
                    <div className="text-gray-600 text-sm">Table: {group.table?.tableNumber}</div>
                    <div className="text-gray-600 text-sm">Seats: {group.groupSeats?.map(gs => gs.seat.seatNumber).join(', ')}</div>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-2">
                    <button
                      onClick={() => navigate(`/group/${group.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit Order
                      
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default WaiterActiveGroups; 