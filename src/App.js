import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import the ThemeProvider from your context file.
import { ThemeProvider } from './ThemeContext';

// Import all your page/component files
import Storefront from './storefront';
import Customize from './customize';
import Products from './products';
import Orders from './orders';
import Signup from './signup';
import WaitlistPage from './waitlist';
import ViewSite from './viewsite';
import Payment from './payments';
import InProduct from './inproduct';
import OrderForm from './orderform.jsx';
import NavView from './navview';
import Profile from './profile';
import ResetPassword from './resetpassword';
import Settings from './settings';
// START: NEW COMPONENT IMPORT
// I've added the import for your new AdminOrders page.
import AdminOrders from './AdminOrders';
// END: NEW COMPONENT IMPORT


/**
 * A reusable component to protect routes that require authentication.
 */
const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  return userId ? children : <Navigate to="/signup" replace />;
};


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<WaitlistPage />} />
          <Route path="/admin-login" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/site/:storeId" element={<ViewSite />} />
          <Route path="/product/:id" element={<InProduct />} />
          <Route path="/orderform" element={<OrderForm />} />
          <Route path="/shop/:storeId/product/:id" element={<InProduct />} />
          <Route path="/shop/:storeId/orderform" element={<OrderForm />} />
          <Route path="/:slug/product/:productId" element={<InProduct />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/store/:slug" element={<ViewSite />} />
          <Route path="/order/:slug" element={<OrderForm />} />
          <Route path="/:slug" element={<ViewSite />} />
          <Route path="/preview" element={<ViewSite />} />


          {/* --- Private Routes --- */}
          <Route path="/storefront" element={<PrivateRoute><Storefront /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/customize" element={<PrivateRoute><Customize /></PrivateRoute>} />
          <Route path="/navview" element={<PrivateRoute><NavView /></PrivateRoute>} />
          
          {/* START: NEW ADMIN ROUTE */}
          {/* I've added the new route for your admin page. */}
          <Route path="/admin/orders" element={<PrivateRoute><AdminOrders /></PrivateRoute>} />
          {/* END: NEW ADMIN ROUTE */}

          {/* Catch-all route for any page that doesn't exist */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;