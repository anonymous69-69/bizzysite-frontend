
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
    address: ''
  });
  const [storeId, setStoreId] = useState('');
  const [activeTab, setActiveTab] = useState('Setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const savedStoreId = localStorage.getItem('storeId');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      navigate('/login');
      return;
    }
    
    if (savedStoreId) {
      setStoreId(savedStoreId);
      fetchBusinessInfo(savedStoreId);
    }
  }, []);

  const fetchBusinessInfo = (storeId) => {
    const userId = localStorage.getItem("userId");
    fetch(`https://bizzysite.onrender.com/api/store/${storeId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.name || data?.business) {
          const info = data.business || data; // support both shapes
          setBusinessInfo({
            name: info.name || '',
            phone: info.phone || '',
            email: info.email || '',
            description: info.description || '',
            address: info.address || ''
          });
        }
      })
      .catch(err => console.error('Failed to fetch business info:', err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!businessInfo.name.trim()) {
      alert('Business name is required');
      return;
    }

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
        'Authorization': `Bearer ${userId}`
      };

      if (storeId) {
        headers['x-store-id'] = storeId;
      }

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

      setBusinessInfo(result.data?.business || businessInfo);
      toast.success('Business information saved successfully!');
    } catch (err) {
      setError(`Save failed: ${err.message}`);
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 flex-grow w-full">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
            <button 
              className="ml-4 text-sm underline"
              onClick={() => setError('')}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-4">
            <Link to="/signup" className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">BizzySite</Link>
          </div>
        </div>
        <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Welcome to your business dashboard</h2>
        <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">Set up your online store in minutes and start selling today</p>

        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-6 px-2 py-2 bg-gray-50 rounded-lg min-w-max">
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
                      ? 'bg-purple-100 text-indigo-700'
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

        <div id="business-info" className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
          <p className="text-gray-600 mb-6">Tell us about your business to get started</p>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={businessInfo.name}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={businessInfo.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={businessInfo.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                value={businessInfo.description}
                onChange={handleChange}
                placeholder="Describe your business"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="mb-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                id="address"
                name="address"
                value={businessInfo.address}
                onChange={handleChange}
                placeholder="Enter your business address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Store ID</h3>
            <div className="flex items-center">
              <code className="bg-gray-100 p-2 rounded-md font-mono text-sm sm:text-base break-all">
                {storeId}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(storeId);
                  alert('Store ID copied to clipboard!');
                }}
                className="ml-2 px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              This is your unique store identifier. You'll need this when managing your store.
            </p>
          </div>
        )}

      </div>

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
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
