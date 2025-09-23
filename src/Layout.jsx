import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';

export default function Layout() {
  const { darkMode } = useTheme();
  const [userName, setUserName] = useState("User");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user info from API
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error("You are not logged in. Redirecting...");
      navigate('/signup');
      return;
    }
  
    fetch(`https://bizzysite.onrender.com/api/user`, {
      headers: { 'Authorization': `Bearer ${userId}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.name) setUserName(data.name);
      })
      .catch(err => console.error('Failed to fetch user info:', err));
  }, [navigate]);

  // Hide dropdown when clicking outside
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

  // Define navigation tabs
  const tabs = [
    { name: 'Setup', icon: '📊', path: '/storefront' },
    { name: 'Products', icon: '📦', path: '/products' },
    { name: 'Orders', icon: '🛒', path: '/orders' },
    { name: 'Customize', icon: '🎨', path: '/customize' },
    { name: 'Preview', icon: '🌐', path: '/navview' },
    { name: 'Payments', icon: '💳', path: '/payment' }
  ];

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Good Morning, ${userName}!`;
    if (hour >= 12 && hour < 18) return `Good Afternoon, ${userName}!`;
    if (hour >= 18 && hour < 22) return `Good Evening, ${userName}!`;
    return `Good Night, ${userName}!`;
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden ${
      darkMode
        ? 'bg-gradient-to-br from-gray-900 via-indigo-900 via-purple-900 to-black text-white'
        : 'bg-gradient-to-br from-indigo-100 via-pink-100 via-purple-200 to-white text-black'
    }`}>
      {/* Header Section */}
      <header className="max-w-6xl mx-auto w-full p-4 sm:p-6">
        <div className="flex justify-between items-center mb-2">
          <Link 
            to="/storefront" 
            className={`text-3xl sm:text-4xl font-extrabold ${
              darkMode
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}
          >
            BizzySite
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="focus:outline-none"
              aria-label="Profile menu"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&bold=true`}
                alt="Profile Avatar"
                className="w-10 h-10 rounded-full border-2 border-indigo-400"
              />
            </button>
            <div
              className={`absolute right-0 mt-2 w-44 rounded-md shadow-lg z-50 transform transition-all duration-300 ease-out origin-top-right ${
                darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 border'
              } ${
                showMenu ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 -translate-y-2 scale-95 invisible'
              }`}
            >
              <Link
                to="/settings"
                className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                onClick={() => setShowMenu(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => { 
                  setShowMenu(false); 
                  localStorage.removeItem('userId'); // Clear all user data on logout
                  navigate('/signup'); 
                  toast.success("Logged out successfully!");
                }}
                className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/50' : 'text-red-600 hover:bg-red-50'}`}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
        <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
          {getGreeting()} 
        </h2>
        <p className={`mb-4 text-base sm:text-lg max-w-2xl ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          Launch your brand, your way — fast, simple, and free ✨
        </p>
      </header>

      {/* Tab Navigation Bar */}
      <nav className="max-w-6xl mx-auto w-full px-4 sm:px-6 sticky top-0 z-40">
        <div className="relative flex overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-md">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base transition-colors ` +
                  (isActive
                    ? `text-indigo-700 dark:text-white`
                    : `text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white`)
                }
                end
              >
                {({ isActive }) => (
                  <>
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-highlight"
                        className="absolute left-0 bottom-0 w-full h-full bg-indigo-100 dark:bg-indigo-500/40 rounded-md -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(99,102,241,0.6)" }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 w-full">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-8 sm:py-12 px-4 sm:px-6 mt-12 ${darkMode ? 'bg-gray-900/80' : 'bg-gray-800'}`}>
        <div className="max-w-7xl mx-auto text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BizzySite</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Empowering small businesses to succeed online with simple, powerful tools.
              </p>
            </div>
            <div>
              {/* Intentionally blank */}
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li>Email: your-store@bizzysite.shop</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm sm:text-base text-gray-400">
            <p>© {new Date().getFullYear()} BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
