import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from './ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function NavView() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [buttonsReady, setButtonsReady] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        const localStoreId = localStorage.getItem('storeId');

        if (!userId) {
          navigate('/login');
          return;
        }
        
        if (!localStoreId) {
            toast.error("Please set up your store first!");
            navigate('/storefront');
            return;
        }

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
            setButtonsReady(true);
          } else {
            // Handle case where business name/slug is not set
            toast.error("Please set your business name in the Setup tab first.");
            setButtonsReady(true); // Still show buttons, but they will be disabled
          }
        } else {
            throw new Error("Failed to fetch store data");
        }
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError('Failed to load store information');
        toast.error('Failed to load store information.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [navigate]);


  const handleCopyLink = () => {
    if (!storeSlug) {
      toast.error('Your store needs a name to create a shareable link.');
      return;
    }
    
    // MODIFIED: Use the current window's origin for the link
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/${storeSlug}`;

    navigator.clipboard.writeText(link)
      .then(() => toast.success('Store link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link.'));
  };

  const handleViewSite = () => {
    if (!storeSlug) {
      toast.error('Your store needs a name before it can be viewed.');
      return;
    }

    // MODIFIED: Use the current window's origin for the preview
    const baseUrl = window.location.origin;
    const previewUrl = `${baseUrl}/${storeSlug}`;
    
    window.open(previewUrl, "_blank");
  };

  return (
    <>
      {error && (
        <div className={`border rounded mb-6 px-4 py-3 ${darkMode ? 'bg-red-900/20 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'}`}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className={`rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Preview & Share
        </h3>
        <p className={`mb-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Here's the link to your live storefront. Share it with your customers!
        </p>

        {loading || !buttonsReady ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`h-6 w-3/4 mb-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                <div className={`h-4 w-full mb-6 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                <div className={`h-10 w-28 rounded-md ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Preview Your Website
              </h4>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                See exactly how your store looks to customers right now.
              </p>
              <button
                onClick={handleViewSite}
                className={`transition-transform duration-300 ease-in-out hover:scale-105 px-5 py-2 rounded-md font-semibold ${!storeSlug
                  ? 'bg-gray-500 text-white/70 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                disabled={!storeSlug}
              >
                View Site
              </button>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Share Your Store Link
              </h4>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Copy your unique store link to share on social media or with anyone.
              </p>
              <button
                onClick={handleCopyLink}
                className={`transition-transform duration-300 ease-in-out hover:scale-105 px-5 py-2 rounded-md font-semibold ${!storeSlug
                  ? 'border border-gray-500 text-gray-500 cursor-not-allowed'
                  : darkMode
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                    : 'border border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50'
                }`}
                disabled={!storeSlug}
              >
                Copy Link
              </button>
              {storeSlug && (
                <p className={`mt-3 text-xs break-words ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {/* MODIFIED: Display the dynamic URL */}
                  Your URL: <strong>{`${window.location.origin}/${storeSlug}`}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out;
          }
        `}
      </style>
    </>
  );
}