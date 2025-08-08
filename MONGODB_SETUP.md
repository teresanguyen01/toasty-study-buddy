# MongoDB Atlas Setup Guide

## 🚨 **Current Issue**

Your app is trying to connect to a local MongoDB instance that doesn't exist. We need to set up MongoDB Atlas (cloud database) instead.

## 📋 **Step-by-Step Setup**

### 1. **Create MongoDB Atlas Account**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

### 2. **Create a Cluster**

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS/Google Cloud/Azure)
4. Choose a region close to you
5. Click "Create"

### 3. **Set Up Database Access**

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 4. **Set Up Network Access**

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 5. **Get Your Connection String**

1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

### 6. **Update Environment Variables**

Create a `.env.local` file in your project root with:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/toasty-study-buddy?retryWrites=true&w=majority

# OpenAI API Key (already set)
OPENAI_API_KEY=your-openai-api-key-here

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Tesseract Language
TESSERACT_LANG=eng
```

**Replace the MONGODB_URI with your actual connection string from step 5.**

### 7. **Restart Your App**

```bash
npm run dev
```

## 🔧 **Alternative: Quick Fix for Testing**

If you want to test the app without setting up MongoDB Atlas right now, you can temporarily disable database operations:

1. **Comment out database calls** in the API routes
2. **Use localStorage** for temporary data storage
3. **Focus on Firebase features** (authentication, file upload)

## 💡 **Why This Happened**

- The app was trying to connect to `localhost:27017` (local MongoDB)
- No local MongoDB server is running
- We need a cloud database (MongoDB Atlas) for the app to work

## 🆘 **Need Help?**

1. Follow the setup guide above
2. Make sure to replace the connection string with your actual MongoDB Atlas URI
3. Restart the development server after updating `.env.local`

The app will work perfectly once MongoDB Atlas is configured! 🚀
