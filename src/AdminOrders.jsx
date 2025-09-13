import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || "https://bizzysite.onrender.com";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All'); // All, Paid, Pending

    useEffect(() => {
        const fetchAllOrders = async () => {
            setIsLoading(true);
            try {
                // ---- START: FIX FOR ADMIN AUTHENTICATION ----
                // The backend expects a specific 'adminToken' for admin routes.
                // We now correctly retrieve this token from localStorage instead of the generic 'userId'.
                const adminToken = localStorage.getItem('adminToken'); 
                if (!adminToken) {
                    throw new Error("Admin authorization required. Please log in as an admin.");
                }
                // ---- END: FIX FOR ADMIN AUTHENTICATION ----

                const response = await fetch(`${API_BASE}/api/admin/orders`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch orders.');
                }
                const data = await response.json();
                
                // Filter for paid orders on the client-side as well for consistency
                const paidOrders = data.filter(order => order.paid === true);
                setOrders(paidOrders);

            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllOrders();
    }, []);

    const handlePayoutStatusChange = async (orderId, newStatus) => {
        try {
            // Also use the correct adminToken for this action
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/api/orders/${orderId}/payout-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ payoutStatus: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update payout status.');
            }

            const updatedOrder = await response.json();
            setOrders(prevOrders => prevOrders.map(o => o._id === orderId ? { ...o, payoutStatus: updatedOrder.payoutStatus } : o));
            toast.success(`Order marked as ${newStatus}`);
        } catch (err) {
            toast.error(err.message);
        }
    };
    
    // Helper function to render the correct payout info
    const renderPayoutInfo = (order) => {
        const payoutInfo = order.vendorPayoutInfo;
        if (!payoutInfo) return <span className="text-gray-500">Not Set</span>;

        if (payoutInfo.bankEnabled && payoutInfo.razorpayLinkedAccountId) {
            return <span className="text-green-400 font-semibold">Automatic (Route)</span>;
        }
        if (payoutInfo.upiEnabled && payoutInfo.upiId) {
            return <span className="text-cyan-400">UPI: {payoutInfo.upiId}</span>;
        }
        if (payoutInfo.payPalEnabled && payoutInfo.payPalEmail) {
            return <span className="text-blue-400">PayPal: {payoutInfo.payPalEmail}</span>;
        }
        if (payoutInfo.bankEnabled && payoutInfo.accountNumber) {
            return <span className="text-gray-300">Bank: ...{payoutInfo.accountNumber.slice(-4)}</span>;
        }
        if (payoutInfo.internationalBankEnabled && payoutInfo.iban) {
            return <span className="text-purple-400">IBAN: ...{payoutInfo.iban.slice(-4)}</span>;
        }
        return <span className="text-gray-500">Not Set</span>;
    };


    const filteredOrders = orders.filter(order => {
        if (filter === 'All') return true;
        return order.payoutStatus === filter;
    });

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <Toaster />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Admin - All Orders</h1>

                {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md">{error}</p>}
                
                <div className="flex space-x-4 mb-4">
                    <button onClick={() => setFilter('All')} className={`px-4 py-2 rounded-md ${filter === 'All' ? 'bg-indigo-600' : 'bg-gray-700'}`}>All</button>
                    <button onClick={() => setFilter('Pending')} className={`px-4 py-2 rounded-md ${filter === 'Pending' ? 'bg-yellow-600' : 'bg-gray-700'}`}>Pending Payout</button>
                    <button onClick={() => setFilter('Paid')} className={`px-4 py-2 rounded-md ${filter === 'Paid' ? 'bg-green-600' : 'bg-gray-700'}`}>Payout Paid</button>
                </div>

                {isLoading ? (
                    <p>Loading all orders...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 rounded-lg">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendor (Store ID)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payout Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendor's 95% Share</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payout Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredOrders.map(order => (
                                    <tr key={order._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order._id.slice(-8)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order.storeId.slice(-8)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{renderPayoutInfo(order)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{order.total.toFixed(2)} {order.currency}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">{(order.total * 0.95).toFixed(2)} {order.currency}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                order.payoutStatus === 'Paid' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'
                                            }`}>
                                                {order.payoutStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {order.payoutStatus === 'Pending' && (
                                                <button 
                                                    onClick={() => handlePayoutStatusChange(order._id, 'Paid')}
                                                    className="text-indigo-400 hover:text-indigo-300"
                                                >
                                                    Mark as Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

