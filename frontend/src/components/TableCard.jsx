import { useNavigate } from 'react-router-dom';

const TableCard = ({ table }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/table/${table.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer p-6 border border-gray-200"
    >
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          T{table.tableNumber}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          {table.seats?.length || 0} seats available
        </div>
        <div className="flex justify-center space-x-1">
          {table.seats?.map((seat, index) => (
            <div 
              key={seat.id}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600"
            >
              S{seat.seatNumber}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableCard; 