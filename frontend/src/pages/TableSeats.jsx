import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tablesAPI } from '../api/tables';
import SeatSelector from '../components/SeatSelector';

const TableSeats = () => {
  const [table, setTable] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTableData();
  }, [id]);

  const fetchTableData = async () => {
    try {
      setLoading(true);
      const tables = await tablesAPI.getAllTables();
      const currentTable = tables.find(t => t.id === parseInt(id));
      
      if (!currentTable) {
        setError('Table not found');
        return;
      }
      
      setTable(currentTable);
      setSeats(currentTable.seats || []);
    } catch (err) {
      setError('Failed to load table data');
      console.error('Error fetching table:', err);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SeatSelector table={table} seats={seats} />
      </div>
    </div>
  );
};

export default TableSeats; 