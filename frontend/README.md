# DineGo Frontend

A modern React-based frontend for the DineGo restaurant management system, built with Vite, Tailwind CSS, and React Router.

## 🚀 Features

- **Role-based Authentication**: Support for WAITER, MANAGER, and ADMIN roles
- **Table Management**: Interactive table grid with seat selection
- **Order Management**: Add, edit, and submit food orders
- **Real-time Updates**: Live order status and group management
- **Responsive Design**: Mobile-friendly interface
- **JWT Security**: Secure authentication with token management

## 🛠️ Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Backend API
The frontend is configured to connect to the Spring Boot backend at `http://localhost:8080`. Update the `API_BASE_URL` in `src/api/axios.js` if your backend runs on a different port.

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🏗️ Project Structure

```
src/
├── api/                    # API service modules
│   ├── axios.js           # Axios instance with interceptors
│   ├── auth.js            # Authentication API calls
│   ├── tables.js          # Tables API calls
│   ├── groups.js          # Dining groups API calls
│   ├── foods.js           # Food items API calls
│   └── index.js           # API exports
├── components/            # Reusable UI components
│   ├── ProtectedRoute.jsx # Route protection component
│   ├── TableCard.jsx      # Table display card
│   ├── SeatSelector.jsx   # Seat selection interface
│   ├── FoodItem.jsx       # Food menu item
│   └── OrderSummary.jsx   # Order summary display
├── context/               # React Context providers
│   └── AuthContext.jsx    # Authentication state management
├── pages/                 # Page components
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # User registration (managers only)
│   ├── WaiterDashboard.jsx # Waiter's main dashboard
│   ├── ManagerDashboard.jsx # Manager's order overview
│   ├── TableSeats.jsx     # Table seat selection
│   └── GroupItems.jsx     # Group order management
├── App.jsx                # Main app component with routing
├── main.jsx               # App entry point
└── index.css              # Global styles with Tailwind
```

## 🔐 Authentication Flow

1. **Login**: Users authenticate with username/password
2. **Role-based Routing**: Automatic redirect based on user role
3. **JWT Token Management**: Automatic token inclusion in API requests
4. **Token Expiration**: Automatic logout on token expiration

## 🎯 User Roles & Permissions

### Waiter
- View restaurant tables
- Create dining groups
- Add food items to orders
- Submit orders
- View order summaries

### Manager
- All waiter permissions
- View submitted orders
- Create new users
- Access manager dashboard

### Admin
- All manager permissions
- Full system access

## 🍽️ Order Workflow

1. **Table Selection**: Waiter selects a table from dashboard
2. **Seat Selection**: Choose seats for the dining group
3. **Group Creation**: System creates a dining group
4. **Menu Browsing**: Add food items from the menu
5. **Order Management**: Modify quantities, remove items
6. **Order Submission**: Lock the order for kitchen processing

## 🔄 API Integration

The frontend integrates with the following backend endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /api/tables` - Fetch all tables
- `POST /api/groups/create` - Create dining group
- `POST /api/groups/{id}/add-item` - Add food to group
- `GET /api/groups/{id}/items` - Get group items
- `POST /api/groups/{id}/submit` - Submit group order
- `GET /api/groups/submitted` - Get submitted orders
- `GET /api/foods` - Get food menu

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Real-time Updates**: Live order status changes
- **Intuitive Navigation**: Clear navigation flow
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🧪 Testing

The application includes comprehensive error handling and validation:

- Form validation
- API error handling
- Network error recovery
- Role-based access control
- Token expiration handling

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the DineGo restaurant management system.

## 🆘 Support

For issues and questions:
1. Check the backend API documentation
2. Verify API endpoints are running
3. Check browser console for errors
4. Ensure proper CORS configuration

---

**DineGo Frontend** - Modern restaurant management interface
