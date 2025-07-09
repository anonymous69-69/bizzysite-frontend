import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://bizzysite.onrender.com/api/user', {
          headers: {
            'Authorization': `Bearer ${userId}`
          }
        });
        
        const name = response.data.name || localStorage.getItem('userName') || '';
        const email = response.data.email || localStorage.getItem('userEmail') || '';
        setUserData({ name, email });
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put('https://bizzysite.onrender.com/api/user', userData, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });

      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userEmail', userData.email);

      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('storeId');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-4">
            <Link to="/signup" className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">BizzySite</Link>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="focus:outline-none"
            >
              <img
                src="https://avatars.githubusercontent.com/u/9919?s=64&v=4"
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white"
              />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
              </div>
            )}
          </div>
        </div>
        <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Welcome to your business dashboard</h2>
        <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">Set up your online store in minutes and start selling today</p>

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
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                    activeTab === tab.name
                      ? 'bg-purple-100 text-indigo-700'
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

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Profile Settings</h3>
          <p className="text-gray-600 mb-6">Manage your account information</p>

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

          <form onSubmit={handleUpdateProfile}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email address"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
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
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
                <li>Email: hello@bizzysite.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Business St, City</li>
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
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>© 2024 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}