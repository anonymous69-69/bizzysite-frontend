import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  return (
    <Router>
      <Routes>
        {/* Changed root path to Signup page */}
        <Route path="/" element={<Signup />} />
        <Route path="/storefront" element={<Storefront />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product/:id" element={<InProduct />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/preview" element={<ViewSite />} />
        <Route path="/orderform" element={<OrderForm />} />
        <Route path="/shop/:storeId" element={<ViewSite />} />
        <Route path="/shop/:storeId/product/:id" element={<InProduct />} />
        <Route path="/shop/:storeId/orderform" element={<OrderForm />} />
        <Route path="/navview" element={<NavView />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;