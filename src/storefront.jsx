import { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppNav } from './AppNavContext';

export default function Storefront() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { setNavLocked, registerErrorHandler } = useAppNav();
  
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    shippingCharge: ''
  });
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [nameInputError, setNameInputError] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    registerErrorHandler(() => {
      setNameInputError('Please fill this to go to other section 😔');
      nameInputRef.current?.focus();
    });
    return () => registerErrorHandler(null);
  }, [registerErrorHandler]);

  useEffect(() => {
    const savedStoreId = localStorage.getItem('storeId');
    if (savedStoreId) {
      setStoreId(savedStoreId);
      fetchBusinessInfo(savedStoreId);
    } else {
      setNavLocked(true);
    }
  }, []);

  const fetchBusinessInfo = async (currentStoreId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`https://bizzysite.onrender.com/api/business`, {
        headers: {
          'Authorization': `Bearer ${userId}`,
          'x-store-id': currentStoreId
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch business info");
      }

      const data = await response.json();
      const business = data.business || {};
      setBusinessInfo(prev => ({
        ...prev,
        name: business.name || '',
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        shippingCharge: business.shippingCharge !== undefined ? String(business.shippingCharge) : ''
      }));

      if (business.name) {
        setNavLocked(false);
      } else {
        setNavLocked(true);
      }
    } catch (err) {
      console.error('Failed to fetch business info:', err);
      toast.error("Failed to load store information");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name' && value.trim() !== '') {
      setNameInputError('');
    }
    setBusinessInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
  
    if (!businessInfo.name.trim()) {
      setNameInputError('Please provide a business name to proceed. 😔');
      setNavLocked(true);
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const toastId = toast.loading("Saving business information...");
  
    try {
      setLoading(true);
      setError('');
      setNameInputError('');
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error("You are not logged in. Redirecting...", { id: toastId });
        navigate('/login');
        return;
      }
      
      const res = await fetch('https://bizzysite.onrender.com/api/business', {
        method: storeId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
          'x-store-id': storeId
        },
        body: JSON.stringify({
          type: 'business',
          data: { ...businessInfo }
        })
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        throw new Error(result.message || "Failed to save business information");
      }
  
      const newStoreId = result.storeId || (result.data && result.data.storeId);
      if (newStoreId) {
        localStorage.setItem('storeId', newStoreId);
        setStoreId(newStoreId);
      }
      
      toast.success("Business information saved successfully!", { id: toastId });
      setNavLocked(false);

    } catch (err) {
      setError(`Save failed: ${err.message}`);
      toast.error(`Save failed: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`rounded-xl shadow-lg p-6 sm:p-8 border animate-pulse ${
        darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'
      }`}>
        <div className={`h-6 w-1/3 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <div className={`h-4 w-1/2 rounded mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className={`h-4 w-1/4 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <div className={`h-10 w-full rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>
          ))}
          <div className="flex justify-end">
            <div className={`h-11 w-48 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className={`border rounded mb-6 px-4 py-3 ${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-700'}`}>
          <strong>Error:</strong> {error}
          <button 
            className={`ml-4 text-sm underline ${darkMode ? 'text-red-200' : 'text-red-800'}`}
            onClick={() => setError('')}
          >
            Dismiss
          </button>
        </div>
      )}

      <div
        className={`rounded-xl shadow-lg p-6 sm:p-8 transition-all backdrop-blur-md border ${
          darkMode
            ? "bg-gray-800/40 border-gray-700"
            : "bg-white/50 border-gray-200"
        }`}
      >
        <h3 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Business Information
        </h3>
        <p className={`mb-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Tell us about your business to get started.
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label htmlFor="name" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              id="name"
              name="name"
              value={businessInfo.name}
              onChange={handleChange}
              placeholder="Enter your business name"
              className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
            {nameInputError && (
              <p className="text-red-500 text-sm mt-2">{nameInputError}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={businessInfo.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={businessInfo.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          <div>
            <label htmlFor="address" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Business Address
            </label>
            <textarea
              id="address"
              name="address"
              value={businessInfo.address}
              onChange={handleChange}
              placeholder="Enter your business address"
              rows={3}
              className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          <div>
            <label htmlFor="shippingCharge" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Shipping Charge (₹)
            </label>
            <input
              type="number"
              id="shippingCharge"
              name="shippingCharge"
              value={businessInfo.shippingCharge ?? ''}
              onChange={handleChange}
              placeholder="e.g., 0 for free shipping"
              className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                darkMode
                  ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg w-full sm:w-auto ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 hover:shadow-xl"
              } ${
                darkMode
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {loading ? "Saving..." : "Save Business Information"}
            </button>
          </div>
        </form>
      </div>

      {storeId && (
        <div className={`rounded-xl shadow-lg p-4 sm:p-6 mt-8 backdrop-blur-md border ${
          darkMode
            ? 'bg-gray-800/40 border-gray-700'
            : 'bg-white/50 border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Your Store ID
          </h3>
          <div className="flex items-center">
            <code className={`p-2 rounded-md font-mono text-sm sm:text-base break-all ${
              darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
            }`}>
              {storeId}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(storeId);
                toast.success('Store ID copied!');
              }}
              className={`ml-2 px-3 py-1 text-sm rounded-md transition-colors ${
                darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Copy
            </button>
          </div>
          <p className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            This is your unique store identifier. You'll need this for managing your store.
          </p>
        </div>
      )}
    </>
  );
}