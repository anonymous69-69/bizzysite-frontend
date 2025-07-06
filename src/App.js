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

function App() {
  const [userId, setUserId] = React.useState(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/storefront" element={userId ? <Storefront /> : <Navigate to="/signup" />} />
        <Route path="/products" element={userId ? <Products /> : <Navigate to="/signup" />} />
        <Route path="/orders" element={userId ? <Orders /> : <Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product/:id" element={<InProduct />} />
        <Route path="/payment" element={userId ? <Payment /> : <Navigate to="/signup" />} />
        <Route path="/customize" element={userId ? <Customize /> : <Navigate to="/signup" />} />
        <Route path="/preview" element={userId ? <ViewSite /> : <Navigate to="/signup" />} />
        <Route path="/orderform" element={userId ? <OrderForm /> : <Navigate to="/signup" />} />
        <Route path="/shop/:storeId" element={<ViewSite />} />
        <Route path="/shop/:storeId/product/:id" element={<InProduct />} />
        <Route path="/shop/:storeId/orderform" element={<OrderForm />} />
        <Route path="/navview" element={userId ? <NavView /> : <Navigate to="/signup" />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;