import { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function BusinessDashboard() {
  const theme = useTheme() || {};
  const { darkMode } = theme;
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
    address: '',
    shippingCharge: ''
  });
  const [storeId, setStoreId] = useState('');
  const [activeTab, setActiveTab] = useState('Setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('User');
  const [storeSlug, setStoreSlug] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedStoreId = localStorage.getItem('storeId');
    const userId = localStorage.getItem('userId');
  
    if (!userId) {
      navigate('/login');
      return;
    }
  
    // Fetch user info
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
  
    if (savedStoreId) {
      setStoreId(savedStoreId);
      fetchBusinessInfo(savedStoreId);
    } else {
      console.warn("No storeId found in localStorage");
    }
  }, [navigate]);

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


  const fetchBusinessInfo = async (storeId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`https://bizzysite.onrender.com/api/business`, {
        headers: {
          Authorization: `Bearer ${userId}`,
          'x-store-id': storeId
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
        description: business.description || '',
        address: business.address || '',
        shippingCharge: business.shippingCharge !== undefined ? String(business.shippingCharge) : ''
      }));
    } catch (err) {
      console.error('Failed to fetch business info:', err);
      toast.error("Failed to load store information");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({
      ...prev,
      [name]: name === 'shippingCharge' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Saving business information...");
  
    try {
      setLoading(true);
      setError('');
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        toast.error("You are not logged in. Redirecting...", { id: toastId });
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
        'x-store-id': storeId
      };
  
      const method = storeId ? 'PUT' : 'POST';
      const url = 'https://bizzysite.onrender.com/api/business';
      
      const res = await fetch(url, {
        method,
        headers,
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
  
      if (result.data?.business || result.slug) {
        const updated = result.data?.business || {};
        const newSlug = result.slug || (updated.name ? updated.name.toLowerCase().replace(/\s+/g, '-') : storeSlug);
        
        setBusinessInfo(prev => ({
          ...prev,
          ...updated,
          description: typeof updated.description === 'string' ? updated.description : '',
          shippingCharge: typeof updated.shippingCharge === 'number' ? updated.shippingCharge : prev.shippingCharge
        }));
        
        if (updated.name) localStorage.setItem('businessName', updated.name);
        
        if (newSlug) {
          setStoreSlug(newSlug);
          localStorage.setItem('storeSlug', newSlug);
          window.dispatchEvent(new CustomEvent('storeSlugUpdated', {
            detail: { slug: newSlug }
          }));
        }
        
        if (updated.email) localStorage.setItem('businessEmail', updated.email);
        if (updated.phone) localStorage.setItem('businessPhone', updated.phone);
      }
  
      toast.success("Business information saved successfully!", { id: toastId });
    } catch (err) {
      setError(`Save failed: ${err.message}`);
      toast.error(`Save failed: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisabledLinkClick = () => {
    toast.error("Please enter and save your business name to continue.");
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col overflow-x-hidden ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-indigo-900 via-purple-900 to-black text-white'
          : 'bg-gradient-to-br from-indigo-100 via-pink-100 via-purple-200 to-white text-black'
      }`}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-6 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <div className={`h-8 w-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>
            <div className={`h-7 w-1/2 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-1 w-24 rounded-full mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-5 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex space-x-2 sm:space-x-6 px-2 py-2">
            <div className={`h-10 w-24 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`h-10 w-24 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`h-10 w-24 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`h-10 w-24 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          </div>

          {/* Form Card Skeleton */}
          <div className={`rounded-xl shadow-lg p-6 sm:p-8 border ${
            darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'
          }`}>
            <div className={`h-6 w-1/3 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-4 w-1/2 rounded mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            
            <div className="space-y-6">
              {/* Input field skeleton */}
              <div>
                <div className={`h-4 w-1/4 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className={`h-10 w-full rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </div>
              {/* Input field skeleton */}
              <div>
                <div className={`h-4 w-1/4 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className={`h-10 w-full rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </div>
              {/* Textarea skeleton */}
              <div>
                <div className={`h-4 w-1/4 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className={`h-24 w-full rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </div>
              {/* Button skeleton */}
              <div className="flex justify-end">
                <div className={`h-11 w-48 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden ${
      darkMode
        ? 'bg-gradient-to-br from-gray-900 via-indigo-900 via-purple-900 to-black text-white'
        : 'bg-gradient-to-br from-indigo-100 via-pink-100 via-purple-200 to-white text-black'
    }`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 flex-grow w-full">
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

        <div className="mb-6 rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <Link 
              to="/signup" 
              className={`text-3xl sm:text-4xl font-extrabold ${
                darkMode
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'
                  : 'text-gray-900'
              }`}
            >
              BizzySite
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={menuRef}>
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
                <div
                  className={`absolute right-0 mt-2 w-44 rounded-md shadow-lg z-50 bg-gray-800 text-white border border-gray-700 transform transition-all duration-300 ease-out origin-top-right ${
                    showMenu ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 -translate-y-2 scale-95 invisible'
                  }`}
                >
                  <span
                    className="block px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 hover:text-indigo-300 transition-colors pointer-events-none opacity-50"
                  >
                    Profile
                  </span>
                  <div className="border-t border-gray-700"></div>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 hover:text-indigo-300 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-900'
          }`}>
            {(() => {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 12) return <span className={darkMode ? '' : 'text-gray-900'}>🌞 Good Morning, {userName}!</span>;
              if (hour >= 12 && hour < 18) return <span className={darkMode ? '' : 'text-gray-900'}>🌤️ Good Afternoon, {userName}!</span>;
              if (hour >= 18 && hour < 22) return <span className={darkMode ? '' : 'text-gray-900'}>🌙 Good Evening, {userName}!</span>;
              return <span className={darkMode ? '' : 'text-gray-900'}>🌌 Good Night, {userName}!</span>;
            })()} <span className={darkMode ? '' : 'text-gray-900'}>🚀</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-6"></div>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-900 dark:text-gray-400 max-w-2xl">
            Launch your brand, your way — fast, simple, and free ✨
          </p>
        </div>

        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              {[
                { name: 'Setup', icon: '📊', path: '/storefront' },
                { name: 'Products', icon: '📦', path: '/products' },
                { name: 'Orders', icon: '🛒', path: '/orders' },
                { name: 'Customize', icon: '🎨', path: '/customize' },
                { name: 'Preview', icon: '🌐', path: '/navview' },
                { name: 'Payments', icon: '💳', path: '/payment' }
              ].map((tab) => {
                const isDisabled = !businessInfo.name && tab.name !== 'Setup';

                if (isDisabled) {
                  return (
                    <button
                      key={tab.name}
                      onClick={handleDisabledLinkClick}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base opacity-50 cursor-not-allowed text-gray-400`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={tab.name}
                    to={tab.path}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                      activeTab === tab.name
                        ? darkMode ? 'bg-indigo-800 text-white' : 'bg-purple-100 text-indigo-700'
                        : darkMode ? 'text-gray-300 hover:text-indigo-300' : 'text-gray-700 hover:text-indigo-700'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl shadow-lg p-6 sm:p-8 transition-all transform hover:scale-[1.02] hover:shadow-2xl backdrop-blur-md border ${
            darkMode
              ? "bg-gray-800/40 border-gray-700 hover:border-indigo-400/60"
              : "bg-white/50 border-gray-200 hover:border-indigo-400/60"
          }`}
        >
          <h3
            className={`text-xl font-semibold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Business Information
          </h3>
          <p
            className={`mb-6 text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Tell us about your business to get started
          </p>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
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
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
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

            <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}></div>

            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
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
              <label
                htmlFor="address"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
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
              <label
                htmlFor="shippingCharge"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Shipping Charge (₹)
              </label>
              <input
                type="number"
                id="shippingCharge"
                name="shippingCharge"
                value={businessInfo.shippingCharge ?? ''}
                onChange={handleChange}
                placeholder="Enter flat shipping charge (e.g., 0 for free shipping)"
                className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  darkMode
                    ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
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
          <div className={`rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8 mt-8 transform transition-all hover:scale-[1.02] hover:shadow-2xl backdrop-blur-md border ${
            darkMode
              ? 'bg-gray-800/40 border-gray-700 hover:border-indigo-400/60'
              : 'bg-white/50 border-gray-200 hover:border-indigo-400/60'
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
                  toast.success('Store ID copied to clipboard!');
                }}
                className={`ml-2 px-3 py-1 text-sm rounded-md hover:bg-opacity-80 ${
                  darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
                }`}
              >
                Copy
              </button>
            </div>
            <p className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This is your unique store identifier. You'll need this when managing your store.
            </p>
          </div>
        )}

      </div>

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
             
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li>Email: your-store@bizzysite.shop</li>
              <li></li>
              </ul>
            </div>
          </div>
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${
            darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-700 text-gray-400'
          }`}>
            <p>© {new Date().getFullYear()} BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}