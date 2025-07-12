import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from './ThemeContext';

export default function NavView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Preview');
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { darkMode } = useTheme();
  const [userName, setUserName] = useState('User');
  const [showMenu, setShowMenu] = useState(false);
  const [storeSlug, setStoreSlug] = useState('');

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const localStoreId = localStorage.getItem('storeId');

        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch user info
        const userRes = await fetch(`https://bizzysite.onrender.com/api/user`, {
          headers: { Authorization: `Bearer ${userId}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData?.name) setUserName(userData.name);
        }

        // Fetch store data
        if (localStoreId) {
          setStoreId(localStoreId);
          const storeRes = await fetch(`https://bizzysite.onrender.com/api/business`, {
            headers: {
              'Authorization': `Bearer ${userId}`,
              'x-store-id': localStoreId
            }
          });
          
          if (storeRes.ok) {
            const storeData = await storeRes.json();
            const slug = storeData.slug || storeData.business?.name?.toLowerCase().replace(/\s+/g, '-');
            if (slug) {
              setStoreSlug(slug);
              localStorage.setItem('storeSlug', slug);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError('Failed to load store information');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();

    const handleSlugUpdate = (event) => {
      if (event.detail?.slug) {
        setStoreSlug(event.detail.slug);
        localStorage.setItem('storeSlug', event.detail.slug);
      }
    };

    window.addEventListener('storeSlugUpdated', handleSlugUpdate);
    
    return () => {
      window.removeEventListener('storeSlugUpdated', handleSlugUpdate);
    };
  }, []);

  const handleCopyLink = () => {
    const slugToUse = storeSlug || localStorage.getItem('storeSlug');
    if (!slugToUse) {
      toast.error('Please set up your business name first');
      return;
    }

    const link = `https://bizzysite.shop/${slugToUse}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Store link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleViewSite = () => {
    const slugToUse = storeSlug || localStorage.getItem('storeSlug');
    if (!slugToUse) {
      toast.error('Please set up your business name first');
      return;
    }
    window.open(`https://bizzysite.shop/${slugToUse}`, '_blank');
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        <div className={`mb-6 rounded-md p-3 ${darkMode ? 'bg-gray-800' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <Link
              to="/signup"
              className={`text-2xl sm:text-3xl font-bold transition-colors ${darkMode ? 'text-white hover:text-indigo-300' : 'text-gray-800 hover:text-purple-600'}`}
            >
              BizzySite
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="focus:outline-none">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&bold=true`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                </button>
                {showMenu && (
                  <div className={`absolute right-0 mt-2 w-40 border rounded-md shadow-lg z-50 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'}`}>
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

          <h2 className={`text-lg sm:text-xl mb-6 sm:mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Website Preview
          </h2>

          <p className={`mb-6 sm:mb-8 text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Preview and share your online store
          </p>
        </div>

        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className={`flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
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

        <div className={`rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Website Preview Options
          </h3>
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Preview and share your store with customers
          </p>

          {loading ? (
            <div className="text-center py-8">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${darkMode ? 'border-indigo-400' : 'border-indigo-600'}`}></div>
              <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading your store information...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Preview Your Website
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  See how your store looks to customers
                </p>
                <button
                  onClick={handleViewSite}
                  className={`px-4 py-2 rounded-md transition-colors ${!storeId
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  disabled={!storeId}
                >
                  View Site
                </button>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Share Your Store Link
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Copy your store link to share with customers
                </p>
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-md ${!storeId
                    ? 'border border-gray-500 text-gray-500 cursor-not-allowed'
                    : darkMode
                      ? 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
                      : 'border border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50'
                  }`}
                  disabled={!storeId}
                >
                  Copy Link
                </button>
                {storeSlug && (
                  <p className={`mt-3 text-xs break-words ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Your store URL: https://bizzysite.shop/{storeSlug}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
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
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-700 text-gray-400'}`}>
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}