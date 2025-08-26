import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import the ThemeProvider from your context file.
// Make sure the path './ThemeContext' is correct for your project structure.
import { ThemeProvider } from './ThemeContext';

// Import all your page/component files
import Storefront from './storefront';
import Customize from './customize';
import Products from './products';
import Orders from './orders';
import Signup from './signup';
import ViewSite from './viewsite';
import Payment from './payments';
import InProduct from './inproduct';
import OrderForm from './orderform.jsx';
import NavView from './navview';
import Profile from './profile';
import ResetPassword from './resetpassword';
import Settings from './settings';

/**
 * A reusable component to protect routes that require authentication.
 * It checks if a 'userId' exists in localStorage.
 * If the user is not logged in, it redirects them to the /signup page.
 */
const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  return userId ? children : <Navigate to="/signup" replace />;
};


function App() {
  return (
    // 2. Wrap the entire application with the ThemeProvider.
    // This makes the theme context (like darkMode) available to all
    // components within the Router, including Storefront.
    <ThemeProvider>
      <Router>
        {/* Toaster is for showing pop-up notifications */}
        <Toaster position="top-right" reverseOrder={false} />

        {/* Define all the application routes */}
        <Routes>
          {/* --- Public Routes --- */}
          {/* These routes are accessible to everyone, logged in or not. */}
          <Route path="/" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/site/:storeId" element={<ViewSite />} />
          <Route path="/product/:id" element={<InProduct />} />
          <Route path="/orderform" element={<OrderForm />} />
          <Route path="/shop/:storeId/product/:id" element={<InProduct />} />
          <Route path="/shop/:storeId/orderform" element={<OrderForm />} />
          <Route path="/:slug/product/:productId" element={<InProduct />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/store/:storeName" element={<ViewSite />} />
          <Route path="/store/:slug" element={<ViewSite />} />
          <Route path="/order/:slug" element={<OrderForm />} />
          <Route path="/:slug" element={<ViewSite />} />
          <Route path="/preview" element={<ViewSite />} />


          {/* --- Private Routes --- */}
          {/* These routes are protected. Only logged-in users can access them. */}
          <Route path="/storefront" element={<PrivateRoute><Storefront /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/customize" element={<PrivateRoute><Customize /></PrivateRoute>} />
          <Route path="/navview" element={<PrivateRoute><NavView /></PrivateRoute>} />

          {/* Catch-all route for any page that doesn't exist */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
