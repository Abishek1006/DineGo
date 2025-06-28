import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { foodsAPI } from '../api/foods';
import FoodCard from '../components/FoodCard';

const FoodManagement = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });
  
  const { user, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const data = await foodsAPI.getAllFoods();
      setFoods(data);
    } catch (err) {
      setError('Failed to load foods');
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter foods based on search term
  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const foodData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price)
      };

      if (editingFood) {
        // Update existing food
        await foodsAPI.updateFood(editingFood.id, foodData);
        setSuccess('Food updated successfully!');
      } else {
        // Add new food
        await foodsAPI.addFood(foodData);
        setSuccess('Food added successfully!');
      }

      // Reset form and refresh data
      resetForm();
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      console.error('Error saving food:', err);
    }
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) {
      return;
    }

    try {
      await foodsAPI.deleteFood(foodId);
      setSuccess('Food deleted successfully!');
      fetchFoods();
    } catch (err) {
      setError('Failed to delete food');
      console.error('Error deleting food:', err);
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      price: food.price.toString()
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '' });
    setEditingFood(null);
    setShowAddForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading foods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Food Management</h1>
              <p className="text-gray-600">Manage restaurant menu items</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md"
              >
                Back
              </button>
              {(isManager || isAdmin) && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Food
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (isManager || isAdmin) && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter food name"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editingFood ? 'Update Food' : 'Add Food'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Foods List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Menu Items ({filteredFoods.length})</h2>
              <div className="flex items-center space-x-4">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <svg
                    className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 text-sm font-medium ${
                      viewMode === 'table'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1 text-sm font-medium ${
                      viewMode === 'cards'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cards
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {filteredFoods.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No foods found matching your search' : 'No food items found'}
              </p>
              {(isManager || isAdmin) && !searchTerm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Your First Food Item
                </button>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            // Card View
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFoods.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={true}
                    isManager={isManager}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Food Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    {(isManager || isAdmin) && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFoods.map((food) => (
                    <tr key={food.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{food.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">${food.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">#{food.id}</div>
                      </td>
                      {(isManager || isAdmin) && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(food)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(food.id)}
                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodManagement; 