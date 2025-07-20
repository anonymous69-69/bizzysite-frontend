import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderManagement() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('All Orders');
  const [orders, setOrders] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [userName, setUserName] = useState('User');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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
    // Fetch user name
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

    // Fetch orders with authentication - FIXED: Add Authorization header
    fetch("https://bizzysite.onrender.com/api/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('userId')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((order, i) => {
          const currency = order.currency || '$';
          return {
            ...order,
            id: order._id ? order._id.toString() : `ORD-${1000 + i}`,
            customer: order.customer?.name || "Unknown",
            date: order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "N/A",
            status: order.status || "Pending",
            items: order.items?.length || 0,
            total: (order.subtotal || 0) + (order.shipping || 0),
            itemsDetails: order.items?.map(item => ({
              ...item,
              currency: item.currency || currency
            })) || [],
            currency,
            customerDetails: {
              fullName: order.customer?.name || "Unknown",
              instagramId: order.customer?.instagramId || "N/A",
              phone: order.customer?.phone || "N/A",
              email: order.customer?.email || "N/A",
              address: order.customer?.address || "N/A",
              city: order.customer?.city || "N/A",
              state: order.customer?.state || "N/A",
              pincode: order.customer?.pincode || "N/A",
              country: order.customer?.country || "N/A",
              specialNote: order.customer?.specialNote || ""
            }
          };
        });
        setOrders(formatted);
      })
      .catch(err => console.error("Failed to load orders", err));
  }, [refreshTrigger]);

  const statusTabs = ['All Orders', 'Completed'];
  const filteredOrders = activeTab === 'All Orders'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const today = new Date().toISOString().split('T')[0];
  const totalOrdersToday = orders.filter(order => order.date === today).length;

  // FIXED: Use API for status changes
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

      // Update local state
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // FIXED: Use API for order deletion
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
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        {/* Header with dark mode */}
        <div className={`mb-6 rounded-md p-3 ${darkMode ? 'bg-gray-800' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <Link
              to="/signup"
              className={`text-2xl sm:text-3xl font-bold transition-colors ${darkMode ? 'text-white hover:text-indigo-300' : 'text-gray-800 hover:text-purple-600'
                }`}
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
                {showMenu && (
                  <div className={`absolute right-0 mt-2 w-40 border rounded-md shadow-lg z-50 dark:text-white ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'
                    }`}>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowMenu(false)}
                    >
                      Settings
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <h2 className={`text-lg sm:text-xl mb-6 sm:mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
            Welcome to your business dashboard
          </h2>

          <p className={`mb-6 sm:mb-8 text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-700'
            }`}>
            Set up your online store in minutes and start selling today
          </p>
        </div>

        {/* Navigation tabs with dark mode */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className={`flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max ${darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
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
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${window.location.pathname === tab.path
                      ? darkMode
                        ? 'bg-indigo-800 text-white'
                        : 'bg-purple-100 text-indigo-700'
                      : darkMode
                        ? 'text-gray-300 hover:text-indigo-300'
                        : 'text-gray-500 hover:text-indigo-600'
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
            <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'
              }`}>
              Order Management
            </h1>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Track and manage your customer orders
            </p>
          </div>
          <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm border w-fit ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <span className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Total Orders Today:
            </span>
            <span className="font-bold text-indigo-500 ml-1">{totalOrdersToday}</span>
          </div>
        </div>

        {/* Status Tabs */}
        <div className={`flex border-b mb-6 overflow-x-auto ${darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
          {statusTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap focus:outline-none ${activeTab === tab
                  ? darkMode
                    ? 'border-b-2 border-indigo-500 text-white'
                    : 'border-b-2 border-indigo-500 text-indigo-600'
                  : darkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-indigo-600'
                }`}
            >
              {tab} {tab !== 'All Orders' && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {orders.filter(order => order.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          {filteredOrders.length === 0 ? (
            <div className={`p-6 sm:p-8 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
              <svg
                className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
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
              <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                No orders found
              </h3>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                {activeTab === 'All Orders'
                  ? "You haven't received any orders yet."
                  : `You don't have any ${activeTab.toLowerCase()} orders.`}
              </p>
            </div>
          ) : (
            <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
              {filteredOrders.map(order => (
                <li
                  key={order.id}
                  className={`p-3 sm:p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <div className="flex items-center">
                        <h3 className={`text-base sm:text-lg font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'
                          }`}>
                          {order.id}
                        </h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Pending'
                            ? darkMode
                              ? 'bg-yellow-900 text-yellow-200'
                              : 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Confirmed'
                              ? darkMode
                                ? 'bg-blue-900 text-blue-200'
                                : 'bg-blue-100 text-blue-800' :
                              order.status === 'Completed'
                                ? darkMode
                                  ? 'bg-green-900 text-green-200'
                                  : 'bg-green-100 text-green-800' :
                                darkMode
                                  ? 'bg-red-900 text-red-200'
                                  : 'bg-red-100 text-red-800'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Customer: <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {order.customer}
                        </span>
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Date: <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {order.date}
                        </span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                        {order.currency}{order.total.toFixed(2)}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {order.items} item{order.items !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-3 sm:mt-4 border-t pt-3 sm:pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Items:
                    </h4>
                    <ul className="space-y-1 sm:space-y-2">
                      {order.itemsDetails.map((item, index) => (
                        <li key={index} className="flex justify-between text-xs sm:text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {item.name} × {item.quantity}
                          </span>
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                            {item.currency}{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 sm:mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className={`px-2 py-1 sm:px-3 sm:py-1 border rounded-md text-xs sm:text-sm ${darkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      View Details
                    </button>

                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'Confirmed')}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-indigo-600 text-white rounded-md text-xs sm:text-sm hover:bg-indigo-700"
                      >
                        Confirm
                      </button>
                    )}

                    {order.status === 'Confirmed' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'Completed')}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-green-600 text-white rounded-md text-xs sm:text-sm hover:bg-green-700"
                      >
                        Mark as Completed
                      </button>
                    )}

                    <button
                      onClick={() => setOrderToDelete(order)}
                      className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 text-white rounded-md text-xs sm:text-sm hover:bg-red-700"
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
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)} // closes modal when clicking outside
        >
          <div
            onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside modal
            className={`relative rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                Order Details - {selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`absolute top-4 right-4 text-3xl ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Customer Information
                </h4>
                <div className={`space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  <p><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Full Name:</span> {selectedOrder.customerDetails.fullName}</p>
                  <p><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Instagram:</span> {selectedOrder.customerDetails.instagramId || 'N/A'}</p>
                  <p><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Phone:</span> {selectedOrder.customerDetails.phone}</p>
                  <p><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Email:</span> {selectedOrder.customerDetails.email}</p>
                </div>
              </div>

              <div>
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Shipping Address
                </h4>
                <div className={`space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  <p>{selectedOrder.customerDetails.address}</p>
                  <p>{selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state}</p>
                  <p>{selectedOrder.customerDetails.pincode}</p>
                  <p>{selectedOrder.customerDetails.country}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Special Note
              </h4>
              <p className={`p-3 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50'
                }`}>
                {selectedOrder.customerDetails.specialNote || 'No special instructions provided'}
              </p>
            </div>

            <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Order Summary
              </h4>
              <ul className={`space-y-2 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {selectedOrder.itemsDetails.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{item.currency}{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className={`flex justify-between font-bold border-t pt-2 ${darkMode ? 'border-gray-700 text-white' : 'text-gray-900'
                }`}>
                <span>Total:</span>
                <span>{selectedOrder.currency}{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-lg p-6 w-full max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                Confirm Delete
              </h3>
              <button
                onClick={() => setOrderToDelete(null)}
                className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
              >
                ✕
              </button>
            </div>

            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Are you sure you want to delete order {orderToDelete.id}? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className={`px-4 py-2 border rounded-md ${darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(orderToDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-700 text-gray-400'
            }`}>
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}