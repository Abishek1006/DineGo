import { useState } from 'react';

const FoodItem = ({ food, onAddToOrder, disabled = false }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToOrder = () => {
    if (quantity > 0) {
      onAddToOrder(food.id, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{food.name}</h3>
          <p className="text-2xl font-bold text-blue-600">${food.price}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={disabled}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-3 py-1 text-center min-w-[3rem]">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            disabled={disabled}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            +
          </button>
        </div>
        
        <button
          onClick={handleAddToOrder}
          disabled={disabled}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Add to Order
        </button>
      </div>
    </div>
  );
};

export default FoodItem; 