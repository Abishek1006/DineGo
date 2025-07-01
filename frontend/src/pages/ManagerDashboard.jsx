import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupsAPI } from '../api/groups';

const TABS = [
  { label: 'Submitted', value: 'submitted' },
  { label: 'Active', value: 'active' },
];

const ManagerDashboard = () => {
  const [tab, setTab] = useState('submitted');
  const [groups, setGroups] = useState([]);
  const [groupItems, setGroupItems] = useState({}); // { groupId: [items] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState({}); // { groupId: boolean }
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, [tab]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      let data = [];
      if (tab === 'submitted') {
        data = await groupsAPI.getSubmittedGroups();
      } else {
        data = await groupsAPI.getUnsubmittedGroups();
      }
      setGroups(data);
      // Fetch items for each group
      const itemsObj = {};
      await Promise.all(
        data.map(async (group) => {
          try {
            const items = await groupsAPI.getGroupItems(group.id);
            itemsObj[group.id] = items;
          } catch (e) {
            itemsObj[group.id] = [];
          }
        })
      );
      setGroupItems(itemsObj);
    } catch (err) {
      setError('Failed to load groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkPaid = async (groupId) => {
    try {
      await groupsAPI.markGroupAsPaid(groupId);
      fetchGroups();
    } catch (err) {
      setError('Failed to mark as paid');
    }
  };

  const handleSubmitGroup = async (groupId) => {
    setSubmitting((prev) => ({ ...prev, [groupId]: true }));
    try {
      await groupsAPI.submitGroup(groupId);
      fetchGroups();
    } catch (err) {
      setError('Failed to submit group');
    } finally {
      setSubmitting((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const calculateGroupTotal = (groupId) => {
    const items = groupItems[groupId] || [];
    return items.reduce((total, item) => {
      return total + (item.food?.price || 0) * item.quantity;
    }, 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DineGo - Manager Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/food-management')}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage Foods
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Create User
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-4 border-b mb-6">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 font-medium border-b-2 ${tab === t.value ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No {tab === 'submitted' ? 'submitted' : 'active'} orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((group) => {
              const items = groupItems[group.id] || [];
              return (
                <div key={group.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.groupName}</h3>
                      <p className="text-sm text-gray-600">
                        Table {group.table?.tableNumber || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Seats:</strong> {group.groupSeats?.map(gs => gs.seat.seatNumber).join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{calculateGroupTotal(group.id).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {items.length} items
                      </p>
                    </div>
                  </div>

                  {group.submittedAt && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Submitted:</strong> {formatDate(group.submittedAt)}
                    </p>
                  )}

                  {items.length > 0 && (
                    <div className="border-t pt-4 mb-2">
                      <h4 className="font-medium text-gray-900 mb-2">Order Items:</h4>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.quantity}x {item.food?.name}
                            </span>
                            <span className="text-gray-600">
                              ₹{((item.food?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{calculateGroupTotal(group.id).toFixed(2)}
                      </span>
                    </div>
                    {/* Mark as Paid button for submitted, unpaid groups */}
                    {tab === 'submitted' && !group.paid && (
                      <button
                        onClick={() => handleMarkPaid(group.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {tab === 'submitted' && group.paid && (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded text-sm font-semibold">✅ Paid</span>
                    )}
                    {/* Edit/Submit for unsubmitted groups */}
                    {tab === 'active' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/group/${group.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Edit Order
                        </button>
                        <button
                          onClick={() => handleSubmitGroup(group.id)}
                          disabled={submitting[group.id]}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                        >
                          {submitting[group.id] ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard; 