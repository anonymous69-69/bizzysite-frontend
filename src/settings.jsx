import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable UI Components ---

const SettingsCard = ({ title, description, children, darkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/60 border-gray-200'} backdrop-blur-md border`}
  >
    <h3 className={`text-xl font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 text-sm`}>{description}</p>
    <div className="space-y-6">{children}</div>
  </motion.div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-indigo-500' : 'bg-gray-600'
    }`}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      className={`inline-block h-4 w-4 transform rounded-full bg-white ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);


export default function SettingsPage() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  
  // States
  const [activeSection, setActiveSection] = useState('appearance');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
    }
  }, [navigate]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const userId = localStorage.getItem('userId');
      await axios.delete('https://bizzysite.onrender.com/api/user', {
        headers: { Authorization: `Bearer ${userId}` }
      });
      toast.success('Account deleted successfully');
      localStorage.clear();
      navigate('/signup');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const settingsSections = {
    appearance: {
      title: 'Appearance',
      description: 'Customize the look and feel of your dashboard.',
      icon: '🎨',
      content: (
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Dark Mode</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Switch between light and dark themes.</p>
          </div>
          <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </div>
      ),
    },
    security: {
      title: 'Password & Security',
      description: 'Manage your password and account security.',
      icon: '🔒',
      content: <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Password management form coming soon.</p>,
    },
    notifications: {
      title: 'Notifications',
      description: 'Choose how you want to be notified.',
      icon: '🔔',
      content: <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Notification settings coming soon.</p>,
    },
    account: {
      title: 'Account Management',
      description: 'Manage your account and data.',
      icon: '👤',
      content: (
        <div className={`pt-4 ${darkMode ? 'border-white/10' : 'border-gray-200'} border-t`}>
          <h4 className="font-medium text-red-500 dark:text-red-400">Delete Account</h4>
          <p className={`text-sm my-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete My Account
          </button>
        </div>
      ),
    },
  };
  
  return (
    <>
      <Toaster position="top-right" />
      
      <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Side Navigation */}
          <aside className="lg:w-1/4">
              <nav className="space-y-2">
                  {Object.keys(settingsSections).map(key => (
                      <button key={key} onClick={() => setActiveSection(key)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                              activeSection === key 
                                ? (darkMode ? 'bg-white/10 text-white' : 'bg-indigo-100 text-indigo-700') 
                                : (darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
                          }`}
                      >
                          <span className="text-xl">{settingsSections[key].icon}</span>
                          <span className="font-medium">{settingsSections[key].title}</span>
                      </button>
                  ))}
              </nav>
          </aside>

          {/* Settings Content */}
          <main className="flex-1">
              <AnimatePresence mode="wait">
                  <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                  >
                      <SettingsCard
                          title={settingsSections[activeSection].title}
                          description={settingsSections[activeSection].description}
                          darkMode={darkMode}
                      >
                          {settingsSections[activeSection].content}
                      </SettingsCard>
                  </motion.div>
              </AnimatePresence>
          </main>
      </div>
      
      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`p-6 rounded-lg shadow-xl max-w-md w-full ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'} border`}
            >
              <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
              <p className={`mb-6 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure? All of your store data will be lost. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`px-4 py-2 rounded font-medium transition-colors ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
