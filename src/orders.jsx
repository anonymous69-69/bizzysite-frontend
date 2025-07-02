import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [orders, setOrders] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5050/api/orders")
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

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
  };

  const handleDeleteOrder = (orderId) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    fetch(`http://localhost:5050/api/orders/${orderId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete order');
        console.log('✅ Order deleted from DB');
      })
      .catch((err) => {
        console.error("❌ Failed to delete order from backend", err);
      });
    setOrderToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Link to="/signup" className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-purple-600 transition-colors">BizzySite</Link>
          </div>
          <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Welcome to your business dashboard</h2>
          <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">Set up your online store in minutes and start selling today</p>
        </div>

        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-6 px-2 py-2 bg-gray-50 rounded-lg min-w-max">
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
                      ? 'bg-purple-100 text-indigo-700'
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

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Order Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Track and manage your customer orders</p>
          </div>
          <div className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm border border-gray-200 w-fit">
            <span className="text-gray-600 text-sm sm:text-base">Total Orders Today: </span>
            <span className="font-bold text-indigo-600">{totalOrdersToday}</span>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {statusTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap focus:outline-none ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              {tab} {tab !== 'All Orders' && (
                <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {orders.filter(order => order.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'All Orders' 
                  ? "You haven't received any orders yet." 
                  : `You don't have any ${activeTab.toLowerCase()} orders.`}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <li key={order.id} className="p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-base sm:text-lg font-medium text-indigo-600">{order.id}</h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Customer: <span className="text-gray-700">{order.customer}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Date: <span className="text-gray-700">{order.date}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-semibold">
                        {order.currency}{order.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{order.items} item{order.items !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                    <ul className="space-y-1 sm:space-y-2">
                      {order.itemsDetails.map((item, index) => (
                        <li key={index} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-800">
                            {item.currency}{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 flex flex-wrap justify-end gap-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 rounded-md text-gray-700 text-xs sm:text-sm hover:bg-gray-50"
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

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Order Details - {selectedOrder.id}</h3>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="space-y-1">
                  <p><span className="text-gray-600">Full Name:</span> {selectedOrder.customerDetails.fullName}</p>
                  <p><span className="text-gray-600">Instagram:</span> {selectedOrder.customerDetails.instagramId || 'N/A'}</p>
                  <p><span className="text-gray-600">Phone:</span> {selectedOrder.customerDetails.phone}</p>
                  <p><span className="text-gray-600">Email:</span> {selectedOrder.customerDetails.email}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Shipping Address</h4>
                <div className="space-y-1">
                  <p>{selectedOrder.customerDetails.address}</p>
                  <p>{selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state}</p>
                  <p>{selectedOrder.customerDetails.pincode}</p>
                  <p>{selectedOrder.customerDetails.country}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Special Note</h4>
              <p className="bg-gray-50 p-3 rounded-md">
                {selectedOrder.customerDetails.specialNote || 'No special instructions provided'}
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">Order Summary</h4>
              <ul className="space-y-2 mb-4">
                {selectedOrder.itemsDetails.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{item.currency}{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>{selectedOrder.currency}{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Confirm Delete</h3>
              <button 
                onClick={() => setOrderToDelete(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <p className="mb-6">
              Are you sure you want to delete order {orderToDelete.id}? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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

      <footer className="bg-gray-800 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto"> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">BizzySite</h3>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                Empowering small businesses to succeed online with simple, powerful tools.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
                <li>Email: hello@bizzysite.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Business St, City</li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
                <li><Link to="#" className="hover:text-white">Blog</Link></li>
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>© 2024 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}