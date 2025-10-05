import React, { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider } from './ThemeContext';
import { AppNavProvider } from './AppNavContext';

// CORRECTED PATH: Points to the components folder
import FramerSpinner from './components/FramerSpinner';

// --- Lazy-load all the page components ---
const Storefront = lazy(() => import('./storefront'));
const BlogPage = lazy(() => import('./pages/Blog.jsx'));
const ShopifyVsBizzySitePage = lazy(() => import('./pages/page1.jsx'));
const GrowthGuidePage = lazy(() => import('./pages/page2.jsx'));

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


// --- Private Route Component ---
const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  return userId ? children : <Navigate to="/signup" replace />;
};

// --- Main App Component ---
function App() {
  return (
    <HelmetProvider>
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

            <Suspense fallback={<FramerSpinner />}>
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
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/shopify-vs-bizzysite" element={<ShopifyVsBizzySitePage />} />
                <Route path="/blog/small-business-growth-guide" element={<GrowthGuidePage />} />


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

                {/* --- Catch-all 404 Route --- */}
                <Route path="*" element={<div className="flex items-center justify-center h-screen text-xl font-semibold bg-black text-white">404: Page Not Found</div>} />
              </Routes>
            </Suspense>
          </Router>
        </AppNavProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
