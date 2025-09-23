import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function OrderManagement() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('All Orders');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          // The Layout component will handle redirecting to login
          return;
        }

        const response = await fetch("https://bizzysite.onrender.com/api/orders", {
          headers: {
            'Authorization': `Bearer ${userId}`
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
        toast.error("Could not load your orders.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const statusTabs = ['All Orders', 'Pending', 'Completed'];

  const filteredOrders = activeTab === 'All Orders'
    ? orders
    : orders.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());
  
  const today = new Date().toISOString().split('T')[0];
  const totalOrdersToday = orders.filter(order => order.createdAt && order.createdAt.startsWith(today)).length;

  const handleStatusChange = async (orderId, newStatus) => {
    const originalOrders = [...orders];
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders); // Optimistic update

    try {
      await fetch(`https://bizzysite.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userId')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status.");
      setOrders(originalOrders); // Revert on failure
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const toastId = toast.loading("Deleting order...");
    try {
      await fetch(`https://bizzysite.onrender.com/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userId')}`
        }
      });

      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      setOrderToDelete(null);
      toast.success("Order deleted.", { id: toastId });
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete order.", { id: toastId });
    }
  };

  return (
    <>
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
        <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm border w-fit ${darkMode ? "bg-gray-800/40 border-gray-700" : "bg-white/50 border-gray-200"}`}>
          <span className={`text-sm sm:text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Total Orders Today:
          </span>
          <span className="font-bold text-indigo-500 ml-1.5">{totalOrdersToday}</span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className={`flex border-b mb-6 overflow-x-auto ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        {statusTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap focus:outline-none transition-colors ${activeTab === tab
                ? `border-b-2 ${darkMode ? "border-indigo-400 text-indigo-300" : "border-indigo-500 text-indigo-600"}`
                : `${darkMode ? "text-gray-400 hover:text-indigo-300" : "text-gray-500 hover:text-indigo-600"}`
              }`}
          >
            {tab} {tab !== 'All Orders' && (
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-600"}`}>
                {orders.filter(order => order.status.toLowerCase() === tab.toLowerCase()).length}
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
            <svg className={`mx-auto h-12 w-12 ${darkMode ? "text-gray-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
              <li key={order.id} className={`p-3 sm:p-4 transition-colors ${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50/80"}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <div className="flex items-center">
                      <h3 className={`text-base sm:text-lg font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                        Order #{order.id.slice(-6)}
                      </h3>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status.toLowerCase() === 'pending'
                          ? `${darkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-800"}`
                          : `${darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-800"}`
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Customer: <span className={`${darkMode ? "text-gray-200" : "text-gray-700"}`}>{order.customer}</span>
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Date: <span className={`${darkMode ? "text-gray-200" : "text-gray-700"}`}>{order.date}</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className={`text-base sm:text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {order.currencySymbol}{order.total.toFixed(2)}
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex flex-wrap justify-end gap-2">
                  <button onClick={() => setSelectedOrder(order)} className={`px-2 py-1 sm:px-3 sm:py-1 border rounded-md text-xs sm:text-sm font-semibold ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                    View Details
                  </button>
                  {order.status.toLowerCase() === 'pending' && (
                    <button onClick={() => handleStatusChange(order.id, 'Completed')} className="px-2 py-1 sm:px-3 sm:py-1 bg-green-600 text-white rounded-md text-xs sm:text-sm font-semibold shadow-sm hover:bg-green-700 transition-all">
                      Mark as Completed
                    </button>
                  )}
                  {order.status.toLowerCase() === 'completed' && (
                    <button onClick={() => handleStatusChange(order.id, 'Pending')} className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-semibold shadow-sm hover:bg-blue-700 transition-all">
                      Move to Pending
                    </button>
                  )}
                  <button onClick={() => setOrderToDelete(order)} className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 text-white rounded-md text-xs sm:text-sm font-semibold shadow-sm hover:bg-red-700 transition-all">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} onClick={(e) => e.stopPropagation()} className={`relative rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${darkMode ? "bg-gray-800/95 border-gray-700 text-white" : "bg-white/95 border-gray-200 text-gray-900"}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold`}>Order Details - #{selectedOrder.id.slice(-6)}</h3>
                <button onClick={() => setSelectedOrder(null)} className={`absolute top-4 right-4 text-3xl ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}>&times;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Customer Information</h4>
                  <div className={`space-y-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <p><strong>Name:</strong> {selectedOrder.customerDetails.name}</p>
                    <p><strong>Instagram:</strong> {selectedOrder.customerDetails.instagramId || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customerDetails.phone}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerDetails.email}</p>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Shipping Address</h4>
                  <div className={`space-y-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <p>{selectedOrder.customerDetails.address}</p>
                    <p>{selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state} {selectedOrder.customerDetails.pincode}</p>
                    <p>{selectedOrder.customerDetails.country}</p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Special Note</h4>
                <p className={`p-3 rounded-md text-sm ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>{selectedOrder.customerDetails.specialNote || 'No special instructions provided.'}</p>
              </div>
              <div className={`border-t pt-4 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <h4 className={`font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Order Summary</h4>
                <ul className={`space-y-2 mb-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {selectedOrder.itemsDetails.map((item, index) => (
                    <li key={index} className="flex justify-between"><span>{item.name} × {item.quantity}</span><span>{selectedOrder.currencySymbol}{(item.price * item.quantity).toFixed(2)}</span></li>
                  ))}
                </ul>
                <div className={`flex justify-between font-bold border-t pt-2 ${darkMode ? "border-gray-600 text-white" : "border-gray-300 text-gray-900"}`}><span>Total:</span><span>{selectedOrder.currencySymbol}{selectedOrder.total.toFixed(2)}</span></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {orderToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`rounded-xl shadow-lg p-6 w-full max-w-sm border ${darkMode ? "bg-gray-800/95 border-gray-700 text-white" : "bg-white/95 border-gray-200 text-gray-900"}`}>
              <h3 className={`text-lg font-bold mb-4`}>Confirm Delete</h3>
              <p className={`mb-6 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Are you sure you want to delete order #{orderToDelete.id.slice(-6)}? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setOrderToDelete(null)} className={`px-4 py-2 border rounded-md font-semibold ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>Cancel</button>
                <button onClick={() => handleDeleteOrder(orderToDelete.id)} className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">Delete Order</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
