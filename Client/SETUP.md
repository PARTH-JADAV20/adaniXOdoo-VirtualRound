# GearGuard Hub - Complete Setup Guide

This guide will help you set up both the frontend and backend for the GearGuard Maintenance Management System.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running locally or MongoDB Atlas connection string)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration:
# - MONGODB_URI=mongodb://localhost:27017/gearguard
# - JWT_SECRET=your-super-secret-jwt-key-change-this
# - CORS_ORIGIN=http://localhost:5173
# - PORT=5000

# Start MongoDB (if running locally)
# On Windows: Make sure MongoDB service is running
# On Mac/Linux: mongod

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to root directory
cd ..

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or port 8080 as configured)

### 3. Create Your First User

You can create a user in two ways:

#### Option A: Using the Sign Up Page
1. Navigate to `http://localhost:5173/signup`
2. Fill in the registration form
3. Note: The sign-up page currently doesn't connect to the backend, so use Option B

#### Option B: Using API or MongoDB

**Using API:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }'
```

**Using MongoDB directly:**
```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@test.com",
  password: "$2a$10$...", // Use bcrypt to hash "password123"
  role: "admin"
})
```

### 4. Login

1. Navigate to `http://localhost:5173/login`
2. Use your created credentials
3. Or use demo credentials (if backend is not running):
   - admin@demo.com / demo123
   - manager@demo.com / demo123
   - technician@demo.com / demo123
   - employee@demo.com / demo123

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gearguard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

If not set, the frontend defaults to `http://localhost:5000/api`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users` - Get all users (Admin, Manager only)
- `PATCH /api/users/:id` - Update user

### Teams
- `POST /api/teams` - Create team (Admin, Manager only)
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID

### Equipment
- `POST /api/equipment` - Create equipment (Admin, Manager only)
- `GET /api/equipment` - Get all equipment (with filters)
- `GET /api/equipment/:id` - Get equipment by ID
- `PATCH /api/equipment/:id` - Update equipment (Admin, Manager only)

### Maintenance Requests
- `POST /api/requests` - Create request
- `GET /api/requests` - Get all requests (with filters)
- `GET /api/requests/:id` - Get request by ID
- `PATCH /api/requests/:id` - Update request
- `GET /api/requests/calendar` - Get calendar events (preventive only)
- `GET /api/requests/by-equipment/:equipmentId` - Get requests by equipment

## 🧪 Testing the Connection

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"OK","message":"GearGuard API is running"}`

2. **Test Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"password123"}'
   ```

3. **Frontend Connection:**
   - Open browser console
   - Check for API errors
   - Verify network requests to `http://localhost:5000/api`

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, use the connection string provided

**Port Already in Use:**
- Change `PORT` in `.env`
- Or kill the process using port 5000

**JWT Errors:**
- Ensure `JWT_SECRET` is set in `.env`
- Clear browser localStorage if token issues persist

### Frontend Issues

**CORS Errors:**
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:5173`

**API Connection Failed:**
- Check backend is running on port 5000
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for errors

**401 Unauthorized:**
- Token may be expired
- Clear localStorage and login again
- Check JWT_SECRET matches between sessions

## 📦 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB connection string
4. Set appropriate `CORS_ORIGIN`
5. Use process manager (PM2, etc.)
6. Enable HTTPS

### Frontend
1. Build: `npm run build`
2. Serve static files
3. Configure API URL for production
4. Enable HTTPS

## 🎯 Next Steps

1. Create your first team
2. Add equipment
3. Create maintenance requests
4. Assign technicians
5. Track maintenance history

## 📚 Documentation

- Backend API: See `backend/README.md`
- Frontend: See main `README.md`

## 💡 Tips

- Use MongoDB Compass to view your data
- Check browser DevTools Network tab for API calls
- Backend logs show all requests and errors
- Demo mode works without backend for UI testing

