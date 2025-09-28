import React, { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Context Providers ---
import { ThemeProvider } from './ThemeContext';
import { AppNavProvider } from './AppNavContext';

// --- Layouts ---
// These are imported directly as they are the main structure of the app.
import PublicLayout from './PublicLayout';
import Layout from './Layout';

// --- Page Components (Lazy Loaded for Performance) ---
// By lazy-loading every page, you ensure that the user only downloads the code for the page they are currently visiting.
const SignupPage = lazy(() => import('./SignupPage'));
const ViewSite = lazy(() => import('./viewsite'));
const InProduct = lazy(() => import('./inproduct'));
const OrderForm = lazy(() => import('./orderform'));
const ResetPassword = lazy(() => import('./resetpassword'));
const Storefront = lazy(() => import('./storefront'));
const Products = lazy(() => import('./products'));
const Orders = lazy(() => import('./orders'));
const Profile = lazy(() => import('./profile'));
const Settings = lazy(() => import('./settings'));
const Payment = lazy(() => import('./payments'));
const Customize = lazy(() => import('./customize'));
const NavView = lazy(() => import('./navview'));
const AdminOrders = lazy(() => import('./AdminOrders'));

// --- Helper Components ---

/**
 * A reusable loading component to show while pages are being fetched.
 * This will be the fallback for our Suspense boundary.
 */
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-black text-white">
    <p>Loading...</p>
  </div>
);

/**
 * PrivateRoute component checks if a user is logged in.
 * If not, it redirects them to the signup page.
 */
const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  return userId ? children : <Navigate to="/signup" replace />;
};

// --- Main App Component ---

function App() {
  return (
    <ThemeProvider>
      <AppNavProvider>
        <Router>
          <Toaster 
            position="top-right" 
            reverseOrder={false} 
            toastOptions={{
              style: { background: '#363636', color: '#fff', zIndex: 9999 },
              duration: 5000,
              success: { duration: 3000 },
              error: { duration: 4000 },
            }}
          />

          {/* Suspense wraps the entire routing logic, showing a fallback while the requested page's code is loaded. */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* === Public Routes === */}
              {/* All routes within this group will share the PublicLayout (Header, Footer, etc.) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<SignupPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/admin-login" element={<SignupPage />} />
                <Route path="/site/:storeId" element={<ViewSite />} />
                <Route path="/store/:slug" element={<ViewSite />} />
                <Route path="/:slug" element={<ViewSite />} />
                <Route path="/preview" element={<ViewSite />} />
                <Route path="/product/:id" element={<InProduct />} />
                <Route path="/shop/:storeId/product/:id" element={<InProduct />} />
                <Route path="/:slug/product/:productId" element={<InProduct />} />
                <Route path="/orderform" element={<OrderForm />} />
                <Route path="/shop/:storeId/orderform" element={<OrderForm />} />
                <Route path="/order/:slug" element={<OrderForm />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>

              {/* === Private Routes === */}
              {/* All routes within this group require authentication and share the main dashboard Layout. */}
              <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="/storefront" element={<Storefront />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/customize" element={<Customize />} />
                <Route path="/navview" element={<NavView />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
              </Route>

              {/* === 404 Not Found Route === */}
              <Route path="*" element={<div className="flex h-screen items-center justify-center text-xl font-semibold">404: Page Not Found</div>} />
            </Routes>
          </Suspense>
        </Router>
      </AppNavProvider>
    </ThemeProvider>
  );
}

export default App;