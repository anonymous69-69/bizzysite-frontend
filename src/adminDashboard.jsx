import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminToken = 'your-admin-token'; // Replace with actual token from auth context or localStorage

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'admin') {
      navigate('/signup'); // redirect to login or any fallback page
    }
  }, []);

  useEffect(() => {
    fetch('https://bizzysite.onrender.com/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {/* Store Summary Block */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Summary by Store</h2>
        <table className="min-w-full bg-white shadow-sm rounded-md overflow-hidden mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Store ID</th>
              <th className="px-4 py-2 text-left">Total Sales</th>
              <th className="px-4 py-2 text-left">Platform Fee (3%)</th>
              <th className="px-4 py-2 text-left">Payout Due</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(
              orders.reduce((acc, order) => {
                const store = order.storeId || 'Unknown';
                const total = order.total || 0;
                if (!acc[store]) acc[store] = { total: 0 };
                acc[store].total += total;
                return acc;
              }, {})
            ).map(([storeId, data]) => {
              const fee = data.total * 0.03;
              const payout = data.total - fee;
              return (
                <tr key={storeId} className="border-t">
                  <td className="px-4 py-2">{storeId}</td>
                  <td className="px-4 py-2">₹{data.total.toFixed(2)}</td>
                  <td className="px-4 py-2 text-red-500">₹{fee.toFixed(2)}</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">₹{payout.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Store ID</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Currency</th>
                <th className="px-4 py-2 text-left">Payout Status</th>
                <th className="px-4 py-2 text-left">Paid On</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{order._id}</td>
                  <td className="px-4 py-2">{order.storeId}</td>
                  <td className="px-4 py-2">{order.customer?.name || 'N/A'}</td>
                  <td className="px-4 py-2">{order.total?.toFixed(2)}</td>
                  <td className="px-4 py-2">{order.currency || '$'}</td>
                  <td className="px-4 py-2">
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={order.payoutStatus === 'Paid'}
                        onChange={async () => {
                          const newStatus = order.payoutStatus === 'Paid' ? 'Pending' : 'Paid';
                          try {
                            const res = await fetch(`https://bizzysite.onrender.com/api/orders/${order._id}/payout-status`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                              },
                              body: JSON.stringify({
                                payoutStatus: newStatus,
                                payoutDate: newStatus === 'Paid' ? new Date().toISOString() : null
                              }),
                            });

                            if (!res.ok) throw new Error('Failed to update payout status');

                            const updatedOrder = await res.json();
                            setOrders((prev) =>
                              prev.map((o) => (o._id === order._id ? updatedOrder : o))
                            );
                          } catch (err) {
                            console.error(err);
                            alert('Failed to update payout status.');
                          }
                        }}
                        className="form-checkbox h-5 w-5 text-green-600"
                      />
                      <span className={order.payoutStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}>
                        {order.payoutStatus === 'Paid' ? 'Paid' : 'Pending'}
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-2">{order.payoutDate ? new Date(order.payoutDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;