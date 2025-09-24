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
import AdminOrders from './AdminOrders';
import Layout from './Layout'; // Import the new Layout component


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
        {/* The <Toaster /> component is placed here at the top level
          for global notifications throughout your app.
        */}
        <Toaster 
          position="top-right" 
          reverseOrder={false} 
          toastOptions={{
            // Define default styles
            style: {
              background: '#363636',
              color: '#fff',
              zIndex: 9999, // Ensure it's on top
            },
            duration: 5000,
            // Default options for specific types
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 4000,
            },
          }}
        />

        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Signup />} />
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


          {/* --- Private Routes Wrapped by Layout --- */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/storefront" element={<Storefront />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/navview" element={<NavView />} />
            
            {/* --- Admin Route (also uses the layout) --- */}
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>

          {/* Catch-all route for any page that doesn't exist */}
          <Route path="*" element={<div className="flex items-center justify-center h-screen text-xl font-semibold">404: Page Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
