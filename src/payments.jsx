import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from './ThemeContext';
import axios from "axios";

export default function PaymentMethodForm() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Payments');
  const [paymentDetails, setPaymentDetails] = useState({
    upiEnabled: false,
    bankEnabled: false,
    upiId: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: ''
  });
  const [isUPIEnabled, setIsUPIEnabled] = useState(false);
  const [isBankEnabled, setIsBankEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          navigate('/login');
          return;
        }

        // Fetch user name
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
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`https://bizzysite.onrender.com/api/business`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPaymentDetails(prev => ({
            ...prev,
            upiEnabled: typeof business.upiEnabled === 'boolean' ? business.upiEnabled : false,
            bankEnabled: typeof data.bankEnabled === 'boolean' ? data.bankEnabled : false,
            upiId: business.upiId || '',
            accountHolderName: data.accountHolderName || '',
            accountNumber: data.accountNumber || '',
            ifscCode: data.ifscCode || ''
          }));
          setIsUPIEnabled(typeof data.upiEnabled === 'boolean' ? data.upiEnabled : false);
          setIsBankEnabled(typeof data.bankEnabled === 'boolean' ? data.bankEnabled : false);
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      } finally {
        setIsLoading(false);
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
    if (field === 'upiEnabled') {
      setIsUPIEnabled(prev => !prev);
      setPaymentDetails(prev => ({
        ...prev,
        upiEnabled: !prev.upiEnabled
      }));
    } else if (field === 'bankEnabled') {
      setIsBankEnabled(prev => !prev);
      setPaymentDetails(prev => ({
        ...prev,
        bankEnabled: !prev.bankEnabled
      }));
    }
  };

  const handleSavePayments = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    const payload = {
      upiEnabled: isUPIEnabled,
      bankEnabled: isBankEnabled,
      upiId: isUPIEnabled ? paymentDetails.upiId : "",
      accountHolderName: isBankEnabled ? paymentDetails.accountHolderName : "",
      accountNumber: isBankEnabled ? paymentDetails.accountNumber : "",
      ifscCode: isBankEnabled ? paymentDetails.ifscCode : ""
    };

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to save payment details.');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`https://bizzysite.onrender.com/api/business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'payments',
          data: payload
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const result = await response.json();

      if (response.ok) {
        toast.success('Payment details saved successfully', {
          position: 'top-right'
        });
      } else {
        setErrorMessage(`Failed to save: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow space-y-6 animate-pulse">
          <div className={`h-6 rounded w-1/3 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <div className={`h-4 rounded w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

          <div className={`p-4 sm:p-6 rounded-lg shadow space-y-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`h-5 rounded w-1/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-4 rounded w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-4 rounded w-5/6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>

          <div className={`p-4 sm:p-6 rounded-lg shadow space-y-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`h-5 rounded w-1/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-4 rounded w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-4 rounded w-5/6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        {/* Error Message */}
        {errorMessage && (
          <div className={`mb-6 p-4 ${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-50 border-l-4 border-red-500'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm ${darkMode ? 'text-red-100' : 'text-red-700'}`}>{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header with dark mode */}
        <div className={`mb-6 rounded-md p-3 ${darkMode ? 'bg-gray-800' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <Link 
              to="/signup" 
              className={`text-2xl sm:text-3xl font-bold transition-colors ${
                darkMode ? 'text-white hover:text-indigo-300' : 'text-gray-800 hover:text-purple-600'
              }`}
            >
              BizzySite
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative">
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
                  <div className={`absolute right-0 mt-2 w-40 border rounded-md shadow-lg z-50 dark:text-white ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'
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
          
          <h2 className={`text-lg sm:text-xl mb-6 sm:mb-8 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Welcome to your business dashboard
          </h2>
          
          <p className={`mb-6 sm:mb-8 text-sm sm:text-base ${
            darkMode ? 'text-gray-400' : 'text-gray-700'
          }`}>
            Set up your online store in minutes and start selling today
          </p>
        </div>

        {/* Navigation Tabs with dark mode */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className={`flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
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
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                    activeTab === tab.name
                      ? darkMode
                        ? 'bg-indigo-800 text-white' 
                        : 'bg-purple-100 text-indigo-700'
                      : darkMode
                        ? 'text-gray-300 hover:text-indigo-300'
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

        {/* Payment Methods Section with dark mode */}
        <div className={`rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 sm:mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Payment Methods
          </h3>
          <p className={`mb-4 sm:mb-6 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Set up payment options for your customers
          </p>

          {/* Payment Toggles */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <div className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="mr-2">
                <h3 className={`text-base sm:text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  UPI Payment
                </h3>
                <p className={`text-xs sm:text-sm ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Accept payments via UPI (Most Popular)
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isUPIEnabled} 
                  onChange={() => handleToggleChange('upiEnabled')} 
                />
                <div className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${isUPIEnabled ? 'bg-indigo-600' : darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${isUPIEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>

            {/* UPI Details Section */}
            {isUPIEnabled && (
              <div className={`p-4 border rounded-lg animate-slideDown ${
                darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-semibold mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  UPI Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      UPI ID *
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={paymentDetails.upiId}
                      onChange={handleInputChange}
                      placeholder="yourname@paytm or yourname@gpay"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      required
                    />
                    <p className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Customers will see a QR code and your UPI ID for payments
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="mr-2">
                <h3 className={`text-base sm:text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Bank Transfer
                </h3>
                <p className={`text-xs sm:text-sm ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Direct bank account transfer
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isBankEnabled} 
                  onChange={() => handleToggleChange('bankEnabled')} 
                />
                <div className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${isBankEnabled ? 'bg-indigo-600' : darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${isBankEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>

            {/* Bank Details Section */}
            {isBankEnabled && (
              <div className={`p-4 border rounded-lg animate-slideDown ${
                darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-semibold mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bank Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={paymentDetails.accountHolderName}
                      onChange={handleInputChange}
                      placeholder="Enter account holder name"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={paymentDetails.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter account number"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={paymentDetails.ifscCode}
                      onChange={handleInputChange}
                      placeholder="Enter IFSC code"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
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
                  ? darkMode 
                    ? 'bg-gray-700 text-gray-300 cursor-not-allowed' 
                    : 'bg-gray-400 text-gray-800 cursor-not-allowed'
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

        {/* Security Tips Section with dark mode */}
        <div className={`rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 sm:mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Security Tips
          </h3>
          <p className={`mb-4 sm:mb-6 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Important security information for payment processing
          </p>

          <ul className="space-y-2 sm:space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">●</span>
              <span className={`text-sm sm:text-base ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Never share your UPI PIN with anyone
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">●</span>
              <span className={`text-sm sm:text-base ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Verify bank details before sharing with customers
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">●</span>
              <span className={`text-sm sm:text-base ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Always confirm payments before dispatching orders
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">●</span>
              <span className={`text-sm sm:text-base ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Keep payment receipts for record keeping
              </span>
            </li>
          </ul>
        </div>

        {/* Active Payment Methods Section with dark mode */}
        <div className={`rounded-lg shadow p-4 sm:p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 sm:mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Active Payment Methods
          </h3>
          <p className={`mb-4 sm:mb-6 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Currently enabled payment options
          </p>

          <div className="space-y-3 sm:space-y-4">
            {isUPIEnabled && (
              <div className={`p-3 sm:p-4 border rounded-lg ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`font-medium text-sm sm:text-base ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  UPI Payments
                </h4>
                <p className={`text-xs sm:text-sm ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Enabled for customer checkout
                </p>
                {paymentDetails.upiId && (
                  <p className={`text-xs sm:text-sm mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    UPI ID: {paymentDetails.upiId}
                  </p>
                )}
              </div>
            )}
            {isBankEnabled && (
              <div className={`p-3 sm:p-4 border rounded-lg ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`font-medium text-sm sm:text-base ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Bank Transfers
                </h4>
                <p className={`text-xs sm:text-sm ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Enabled for customer checkout
                </p>
                {paymentDetails.accountHolderName && (
                  <p className={`text-xs sm:text-sm mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Account: {paymentDetails.accountHolderName} (••••{paymentDetails.accountNumber?.slice(-4)})
                  </p>
                )}
              </div>
            )}
            {!isUPIEnabled && !isBankEnabled && (
              <p className={`text-sm sm:text-base ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                No payment methods currently enabled
              </p>
            )}
          </div>
        </div>
      </div>

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
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
                <li>Email: rhythmsarma66@gmail.com</li>
                <li>Phone: +91 7086758292</li>
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
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${
            darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-700 text-gray-400'
          }`}>
            <p>© 2024 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}