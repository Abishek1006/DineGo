import { useState } from 'react';
import { groupsAPI } from '../api/groups';

const OrderSummary = ({ groupId, items, onItemsUpdate, onGroupSubmit, isSubmitted = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setLoading(true);
      await groupsAPI.updateItemQuantity(groupId, itemId, newQuantity);
      onItemsUpdate(); // Refresh items
    } catch (err) {
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setLoading(true);
      await groupsAPI.removeItemFromGroup(groupId, itemId);
      onItemsUpdate(); // Refresh items
    } catch (err) {
      setError('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      await groupsAPI.submitGroup(groupId);
      onGroupSubmit(); // Update parent component
    } catch (err) {
      setError('Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.food?.price || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Summary</h3>
        {isSubmitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
            ✓ Order submitted successfully
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No items in order</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.food?.name}</h4>
                <p className="text-sm text-gray-600">₹{item.food?.price} each</p>
              </div>
              
              <div className="flex items-center space-x-3">
                {!isSubmitted && (
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={loading}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-center min-w-[2rem]">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={loading}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                )}
                
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ₹{((item.food?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                
                {!isSubmitted && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {!isSubmitted && items.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleSubmitOrder}
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              'Submit Order'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary; 

