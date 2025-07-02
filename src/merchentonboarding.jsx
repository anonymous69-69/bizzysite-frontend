// MerchantOnboarding.jsx
export function MerchantOnboarding() {
    const [accountId, setAccountId] = useState('');
  
    const handleSubmit = async () => {
      await fetch('/api/save-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ razorpayAccountId: accountId })
      });
      alert('Account linked successfully!');
    };
  
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Connect Razorpay Account</h2>
        <p className="mb-4">Enter your Razorpay account ID to receive payments</p>
        
        <div className="mb-4">
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="razp_merchant_123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Connect Account
        </button>
      </div>
    );
  }