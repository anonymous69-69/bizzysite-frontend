import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NavView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Preview');
  const [storeId, setStoreId] = useState('');

  useEffect(() => {
    fetch('https://bizzysite.onrender.com/api/business')
      .then((res) => res.json())
      .then((data) => {
        if (data?.storeId) setStoreId(data.storeId);
      })
      .catch((err) => console.error('Failed to fetch storeId:', err));
  }, []);

  const handleCopyLink = () => {
    if (!storeId) {
      alert('Please save your business information first');
      return;
    }
    
    const link = `https://bizzysite-frontend.onrender.com/store/${storeId}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('Store link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy link. Please try again.');
      });
  };

  const handleViewSite = () => {
    if (!storeId) {
      alert('Please save your business information first');
      return;
    }
    
    window.open(
      `https://bizzysite-frontend.onrender.com/store/${storeId}`, 
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 flex-grow w-full">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-4">
            <Link to="/signup" className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">BizzySite</Link>
          </div>
        </div>
        <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Website Preview</h2>
        <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">Preview and share your online store</p>

        {/* Navigation Tabs */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-6 px-2 py-2 bg-gray-50 rounded-lg min-w-max">
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

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Website Preview Options</h3>
          <p className="text-gray-600 mb-6">Preview and share your store with customers</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Preview Your Website</h4>
              <p className="text-gray-500 text-sm mb-4">See how your store looks to customers</p>
              <button
                onClick={handleViewSite}
                className={`px-4 py-2 text-white rounded-md hover:bg-indigo-700 transition-colors ${
                  !storeId ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600'
                }`}
                disabled={!storeId}
              >
                View Site
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Share Your Store Link</h4>
              <p className="text-gray-500 text-sm mb-4">Copy your store link to share with customers</p>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 border rounded-md ${
                  !storeId 
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50'
                }`}
                disabled={!storeId}
              >
                Copy Link
              </button>
              {storeId && (
                <p className="mt-3 text-xs text-gray-500 break-words">
                  Your store URL: https://bizzysite-frontend.onrender.com/store/{storeId}
                </p>
              )}
            </div>
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