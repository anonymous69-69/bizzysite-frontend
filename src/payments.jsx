import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

// PayPal Icon Component
const PayPalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-6 w-6">
    <path
      fill="#003087"
      d="M9 28H4.8c-.5 0-.9-.4-.8-.9L7.5 3.1c.1-.5.5-.9 1-.9h9.3c4.1 0 7.2 2.4 6.3 7.3-.8 4.6-3.6 6.4-7.3 6.8-.5.1-.9.5-1 .9l-1.2 8c-.1.5-.5.8-1 .8z"
    />
    <path
      fill="#009cde"
      d="M21.5 9.3c-.2-.1-.5-.2-.7-.2h-6.4c-.5 0-.9.4-1 .8l-2.1 13.5c0 .4.3.7.7.7h3.6c.4 0 .8-.3.9-.7l.6-4.1c.1-.5.5-.9 1-.9 3.1-.2 5.5-1.9 6.2-5.7.5-2.2 0-3.7-1.8-4.4z"
    />
  </svg>
);

export default function PaymentMethodForm() {
  const navigate = useNavigate();
  // Assuming a dark mode default as the context is unavailable here.
  const darkMode = true; 

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
    razorpayLinkedAccountId: '',
  });

  const [isUPIEnabled, setIsUPIEnabled] = useState(false);
  const [isBankEnabled, setIsBankEnabled] = useState(false);
  const [isInternationalBankEnabled, setIsInternationalBankEnabled] = useState(false);
  const [isPayPalEnabled, setIsPayPalEnabled] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const token = localStorage.getItem('userId');
        if (!token) {
          navigate('/login');
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
        toast.error("Failed to load payment settings.");
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

  const handleToggleChange = (setter) => {
      // Disable all others when one is enabled
      setIsUPIEnabled(false);
      setIsBankEnabled(false);
      setIsInternationalBankEnabled(false);
      setIsPayPalEnabled(false);
      // Toggle the selected one
      setter(prev => !prev);
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

    const token = localStorage.getItem('userId');
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

      const result = await response.json();

      if (response.ok) {
        const newPaymentsData = result.data?.payments || {};
        setPaymentDetails(prev => ({
          ...prev,
          razorpayLinkedAccountId: newPaymentsData.razorpayLinkedAccountId || prev.razorpayLinkedAccountId,
        }));
        toast.success(result.message || 'Payment details saved!');
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
      <div className="w-full space-y-6 animate-pulse">
        <div className={`h-8 rounded w-1/3 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <div className={`h-5 rounded w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <div className={`p-6 rounded-lg shadow-lg space-y-4 ${darkMode ? 'bg-gray-800/40' : 'bg-white/60'}`}>
          <div className={`h-6 rounded w-1/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <div className={`h-12 rounded w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <div className={`h-12 rounded w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    );
  }

  const inputClasses = darkMode
    ? "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-600 bg-gray-900/70 text-white placeholder-gray-500"
    : "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 bg-white text-gray-800";
  
  const labelClasses = darkMode ? "block text-sm font-medium mb-1 text-gray-300" : "block text-sm font-medium mb-1 text-gray-700";

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {errorMessage && (
        <div className={`mb-6 p-4 rounded-md ${darkMode ? 'bg-red-900/60 border-red-500 text-red-200' : 'bg-red-100 border-red-400 text-red-700'}`}>
            <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className={`rounded-lg shadow-2xl p-4 sm:p-8 backdrop-blur-lg ${darkMode ? 'bg-gray-800/40 border border-gray-700' : 'bg-white/60 border'}`}>
        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Payout Methods
        </h3>
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure how you want to receive payments. Only one method can be active at a time.
        </p>

        <div className="space-y-4">
            {/* UPI */}
            <div className={`p-4 border rounded-lg transition-all duration-300 ${darkMode ? 'border-gray-700 bg-black/20' : 'border-gray-200 bg-gray-50/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="mr-2">
                        <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🇮🇳 UPI Payment (India)</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive payouts via UPI</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isUPIEnabled} onChange={() => handleToggleChange(setIsUPIEnabled)}/>
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
                {isUPIEnabled && (
                    <div className="mt-4 pt-4 border-t border-gray-700 animate-slideDown">
                        <label className={labelClasses}>UPI ID *</label>
                        <input type="text" name="upiId" value={paymentDetails.upiId} onChange={handleInputChange} placeholder="yourname@okhdfc" className={inputClasses} required/>
                    </div>
                )}
            </div>

            {/* Indian Bank Transfer */}
            <div className={`p-4 border rounded-lg transition-all duration-300 ${darkMode ? 'border-gray-700 bg-black/20' : 'border-gray-200 bg-gray-50/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="mr-2">
                        <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🇮🇳 Bank Transfer (India)</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Direct Indian bank account transfer.</p>
                    </div>
                     <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isBankEnabled} onChange={() => handleToggleChange(setIsBankEnabled)}/>
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
                {isBankEnabled && (
                    <div className="mt-4 pt-4 border-t border-gray-700 animate-slideDown space-y-4">
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-indigo-900/40 border-indigo-700' : 'bg-indigo-50 border-indigo-200'} border`}>
                            <h4 className={`font-semibold ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>Automated Payout Status</h4>
                            {paymentDetails.razorpayLinkedAccountId ? (
                                <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>✓ Your account is linked and ready for automated payouts.</p>
                            ) : (
                                <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>! Please save your bank details to enable automated payouts.</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClasses}>Account Holder Name *</label>
                            <input type="text" name="accountHolderName" value={paymentDetails.accountHolderName} onChange={handleInputChange} placeholder="Full Name" className={inputClasses} required/>
                        </div>
                        <div>
                            <label className={labelClasses}>Account Number *</label>
                            <input type="text" name="accountNumber" value={paymentDetails.accountNumber} onChange={handleInputChange} className={inputClasses} required/>
                        </div>
                        <div>
                            <label className={labelClasses}>IFSC Code *</label>
                            <input type="text" name="ifscCode" value={paymentDetails.ifscCode} onChange={handleInputChange} className={inputClasses} required/>
                        </div>
                    </div>
                )}
            </div>

            {/* International Bank Transfer */}
            <div className={`p-4 border rounded-lg transition-all duration-300 ${darkMode ? 'border-gray-700 bg-black/20' : 'border-gray-200 bg-gray-50/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="mr-2">
                        <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🌍 International Bank Transfer</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payouts to a non-Indian bank account.</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isInternationalBankEnabled} onChange={() => handleToggleChange(setIsInternationalBankEnabled)}/>
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
                {isInternationalBankEnabled && (
                    <div className="mt-4 pt-4 border-t border-gray-700 animate-slideDown space-y-4">
                        <div>
                            <label className={labelClasses}>Account Holder Name *</label>
                            <input type="text" name="accountHolderName" value={paymentDetails.accountHolderName} onChange={handleInputChange} placeholder="Full Name" className={inputClasses} required/>
                        </div>
                        <div>
                            <label className={labelClasses}>IBAN *</label>
                            <input type="text" name="iban" value={paymentDetails.iban} onChange={handleInputChange} placeholder="International Bank Account Number" className={inputClasses} required/>
                        </div>
                        <div>
                            <label className={labelClasses}>SWIFT / BIC Code *</label>
                            <input type="text" name="swiftBic" value={paymentDetails.swiftBic} onChange={handleInputChange} placeholder="e.g., CITIUS33" className={inputClasses} required/>
                        </div>
                        <div>
                            <label className={labelClasses}>Beneficiary Address *</label>
                            <textarea name="beneficiaryAddress" value={paymentDetails.beneficiaryAddress} onChange={handleInputChange} placeholder="Your full address (Street, City, Country)" rows={2} className={inputClasses} required />
                        </div>
                        <div>
                            <label className={labelClasses}>Bank's Address *</label>
                            <textarea name="bankAddress" value={paymentDetails.bankAddress} onChange={handleInputChange} placeholder="Your bank's full address" rows={2} className={inputClasses} required />
                        </div>
                    </div>
                )}
            </div>

            {/* PayPal */}
            <div className={`p-4 border rounded-lg transition-all duration-300 ${darkMode ? 'border-gray-700 bg-black/20' : 'border-gray-200 bg-gray-50/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="mr-2 flex items-center space-x-3">
                        <PayPalIcon />
                        <div>
                            <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>PayPal Payout</h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive payouts via PayPal (International)</p>
                        </div>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isPayPalEnabled} onChange={() => handleToggleChange(setIsPayPalEnabled)}/>
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
                {isPayPalEnabled && (
                    <div className="mt-4 pt-4 border-t border-gray-700 animate-slideDown">
                        <label className={labelClasses}>PayPal Email Address *</label>
                        <input type="email" name="payPalEmail" value={paymentDetails.payPalEmail} onChange={handleInputChange} placeholder="your.email@example.com" className={inputClasses} required/>
                    </div>
                )}
            </div>
        </div>

        <div className="flex justify-end mt-8">
          <button 
            onClick={handleSavePayments} 
            disabled={isSaving} 
            className={`px-6 py-3 rounded-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-in-out hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
          >
            {isSaving ? "Saving..." : "Save Payout Settings"}
          </button>
        </div>
      </div>
    </>
  );
}

