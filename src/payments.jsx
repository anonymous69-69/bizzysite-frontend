import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PaymentMethodForm() {
  const [activeTab, setActiveTab] = useState('Payments');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    upiEnabled: false,
    bankEnabled: false,
    upiId: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await fetch(`https://bizzysite.onrender.com/api/business`);
        if (response.ok) {
          const data = await response.json();
          if (data.payments) {
            setPaymentDetails(data.payments);
          }
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      }
    };
    
    fetchPaymentSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (field) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSavePayments = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    
    // Create clean payload with only necessary fields
    const payload = {
      upiEnabled: paymentDetails.upiEnabled,
      bankEnabled: paymentDetails.bankEnabled,
      upiId: paymentDetails.upiEnabled ? paymentDetails.upiId : "",
      accountHolderName: paymentDetails.bankEnabled ? paymentDetails.accountHolderName : "",
      accountNumber: paymentDetails.bankEnabled ? paymentDetails.accountNumber : "",
      ifscCode: paymentDetails.bankEnabled ? paymentDetails.ifscCode : ""
    };

    try {
      console.log("📤 Sending payment details to backend:", {
        type: "payments",
        data: payload
      });

      const response = await fetch(`https://bizzysite.onrender.com/api/business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payments',
          data: payload
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const result = await response.json();
      
      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        console.error("❌ Backend response error:", result);
        setErrorMessage(`Failed to save: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error saving payment details:', error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-600 mb-4">Payment details saved successfully.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Link to="/signup" className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-purple-600 transition-colors">BizzySite</Link>
            {/*<Link
              to="/preview"
              className="px-3 py-1 sm:px-4 sm:py-2 border border-purple-300 text-purple-500 bg-white rounded-md font-medium hover:bg-purple-50 text-sm sm:text-base"
            >
              View Site
            </Link>*/}
          </div>
          <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Welcome to your business dashboard</h2>
          <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">Set up your online store in minutes and start selling today</p>
        </div>

        {/* Navigation Tabs */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-6 px-2 py-2 bg-gray-50 rounded-lg min-w-max">
              {[
         { name: 'Setup', icon: '📊', path: '/storefront' },
         { name: 'Products', icon: '📦', path: '/products' },
         { name: 'Orders', icon: '🛒', path: '/orders' },
         { name: 'Customize', icon: '🎨', path: '/customize' },
         { name: 'Preview', icon: '🌐', path: '/navview' }, // ✅ FIXED
         { name: 'Payments', icon: '💳', path: '/payment' }
              ].map((tab) => (
                <Link
                  to={tab.path}
                  key={tab.name}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                    activeTab === tab.name
                      ? 'bg-purple-100 text-indigo-700'
                      : 'text-gray-500 hover:text-indigo-600'
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Payment Methods</h3>
          <p className="text-gray-600 mb-4 sm:mb-6">Set up payment options for your customers</p>

          {/* Payment Toggles */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
              <div className="mr-2">
                <h3 className="text-base sm:text-lg font-semibold">UPI Payment</h3>
                <p className="text-xs sm:text-sm text-gray-500">Accept payments via UPI (Most Popular)</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={paymentDetails.upiEnabled} 
                  onChange={() => handleToggleChange('upiEnabled')} 
                />
                <div className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${paymentDetails.upiEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${paymentDetails.upiEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>

            {/* UPI Details Section */}
            {paymentDetails.upiEnabled && (
              <div className="p-4 border border-gray-200 rounded-lg animate-slideDown">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">UPI Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID *</label>
                    <input
                      type="text"
                      name="upiId"
                      value={paymentDetails.upiId}
                      onChange={handleInputChange}
                      placeholder="yourname@paytm or yourname@gpay"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Customers will see a QR code and your UPI ID for payments</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
              <div className="mr-2">
                <h3 className="text-base sm:text-lg font-semibold">Bank Transfer</h3>
                <p className="text-xs sm:text-sm text-gray-500">Direct bank account transfer</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={paymentDetails.bankEnabled} 
                  onChange={() => handleToggleChange('bankEnabled')} 
                />
                <div className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${paymentDetails.bankEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${paymentDetails.bankEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>

            {/* Bank Details Section */}
            {paymentDetails.bankEnabled && (
              <div className="p-4 border border-gray-200 rounded-lg animate-slideDown">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Bank Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={paymentDetails.accountHolderName}
                      onChange={handleInputChange}
                      placeholder="Enter account holder name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={paymentDetails.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter account number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={paymentDetails.ifscCode}
                      onChange={handleInputChange}
                      placeholder="Enter IFSC code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSavePayments}
              disabled={isSaving}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base ${
                isSaving 
                  ? 'bg-gray-400 text-gray-800 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Payment Settings'}
            </button>
          </div>
        </div>

        {/* Security Tips Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Security Tips</h3>
          <p className="text-gray-600 mb-4 sm:mb-6">Important security information for payment processing</p>

          <ul className="space-y-2 sm:space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">●</span>
              <span className="text-gray-700 text-sm sm:text-base">Never share your UPI PIN with anyone</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">●</span>
              <span className="text-gray-700 text-sm sm:text-base">Verify bank details before sharing with customers</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">●</span>
              <span className="text-gray-700 text-sm sm:text-base">Always confirm payments before dispatching orders</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">●</span>
              <span className="text-gray-700 text-sm sm:text-base">Keep payment receipts for record keeping</span>
            </li>
          </ul>
        </div>

        {/* Active Payment Methods Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Active Payment Methods</h3>
          <p className="text-gray-600 mb-4 sm:mb-6">Currently enabled payment options</p>

          <div className="space-y-3 sm:space-y-4">
            {paymentDetails.upiEnabled && (
              <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 text-sm sm:text-base">UPI Payments</h4>
                <p className="text-xs sm:text-sm text-gray-500">Enabled for customer checkout</p>
                {paymentDetails.upiId && (
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">UPI ID: {paymentDetails.upiId}</p>
                )}
              </div>
            )}
            {paymentDetails.bankEnabled && (
              <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 text-sm sm:text-base">Bank Transfers</h4>
                <p className="text-xs sm:text-sm text-gray-500">Enabled for customer checkout</p>
                {paymentDetails.accountHolderName && (
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">Account: {paymentDetails.accountHolderName} (••••{paymentDetails.accountNumber?.slice(-4)})</p>
                )}
              </div>
            )}
            {!paymentDetails.upiEnabled && !paymentDetails.bankEnabled && (
              <p className="text-gray-500 text-sm sm:text-base">No payment methods currently enabled</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
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