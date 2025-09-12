import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

// PayPal Icon Component
const PayPalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24">
        <path d="M8.339 4.227c.184-.967.828-1.74 1.636-2.112.527-.243 1.12-.378 1.748-.378h5.275c3.22 0 5.86 2.518 5.998 5.712.13 2.968-1.75 4.75-4.837 4.75h-2.183c-.536 0-.982.348-1.12.868l-.83 3.053-.14 1.139c-.08.438-.45.76-.889.76h-2.12c-.56 0-1.02-.423-1.07-.98l-2.01-8.62z" fill="#003087"></path>
        <path d="M9.135 7.42c.185-.965.828-1.74 1.636-2.112.527-.243 1.12-.378 1.748-.378h5.275c3.22 0 5.86 2.518 5.998 5.712.13 2.968-1.75 4.75-4.837 4.75h-2.183c-.536 0-.982.348-1.12.868l-.83 3.053-.14 1.139c-.08.438-.45.76-.889.76h-2.12c-.56 0-1.02-.423-1.07-.98L2.08 8.4h4.425c.57 0 1.05.44 1.08 1.01l.1 1.96-1.55-6.95z" fill="#009cde"></path>
        <path d="M7.78 11.122c.174-.91.77-1.614 1.53-1.97.49-.226 1.04-.352 1.63-.352h5.275c3.22 0 5.86 2.518 5.998 5.712.13 2.968-1.75 4.75-4.837 4.75h-2.183c-.536 0-.982.348-1.12.868l-.83 3.053-.14 1.139c-.08.438-.45.76-.889.76h-2.12c-.56 0-1.02-.423-1.07-.98L.004 12.13h4.425c.57 0 1.05.44 1.08 1.01l.1 1.96 2.17-9.008z" fill="#002f86"></path>
    </svg>
);


export default function PaymentMethodForm() {
  const navigate = useNavigate();
  
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    iban: '',
    swiftBic: '',
    bankAddress: '',
    beneficiaryAddress: '',
    payPalEmail: '', 
    razorpayLinkedAccountId: '', // To display status to the user
  });

  const [isUPIEnabled, setIsUPIEnabled] = useState(false);
  const [isBankEnabled, setIsBankEnabled] = useState(false);
  const [isInternationalBankEnabled, setIsInternationalBankEnabled] = useState(false);
  const [isPayPalEnabled, setIsPayPalEnabled] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState('User');

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
    const fetchPaymentSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          navigate('/login');
          return;
        }

        fetch(`https://bizzysite.onrender.com/api/user`, {
          headers: { Authorization: `Bearer ${userId}` }
        })
          .then(res => res.json())
          .then(data => { if (data?.name) setUserName(data.name); })
          .catch(err => console.error('Failed to fetch user info:', err));
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`https://bizzysite.onrender.com/api/business`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const paymentsData = data.payments || {};
          
          setPaymentDetails({
            upiId: paymentsData.upiId || '',
            accountHolderName: paymentsData.accountHolderName || '',
            accountNumber: paymentsData.accountNumber || '',
            ifscCode: paymentsData.ifscCode || '',
            iban: paymentsData.iban || '',
            swiftBic: paymentsData.swiftBic || '',
            bankAddress: paymentsData.bankAddress || '',
            beneficiaryAddress: paymentsData.beneficiaryAddress || '',
            payPalEmail: paymentsData.payPalEmail || '',
            razorpayLinkedAccountId: paymentsData.razorpayLinkedAccountId || '',
          });
          
          setIsUPIEnabled(paymentsData.upiEnabled || false);
          setIsBankEnabled(paymentsData.bankEnabled || false);
          setIsInternationalBankEnabled(paymentsData.internationalBankEnabled || false);
          setIsPayPalEnabled(paymentsData.payPalEnabled || false);
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentSettings();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (field) => {
    if (field === 'upiEnabled') {
      const newState = !isUPIEnabled;
      setIsUPIEnabled(newState);
      if (newState) {
        setIsBankEnabled(false);
        setIsInternationalBankEnabled(false);
        setIsPayPalEnabled(false);
      }
    } else if (field === 'bankEnabled') {
      const newState = !isBankEnabled;
      setIsBankEnabled(newState);
      if (newState) {
        setIsUPIEnabled(false);
        setIsInternationalBankEnabled(false);
        setIsPayPalEnabled(false);
      }
    } else if (field === 'internationalBankEnabled') {
      const newState = !isInternationalBankEnabled;
      setIsInternationalBankEnabled(newState);
      if (newState) {
        setIsUPIEnabled(false);
        setIsBankEnabled(false);
        setIsPayPalEnabled(false);
      }
    } else if (field === 'payPalEnabled') {
      const newState = !isPayPalEnabled;
      setIsPayPalEnabled(newState);
      if(newState) {
        setIsUPIEnabled(false);
        setIsBankEnabled(false);
        setIsInternationalBankEnabled(false);
      }
    }
  };

  const handleSavePayments = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    const payload = {
      upiEnabled: isUPIEnabled,
      bankEnabled: isBankEnabled,
      internationalBankEnabled: isInternationalBankEnabled,
      payPalEnabled: isPayPalEnabled,
      upiId: isUPIEnabled ? paymentDetails.upiId : "",
      accountHolderName: (isBankEnabled || isInternationalBankEnabled) ? paymentDetails.accountHolderName : "",
      accountNumber: isBankEnabled ? paymentDetails.accountNumber : "",
      ifscCode: isBankEnabled ? paymentDetails.ifscCode : "",
      iban: isInternationalBankEnabled ? paymentDetails.iban : "",
      swiftBic: isInternationalBankEnabled ? paymentDetails.swiftBic : "",
      bankAddress: isInternationalBankEnabled ? paymentDetails.bankAddress : "",
      beneficiaryAddress: isInternationalBankEnabled ? paymentDetails.beneficiaryAddress : "",
      payPalEmail: isPayPalEnabled ? paymentDetails.payPalEmail : "",
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
        body: JSON.stringify({ type: 'payments', data: payload }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const result = await response.json();

      if (response.ok) {
        // START: UPDATE STATE AFTER SAVING
        // This ensures the linked account ID is displayed immediately after creation.
        const newPaymentsData = result.data?.payments || {};
        setPaymentDetails(prev => ({
            ...prev,
            razorpayLinkedAccountId: newPaymentsData.razorpayLinkedAccountId || prev.razorpayLinkedAccountId,
        }));
        // END: UPDATE STATE AFTER SAVING
        toast.success(result.message || 'Payment details saved!', { position: 'top-right' });
      } else {
        setErrorMessage(`Failed to save: ${result.message || 'Unknown error'}`);
        toast.error(`Failed to save: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col bg-gray-50 text-black`}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow space-y-6 animate-pulse">
          <div className={`h-6 rounded w-1/3 bg-gray-300`}></div>
          <div className={`h-4 rounded w-1/2 bg-gray-300`}></div>
          <div className={`p-4 sm:p-6 rounded-lg shadow space-y-4 bg-white`}>
            <div className={`h-5 rounded w-1/4 bg-gray-300`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-indigo-100 via-pink-100 via-purple-200 to-white text-black`}>
      <Toaster />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        {errorMessage && (
          <div className={`mb-6 p-4 bg-red-50 border-l-4 border-red-500`}>
            <div className="flex">
              <div className="ml-3">
                <p className={`text-sm text-red-700`}>{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-6 rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <Link to="/signup" className={`text-3xl sm:text-4xl font-extrabold text-gray-900`}>
              BizzySite
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="focus:outline-none">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&bold=true`} alt="Profile" className="w-10 h-10 rounded-full"/>
                </button>
                <div className={`absolute right-0 mt-2 w-44 rounded-md shadow-lg z-50 bg-gray-800/90 text-white border border-gray-700 backdrop-blur-md transform transition-all duration-300 ease-out origin-top-right ${showMenu ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 -translate-y-2 scale-95 invisible"}`}>
                  <span className="block px-4 py-2 text-sm font-medium hover:bg-gray-700 hover:text-indigo-300 pointer-events-none opacity-50">Profile</span>
                  <div className="border-t border-gray-700"></div>
                  <Link to="/settings" className="block px-4 py-2 text-sm font-medium hover:bg-gray-700 hover:text-indigo-300">Settings</Link>
                </div>
              </div>
            </div>
          </div>
          <h2 className={`text-xl sm:text-2xl font-semibold mb-2 text-gray-900`}>
            {(() => {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 12) return <>🌞 Good Morning, {userName}!</>;
              if (hour >= 12 && hour < 18) return <>🌤️ Good Afternoon, {userName}!</>;
              if (hour >= 18 && hour < 22) return <>🌙 Good Evening, {userName}!</>;
              return <>🌌 Good Night, {userName}!</>;
            })()} 💳
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-6"></div>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-900 dark:text-gray-400 max-w-2xl">
            Manage your payments securely and effortlessly.
          </p>
        </div>

        {/* Navigation Bar */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
              {[{ name: "Setup", icon: "📊", path: "/storefront" }, { name: "Products", icon: "📦", path: "/products" }, { name: "Orders", icon: "🛒", path: "/orders" }, { name: "Customize", icon: "🎨", path: "/customize" }, { name: "Preview", icon: "🌐", path: "/navview" }, { name: "Payments", icon: "💳", path: "/payment" }].map((tab) => (
                <Link to={tab.path} key={tab.name} className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md text-sm sm:text-base ${window.location.pathname === tab.path ? "bg-white/20 text-white" : "text-white/80 hover:text-white"}`}>
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border border-white/20">
          <h3 className={`text-lg font-semibold mb-3 sm:mb-4 text-gray-800`}>
            Payout Methods
          </h3>
          <p className={`mb-4 sm:mb-6 text-gray-600`}>
            Configure how you want to receive payments from your sales.
          </p>

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
             {/* UPI Section */}
            <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/20 shadow-lg">
              <div className="mr-2">
                <h3 className={`text-base sm:text-lg font-semibold text-gray-800`}>🇮🇳 UPI Payment (India)</h3>
                <p className={`text-xs sm:text-sm text-gray-500`}>Receive payouts via UPI</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={isUPIEnabled} onChange={() => handleToggleChange('upiEnabled')}/>
                <div className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${isUPIEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${isUPIEnabled ? 'translate-x-5' : 'translate-x-1'}`}/>
                </div>
              </label>
            </div>
            {isUPIEnabled && (
              <div className="p-4 border rounded-lg animate-slideDown bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/20 shadow-lg">
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 text-gray-700`}>UPI ID *</label>
                    <input type="text" name="upiId" value={paymentDetails.upiId} onChange={handleInputChange} placeholder="yourname@okhdfc" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300`} required/>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bank Transfer (India) Section */}
            <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/20 shadow-lg">
              <div className="mr-2">
                <h3 className={`text-base sm:text-lg font-semibold text-gray-800`}>🇮🇳 Bank Transfer (India)</h3>
                <p className={`text-xs sm:text-sm text-gray-500`}>Direct Indian bank account transfer for automated 95/5 splits.</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={isBankEnabled} onChange={() => handleToggleChange('bankEnabled')}/>
                <div className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${isBankEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${isBankEnabled ? 'translate-x-5' : 'translate-x-1'}`}/>
                </div>
              </label>
            </div>

            {/* International Bank Transfer Section */}
            <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/20 shadow-lg">
              <div className="mr-2">
                <h3 className={`text-base sm:text-lg font-semibold text-gray-800`}>
                  🌍 International Bank Transfer
                </h3>
                <p className={`text-xs sm:text-sm text-gray-500`}>
                  Receive payouts to a non-Indian bank account.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={isInternationalBankEnabled} onChange={() => handleToggleChange('internationalBankEnabled')}/>
                <div className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${isInternationalBankEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${isInternationalBankEnabled ? 'translate-x-5' : 'translate-x-1'}`}/>
                </div>
              </label>
            </div>

            {/* Shared Bank Details Form */}
            {(isBankEnabled || isInternationalBankEnabled) && (
                 <div className="p-4 border rounded-lg animate-slideDown bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/20 shadow-lg">
                    {/* START: RAZORPAY LINKED ACCOUNT STATUS */}
                    {isBankEnabled && (
                        <div className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                            <h4 className="font-semibold text-indigo-800">Automated Payout Status</h4>
                            {paymentDetails.razorpayLinkedAccountId ? (
                                <p className="text-sm text-green-700">✓ Your account is linked with Razorpay and ready for automated 95/5 payouts.</p>
                            ) : (
                                <p className="text-sm text-yellow-800">! Please fill and save your bank details below to enable automated payouts.</p>
                            )}
                        </div>
                    )}
                    {/* END: RAZORPAY LINKED ACCOUNT STATUS */}
                    <h4 className={`text-sm font-semibold mb-3 text-gray-700`}>Bank Account Details</h4>
                    <div className="space-y-3">
                        <div>
                            <label className={`block text-sm font-medium mb-1 text-gray-700`}>Account Holder Name *</label>
                            <input type="text" name="accountHolderName" value={paymentDetails.accountHolderName} onChange={handleInputChange} placeholder="Full Name as on Bank Account" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300`} required/>
                        </div>
                        
                        {isBankEnabled && (
                            <>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 text-gray-700`}>Account Number *</label>
                                    <input type="text" name="accountNumber" value={paymentDetails.accountNumber} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md border-gray-300`} required/>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 text-gray-700`}>IFSC Code *</label>
                                    <input type="text" name="ifscCode" value={paymentDetails.ifscCode} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md border-gray-300`} required/>
                                </div>
                            </>
                        )}

                        {isInternationalBankEnabled && (
                            <>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 text-gray-700`}>IBAN *</label>
                                    <input type="text" name="iban" value={paymentDetails.iban} onChange={handleInputChange} placeholder="International Bank Account Number" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300`} required/>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 text-gray-700`}>SWIFT / BIC Code *</label>
                                    <input type="text" name="swiftBic" value={paymentDetails.swiftBic} onChange={handleInputChange} placeholder="e.g., CITIUS33" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300`} required/>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 text-gray-700`}>Beneficiary Address *</label>
                                    <textarea name="beneficiaryAddress" value={paymentDetails.beneficiaryAddress} onChange={handleInputChange} placeholder="Your full address (Street, City, Country)" rows={2} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300`} required />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 text-gray-700`}>Bank's Address *</label>
                                    <textarea name="bankAddress" value={paymentDetails.bankAddress} onChange={handleInputChange} placeholder="Your bank's full address (Street, City, Country)" rows={2} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300`} required />
                                </div>
                            </>
                        )}
                    </div>
                 </div>
            )}
            
            {/* START: REORDERED PAYPAL PAYOUT SECTION */}
            <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/20 shadow-lg">
                <div className="mr-2 flex items-center space-x-3">
                    <PayPalIcon />
                    <div>
                        <h3 className={`text-base sm:text-lg font-semibold text-gray-800`}>
                        PayPal Payout
                        </h3>
                        <p className={`text-xs sm:text-sm text-gray-500`}>Receive payouts via PayPal (International)</p>
                    </div>
                </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={isPayPalEnabled} onChange={() => handleToggleChange('payPalEnabled')}/>
                <div className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${isPayPalEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${isPayPalEnabled ? 'translate-x-5' : 'translate-x-1'}`}/>
                </div>
              </label>
            </div>
            {isPayPalEnabled && (
              <div className="p-4 border rounded-lg animate-slideDown bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/20 shadow-lg">
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 text-gray-700`}>PayPal Email Address *</label>
                    <input type="email" name="payPalEmail" value={paymentDetails.payPalEmail} onChange={handleInputChange} placeholder="your.email@example.com" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300`} required/>
                  </div>
                </div>
              </div>
            )}
            {/* END: REORDERED PAYPAL PAYOUT SECTION */}
          </div>

          <div className="flex justify-end">
            <button onClick={handleSavePayments} disabled={isSaving} className={`w-full mt-6 mb-6 px-4 py-2 rounded-md text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white transition-all duration-200 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}>
              {isSaving ? "Saving..." : "Save Payout Settings"}
            </button>
          </div>
        </div>
      </div>
       <footer className={`py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-800 text-white`}>
        <div className="max-w-7xl mx-auto"> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">BizzySite</h3>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                Empowering small businesses to succeed online with simple, powerful tools.
              </p>
            </div>
            <div></div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
                <li>Email: your-store@bizzysite.shop</li>
                <li>Phone: +91 7086758292</li>
              </ul>
            </div>
          </div>
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base border-gray-700 text-gray-400`}>
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}