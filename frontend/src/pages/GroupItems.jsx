import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { foodsAPI, groupsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import FoodItem from '../components/FoodItem';
import OrderSummary from '../components/OrderSummary';

const GroupItems = () => {
  const [foods, setFoods] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodsData, itemsData] = await Promise.all([
        foodsAPI.getAllFoods(),
        groupsAPI.getGroupItems(id)
      ]);
      
      setFoods(foodsData);
      setOrderItems(itemsData);
      
      // Check if group is submitted
      if (itemsData.length > 0 && itemsData[0].diningGroup?.submitted) {
        setIsSubmitted(true);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToOrder = async (foodId, quantity) => {
    try {
      await groupsAPI.addItemToGroup(id, foodId, quantity);
      fetchData(); // Refresh items
    } catch (err) {
      setError('Failed to add item to order');
    }
  };

  const handleItemsUpdate = () => {
    fetchData();
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

  const handleGroupSubmit = () => {
    setIsSubmitted(true);
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
              <h1 className="text-2xl font-bold text-gray-900">
                {location.state?.groupName || `Group ${id}`}
              </h1>
              <p className="text-sm text-gray-600">
                Table {location.state?.tableNumber || 'Unknown'}
              </p>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu</h2>
              {isSubmitted && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4">
                  ⚠️ This order has been submitted and cannot be modified
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foods.map((food) => (
                <FoodItem
                  key={food.id}
                  food={food}
                  onAddToOrder={handleAddToOrder}
                  disabled={isSubmitted}
                />
              ))}
            </div>

            {foods.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No food items available</p>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <OrderSummary
              groupId={id}
              items={orderItems}
              onItemsUpdate={handleItemsUpdate}
              onGroupSubmit={handleGroupSubmit}
              isSubmitted={isSubmitted}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupItems; 