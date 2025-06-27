import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI } from '../api/groups';

const SeatSelector = ({ table, seats }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSeatToggle = (seatId) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleCreateGroup = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const group = await groupsAPI.createGroup(table.id, selectedSeats);
      
      // Navigate to group items page
      navigate(`/group/${group.id}`, { 
        state: { 
          groupName: group.groupName,
          tableNumber: table.tableNumber 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Table {table.tableNumber}
        </h2>
        <p className="text-gray-600">Select seats for the dining group</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Seats</h3>
        <div className="grid grid-cols-2 gap-4">
          {seats.map((seat) => (
            <label
              key={seat.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedSeats.includes(seat.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSeats.includes(seat.id)}
                onChange={() => handleSeatToggle(seat.id)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                  selectedSeats.includes(seat.id)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedSeats.includes(seat.id) && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium text-gray-900">
                  Seat {seat.seatNumber}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/waiter-dashboard')}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Dashboard
        </button>
        <button
          onClick={handleCreateGroup}
          disabled={loading || selectedSeats.length === 0}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
          ) : (
            `Create Group (${selectedSeats.length} seats)`
          )}
        </button>
      </div>
    </div>
  );
};

export default SeatSelector; 