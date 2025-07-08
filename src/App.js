import React from 'react';
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
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/site/:storeId" element={<ViewSite />} />
        <Route path="/storefront" element={<Storefront />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product/:id" element={<InProduct />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/preview" element={<ViewSite />} />
        <Route path="/orderform" element={<OrderForm />} />
        <Route path="/shop/:storeId/product/:id" element={<InProduct />} />
        <Route path="/shop/:storeId/orderform" element={<OrderForm />} />
        <Route path="/navview" element={<NavView />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;