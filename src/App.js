import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
 

function App() {
  const [userId, setUserId] = React.useState(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    console.log("Retrieved userId from localStorage:", storedUserId);
    setUserId(storedUserId);
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) {
    console.log("Still checking auth...");
    return <div>Loading...</div>;
  }
  console.log("Finished auth check. userId:", userId);

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/site/:storeId" element={<ViewSite />} />
        <Route path="/storefront" element={userId ? <Storefront /> : <Navigate to="/signup" />} />
        <Route path="/products" element={userId ? <Products /> : <Navigate to="/signup" />} />
        <Route path="/orders" element={userId ? <Orders /> : <Navigate to="/signup" />} />
        <Route path="/profile" element={userId ? <Profile /> : <Navigate to="/signup" />} />
        <Route path="/settings" element={userId ? <Settings /> : <Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product/:id" element={<InProduct />} />
        <Route path="/payment" element={userId ? <Payment /> : <Navigate to="/signup" />} />
        <Route path="/customize" element={userId ? <Customize /> : <Navigate to="/signup" />} />
        <Route path="/preview" element={<ViewSite />} />
        <Route path="/orderform" element={<OrderForm />} />
        <Route path="/shop/:storeId/product/:id" element={<InProduct />} />
        <Route path="/shop/:storeId/orderform" element={<OrderForm />} />
        <Route path="/navview" element={userId ? <NavView /> : <Navigate to="/signup" />} />
        <Route path="/:slug/product/:productId" element={<InProduct />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/store/:storeName" element={<ViewSite />} />
        <Route path="/store/:slug" element={<ViewSite />} />
        <Route path="/order/:slug" element={<OrderForm />} />
        
        <Route path="/:slug" element={<ViewSite />} />

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;