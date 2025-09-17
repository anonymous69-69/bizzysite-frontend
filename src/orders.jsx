import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderManagement() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('All Orders');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [userName, setUserName] = useState('User');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          fetch(`https://bizzysite.onrender.com/api/user`, {
            headers: {
              Authorization: `Bearer ${userId}`
            }
          })
          .then(res => res.json())
          .then(data => {
            if (data?.name) setUserName(data.name);
          })
          .catch(err => console.error('Failed to fetch user info:', err));
        }

        const response = await fetch("https://bizzysite.onrender.com/api/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userId')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        
        const paidOrders = data.filter(order => order.paid && order.status !== 'canceled' && order.status !== 'failed');

        const formatted = paidOrders.map((order, i) => {
          const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'INR' }).formatToParts(0).find(p => p.type === 'currency')?.value || '$';
          return {
            ...order,
            id: order._id || `ORD-${1000 + i}`,
            customer: order.customer?.name || "Unknown",
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
            status: order.status || "Pending", 
            itemsCount: order.items?.length || 0,
            total: order.total || 0,
            itemsDetails: order.items || [],
            currency: order.currency || 'INR',
            currencySymbol: currencySymbol,
            customerDetails: order.customer || {},
          };
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setOrders(formatted);

      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const statusTabs = ['All Orders', 'Pending', 'Completed'];

  const filteredOrders = activeTab === 'All Orders'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const today = new Date().toISOString().split('T')[0];
  const totalOrdersToday = orders.filter(order => order.createdAt && order.createdAt.startsWith(today)).length;

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await fetch(`https://bizzysite.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userId')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await fetch(`https://bizzysite.onrender.com/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userId')}`
        }
      });

      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden ${darkMode ? "bg-gradient-to-br from-gray-900 via-indigo-900 to-black text-white" : "bg-gradient-to-br from-indigo-100 via-pink-100 via-purple-200 to-white text-black"}`}>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        {/* Header section */}
        <div className="mb-6 rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <Link 
              to="/signup" 
              className={`text-3xl sm:text-4xl font-extrabold ${darkMode ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" : "text-gray-900"}`}
            >
              BizzySite
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="focus:outline-none"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&bold=true`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-44 rounded-md shadow-lg z-50 bg-gray-800 text-white border border-gray-700 transform transition-all duration-300 ease-out origin-top-right ${
                    showMenu ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 -translate-y-2 scale-95 invisible'
                  }`}
                >
                  <span
                    className="block px-4 py-2 text-sm font-medium text-white pointer-events-none opacity-50"
                  >
                    Profile
                  </span>
                  <div className="border-t border-gray-700"></div>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 hover:text-indigo-300 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
            {(() => {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 12) return <>🌞 Good Morning, {userName}!</>;
              if (hour >= 12 && hour < 18) return <>🌤️ Good Afternoon, {userName}!</>;
              if (hour >= 18 && hour < 22) return <>🌙 Good Evening, {userName}!</>;
              return <>🌌 Good Night, {userName}!</>;
            })()} 🚀
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-6"></div>
          <p className={`mb-6 sm:mb-8 text-base sm:text-lg ${darkMode ? "text-gray-400" : "text-gray-900"} max-w-2xl`}>
            📦 Manage your orders — track, update, and fulfill with ease 🚚
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className={`flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md`}>
              {[
                { name: 'Setup', icon: '📊', path: '/storefront' },
                { name: 'Products', icon: '📦', path: '/products' },
                { name: 'Orders', icon: '🛒', path: '/orders' },
                { name: 'Customize', icon: '🎨', path: '/customize' },
                { name: 'Preview', icon: '🌐', path: '/navview' },
                { name: 'Payments', icon: '💳', path: '/payment' }
              ].map((tab) => (
                <Link
                  to={tab.path}
                  key={tab.name}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                    window.location.pathname === tab.path
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Order Management Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
              Order Management
            </h1>
            <p className={`text-sm sm:text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Track and manage your customer orders
            </p>
          </div>
          <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm border w-fit ${darkMode ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-200"}`}>
            <span className={`text-sm sm:text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Total Orders Today:
            </span>
            <span className="font-bold text-indigo-500 ml-1">{totalOrdersToday}</span>
          </div>
        </div>

        {/* Status Tabs */}
        <div className={`flex border-b mb-6 overflow-x-auto ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          {statusTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap focus:outline-none ${activeTab === tab
                  ? `border-b-2 ${darkMode ? "border-indigo-400 text-indigo-400" : "border-indigo-500 text-indigo-600"}`
                  : `${darkMode ? "text-gray-400 hover:text-indigo-400" : "text-gray-500 hover:text-indigo-600"}`
                }`}
            >
              {tab} {tab !== 'All Orders' && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-600"}`}>
                  {orders.filter(order => order.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className={`rounded-xl shadow-lg overflow-hidden backdrop-blur-md border ${darkMode ? "bg-gray-800/40 border-gray-700" : "bg-white/50 border-gray-200"}`}>
          {isLoading ? (
             <div className={`p-6 sm:p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}><p>Loading orders...</p></div>
          ) : filteredOrders.length === 0 ? (
            <div className={`p-6 sm:p-8 text-center`}>
              <svg
                className={`mx-auto h-12 w-12 ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className={`mt-2 text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                No orders found
              </h3>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {activeTab === 'All Orders'
                  ? "You haven't received any paid orders yet."
                  : `You don't have any ${activeTab.toLowerCase()} orders.`}
              </p>
            </div>
          ) : (
            <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {filteredOrders.map(order => (
                <li
                  key={order.id}
                  className={`p-3 sm:p-4 ${darkMode ? "hover:bg-gray-700/50" : "hover:bg-white/80"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <div className="flex items-center">
                        <h3 className={`text-base sm:text-lg font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                          {order.id.slice(-6)}
                        </h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Pending'
                            ? `${darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-800"}`
                            : `${darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-800"}`
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Customer: <span className={`${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                          {order.customer}
                        </span>
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Date: <span className={`${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                          {order.date}
                        </span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`text-base sm:text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {order.currencySymbol}{order.total.toFixed(2)}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className={`px-2 py-1 sm:px-3 sm:py-1 border rounded-md text-xs sm:text-sm ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                    >
                      View Details
                    </button>

                    {/* **UPDATED:** Reversible status buttons with VISIBLE gradients */}
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'Completed')}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-emerald-400 to-teal-600 text-white rounded-md text-xs sm:text-sm shadow-sm hover:from-emerald-500 hover:to-teal-700 transition-all"
                      >
                        Mark as Completed
                      </button>
                    )}

                    {order.status === 'Completed' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'Pending')}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md text-xs sm:text-sm shadow-sm hover:from-blue-600 hover:to-indigo-700 transition-all"
                      >
                        Move to Pending
                      </button>
                    )}

                    <button
                      onClick={() => setOrderToDelete(order)}
                      className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-md text-xs sm:text-sm shadow-sm hover:from-red-600 hover:to-pink-700 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md border ${darkMode ? "bg-gray-800/90 border-gray-700 text-white" : "bg-white/90 border-gray-200 text-gray-900"}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold`}>
                Order Details - #{selectedOrder.id.slice(-6)}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`absolute top-4 right-4 text-3xl ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Customer Information
                </h4>
                <div className={`space-y-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <p><span>Full Name:</span> {selectedOrder.customerDetails.name}</p>
                  <p><span>Instagram:</span> {selectedOrder.customerDetails.instagramId || 'N/A'}</p>
                  <p><span>Phone:</span> {selectedOrder.customerDetails.phone}</p>
                  <p><span>Email:</span> {selectedOrder.customerDetails.email}</p>
                </div>
              </div>
              <div>
                <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Shipping Address
                </h4>
                <div className={`space-y-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <p>{selectedOrder.customerDetails.address}</p>
                  <p>{selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state}</p>
                  <p>{selectedOrder.customerDetails.pincode}</p>
                  <p>{selectedOrder.customerDetails.country}</p>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Special Note
              </h4>
              <p className={`p-3 rounded-md ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                {selectedOrder.customerDetails.specialNote || 'No special instructions provided'}
              </p>
            </div>
            <div className={`border-t pt-4 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Order Summary
              </h4>
              <ul className={`space-y-2 mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {selectedOrder.itemsDetails.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{selectedOrder.currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className={`flex justify-between font-bold border-t pt-2 ${darkMode ? "border-gray-700 text-white" : "border-gray-200 text-gray-900"}`}>
                <span>Total:</span>
                <span>{selectedOrder.currencySymbol}{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
      {orderToDelete && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`rounded-xl shadow-lg p-6 w-full max-w-sm backdrop-blur-md border ${darkMode ? "bg-gray-800/90 border-gray-700 text-white" : "bg-white/90 border-gray-200 text-gray-900"}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold`}>
                Confirm Delete
              </h3>
              <button
                onClick={() => setOrderToDelete(null)}
                className={darkMode ? "text-gray-400 hover:text-white" : 'text-gray-500 hover:text-gray-700'}
              >
                ✕
              </button>
            </div>
            <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Are you sure you want to delete order {orderToDelete.id.slice(-6)}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className={`px-4 py-2 border rounded-md ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(orderToDelete.id)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-md hover:from-red-600 hover:to-pink-700"
              >
                Delete Order
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      
      {/* Footer */}
      <footer className={`py-8 sm:py-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">BizzySite</h3>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                Empowering small businesses to succeed online with simple, powerful tools.
              </p>
            </div>
            <div>
              
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li>Email: your-store@bizzysite.com</li>
              <li>Phone: +91 7086758292</li>
              </ul>
            </div>
          </div>
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${darkMode ? "border-gray-700 text-gray-400" : "border-gray-700 text-gray-400"}`}>
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}