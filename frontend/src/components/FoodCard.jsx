import React from 'react';

const FoodCard = ({ food, onEdit, onDelete, showActions = false, isManager = false, isAdmin = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{food.name}</h3>
          <p className="text-2xl font-bold text-blue-600">₹{food.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">ID: #{food.id}</p>
        </div>
        
        {showActions && (isManager || isAdmin) && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => onEdit(food)}
              className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 text-sm"
            >
              Edit
            </button>
            {isAdmin && (
              <button
                onClick={() => onDelete(food.id)}
                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCard; 