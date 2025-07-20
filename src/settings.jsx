// settings.jsx
import { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Settings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // Modal states for delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Settings states
  const { darkMode, setDarkMode } = useTheme();
  const [notifications, setNotifications] = useState({
    orders: true,
    promotions: true,
    reminders: true
  });
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('en');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new !== passwordForm.confirm) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const userId = localStorage.getItem('userId');
      
      // This would call your backend API in a real implementation
      // await axios.put('/api/user/password', { 
      //   current: passwordForm.current,
      //   new: passwordForm.new
      // }, {
      //   headers: { Authorization: `Bearer ${userId}` }
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password changed successfully!');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.response?.data?.message || 'Failed to change password');
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('language', language);
    toast.success('Preferences saved!');
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('storeId');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-4">
            <Link to="/signup" className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} hover:text-indigo-600 transition-colors`}>
              BizzySite
            </Link>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="focus:outline-none"
            >
              <img
                src="https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&bold=true"
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            </button>
            {showMenu && (
              <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <Link
                  to="/profile"
                  className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Settings
                </Link>
              </div>
            )}
          </div>
        </div>
        <h2 className={`text-lg sm:text-xl mb-6 sm:mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your account preferences
        </h2>

        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className={`flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {[
                { name: 'Setup', icon: '📊', path: '/storefront' },
                { name: 'Products', icon: '📦', path: '/products' },
                { name: 'Orders', icon: '🛒', path: '/orders' },
                { name: 'Customize', icon: '🎨', path: '/customize' },
                { name: 'Preview', icon: '🌐', path: '/navview' },
                { name: 'Payments', icon: '💳', path: '/payment' },
                { name: 'Settings', icon: '⚙️', path: '/settings' }
              ].map((tab) => (
                <Link
                  to={tab.path}
                  key={tab.name}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                    activeTab === tab.name
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-indigo-600'}`
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <div className={`rounded-lg shadow p-4 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Appearance
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Dark Mode
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Switch between light and dark themes
                  </p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label
                  className={`block font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Currency
                </label>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Indian Rupee (₹)</p>
              </div>

              <div>
                <label
                  className={`block font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Language
                </label>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>English</p>
              </div>

              {/* Save Preferences button removed since dropdowns are static */}
            </div>
          </div>

          {/* Password Settings */}
          <div className={`rounded-lg shadow p-4 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Password & Security
            </h3>
            
            <form onSubmit={handleChangePassword}>
              {error && (
                <div className={`mb-4 px-4 py-3 rounded ${
                  darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
                }`}>
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="mb-4">
                <label 
                  htmlFor="currentPassword" 
                  className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="current"
                  value={passwordForm.current}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  placeholder="Enter current password"
                />
              </div>

              <div className="mb-4">
                <label 
                  htmlFor="newPassword" 
                  className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="new"
                  value={passwordForm.new}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
              </div>

              <div className="mb-6">
                <label 
                  htmlFor="confirmPassword" 
                  className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirm"
                  value={passwordForm.confirm}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Settings */}
          <div className={`rounded-lg shadow p-4 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Order Notifications
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Get notified about new orders
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange('orders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.orders ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.orders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Promotional Offers
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Receive marketing promotions
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange('promotions')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.promotions ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.promotions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* Account Management */}
          <div className={`rounded-lg shadow p-4 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Account Management
            </h3>
            
            <div className="space-y-6">
              <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Delete Account
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Permanently delete your account and all store data
                </p>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
            <p className="mb-6 text-sm">
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const userId = localStorage.getItem('userId');
                    if (!userId) {
                      toast.error('User ID not found');
                      return;
                    }

                    await axios.delete('https://bizzysite.onrender.com/api/user', {
                      headers: { Authorization: `Bearer ${userId}` }
                    });

                    toast.success('Account deleted successfully');
                    localStorage.clear();
                    navigate('/signup');
                  } catch (error) {
                    console.error('Delete account error:', error);
                    toast.error('Failed to delete account');
                  } finally {
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                  }
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={`py-8 sm:py-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-800 text-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">BizzySite</h3>
              <p className="mb-4 text-sm sm:text-base">
                Empowering small businesses to succeed online with simple, powerful tools.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4"></h4>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
               
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li> Email: your-store@bizzysite.shop</li>
                <li></li>
                
              </ul>
            </div>
          </div>
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-700 text-gray-400'}`}>
            <p>© 2024 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}