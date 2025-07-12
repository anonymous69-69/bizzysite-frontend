import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function BusinessDashboard() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
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
      toast.error("Store ID not found. Please log in again.");
    }
  }, [navigate]);

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
      toast.error('Failed to load store information');
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

    try {
      setLoading(true);
      setError('');
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
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

      if (result.data?.business) {
        const updated = result.data.business;
        let slug = result.slug;
        if (!slug && updated.name) {
          slug = updated.name.toLowerCase().replace(/\s+/g, '-');
        }
        
        setBusinessInfo(prev => ({
          ...prev,
          ...updated,
          description: typeof updated.description === 'string' ? updated.description : '',
          shippingCharge: typeof updated.shippingCharge === 'number' ? updated.shippingCharge : prev.shippingCharge
        }));
        
        localStorage.setItem('businessName', updated.name || '');
        
        if (slug) {
          localStorage.setItem('storeSlug', slug);
          localStorage.setItem('storePath', slug);
        }
        
        localStorage.setItem('businessEmail', updated.email || '');
        localStorage.setItem('businessPhone', updated.phone || '');
      }
      toast.success('Business information saved successfully!');
    } catch (err) {
      setError(`Save failed: ${err.message}`);
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow space-y-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <Toaster position="top-right" />
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

        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className={`flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {[
                { name: 'Setup', icon: '📊' },
                { name: 'Products', icon: '📦' },
                { name: 'Orders', icon: '🛒' },
                { name: 'Customize', icon: '🎨' },
                { name: 'Preview', icon: '🌐' },
                { name: 'Payments', icon: '💳' }
              ].map((tab) => (
                <Link
                  key={tab.name}
                  to={
                    tab.name === 'Products' ? '/products' :
                    tab.name === 'Orders' ? '/orders' :
                    tab.name === 'Customize' ? '/customize' :
                    tab.name === 'Setup' ? '/storefront' :
                    tab.name === 'Preview' ? '/navview' :
                    tab.name === 'Payments' ? '/payment' : '#'
                  }
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                    activeTab === tab.name
                      ? darkMode
                        ? 'bg-indigo-800 text-white'
                        : 'bg-purple-100 text-indigo-700'
                      : darkMode
                        ? 'text-gray-300 hover:text-indigo-300'
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

        <div className={`rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Business Information
          </h3>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Tell us about your business to get started
          </p>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={businessInfo.name}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-black'
                  }`}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={businessInfo.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-black'
                  }`}
                />
              </div>
            </div>

            <div className={`border-t my-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

            <div className="mb-6">
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={businessInfo.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-black'
                }`}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                value={businessInfo.description}
                onChange={handleChange}
                placeholder="Tell us about your business"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-black'
                }`}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="address" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Business Address
              </label>
              <textarea
                id="address"
                name="address"
                value={businessInfo.address}
                onChange={handleChange}
                placeholder="Enter your business address"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-black'
                }`}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="shippingCharge" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Shipping Charge (in ₹)
              </label>
              <input
                type="number"
                id="shippingCharge"
                name="shippingCharge"
                value={businessInfo.shippingCharge !== '' ? businessInfo.shippingCharge : ''}
                onChange={handleChange}
                placeholder="Enter flat shipping charge"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-black'
                }`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                onClick={() => {
                  setAnimate(true);
                  setTimeout(() => setAnimate(false), 500);
                }}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${animate ? 'animate-wiggle' : ''}`}
              >
                {loading ? 'Saving...' : 'Save Business Information'}
              </button>
            </div>
          </form>
        </div>

        {storeId && (
          <div className={`rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
                  alert('Store ID copied to clipboard!');
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
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li>Email: rhythmsarma66@gmail.com</li>
                <li>Phone: +91 7086758292</li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li><Link to="#" className="hover:text-white">Blog</Link></li>
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
          </div>
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${
            darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-700 text-gray-400'
          }`}>
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}