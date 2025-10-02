import React, { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './ThemeContext';
import { AppNavProvider } from './AppNavContext';

// Lazy-load all the page components
const Storefront = lazy(() => import('./storefront'));
const Customize = lazy(() => import('./customize'));
const Products = lazy(() => import('./products'));
const Orders = lazy(() => import('./orders'));
const Signup = lazy(() => import('./signup'));
const ViewSite = lazy(() => import('./viewsite'));
const Payment = lazy(() => import('./payments'));
const InProduct = lazy(() => import('./inproduct'));
const OrderForm = lazy(() => import('./orderform.jsx'));
const NavView = lazy(() => import('./navview'));
const Profile = lazy(() => import('./profile'));
const ResetPassword = lazy(() => import('./resetpassword'));
const Settings = lazy(() => import('./settings'));
const AdminOrders = lazy(() => import('./AdminOrders'));
const Layout = lazy(() => import('./Layout'));

// A simple loading component to show while pages are loading
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
    <h1>Loading...</h1>
  </div>
);

const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  return userId ? children : <Navigate to="/signup" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AppNavProvider>
        <Router>
          <Toaster 
            position="top-right" 
            reverseOrder={false} 
            toastOptions={{
              style: {
                background: '#363636',
                color: '#fff',
                zIndex: 9999,
              },
              duration: 5000,
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

          {/* Wrap the Routes component with Suspense */}
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </Router>
      </AppNavProvider>
    </ThemeProvider>
  );
}

export default App;

