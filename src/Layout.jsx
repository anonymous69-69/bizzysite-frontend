import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { motion, AnimatePresence } from "framer-motion"; 
import toast from 'react-hot-toast';
import { useAppNav } from "./AppNavContext";
// Import Feather Icons for a professional look
import { 
  FiTrello,        // Setup/Dashboard
  FiArchive,       // Products
  FiShoppingBag,   // Orders
  FiFeather,       // Customize/Design
  FiMonitor,       // Preview
  FiCreditCard     // Payments
} from "react-icons/fi";

export default function Layout() {
  const { darkMode } = useTheme();
  const [userName, setUserName] = useState("User");
  const [showMenu, setShowMenu] = useState(false); 
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isNavLocked, triggerError } = useAppNav();

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

  // Define navigation tabs with professional icons
  const tabs = [
    { name: 'Setup', icon: <FiTrello />, path: '/storefront' },
    { name: 'Products', icon: <FiArchive />, path: '/products' },
    { name: 'Orders', icon: <FiShoppingBag />, path: '/orders' },
    { name: 'Customize', icon: <FiFeather />, path: '/customize' },
    { name: 'Preview', icon: <FiMonitor />, path: '/navview' },
    { name: 'Payments', icon: <FiCreditCard />, path: '/payment' }
  ];

  // Concise dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good Morning, ${userName}!`;
    if (hour < 18) return `Good Afternoon, ${userName}!`;
    if (hour < 22) return `Good Evening, ${userName}!`;
    return `Good Night, ${userName}!`;
  };
  
  const handleNavClick = (e, path) => {
    // The "Setup" tab should always be clickable
    if (path === '/storefront') return;
    
    if (isNavLocked) {
      e.preventDefault();       // Stop the link from navigating
      triggerError();           // Show the error message on the Storefront page
      navigate('/storefront');  // Force navigation to the page with the error
    }
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden ${
      // ⬅️ CRITICAL CHANGE: Full Black Gradient 
      darkMode
        ? 'bg-gradient-to-br from-gray-900 via-black to-black text-white' 
        : 'bg-gradient-to-br from-indigo-100 via-pink-100 via-purple-200 to-white text-black'
    }`}>

      {/* Modern, Compact, Sticky Header Bar */}
      <div className={`sticky top-0 z-50 transition-colors duration-300 ${
        // Adjusted opacity for the sticky header to blend with the new black background
        darkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <header className="max-w-6xl mx-auto w-full p-3 sm:p-4">
          <div className="flex justify-between items-center">
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
              
              {/* Framer Motion Profile Menu Dropdown */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className={`absolute right-0 mt-2 w-44 rounded-md shadow-lg z-50 origin-top-right ${
                      darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 border'
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
                        localStorage.removeItem('userId'); 
                        navigate('/signup'); 
                        toast.success("Logged out successfully!");
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/50' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
      </div>

      {/* Greeting and Slogan (Moved below sticky header) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 mt-4">
        {/* Adjusted text color for the darker background */}
        <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {getGreeting()} 
        </h2>
        <p className={`mb-4 text-base sm:text-lg max-w-2xl ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          Launch your brand, your way — fast, simple, and free ✨
        </p>
      </div>


      {/* Tab Navigation Bar */}
      <nav className="max-w-6xl mx-auto w-full px-4 sm:px-6 sticky top-16 z-40">
        <div className="relative flex overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex space-x-2 sm:space-x-4 p-2 rounded-xl min-w-max 
            bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl"
          >
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.path}
                onClick={(e) => handleNavClick(e, tab.path)}
                className={({ isActive }) => {
                  const baseClasses = `relative flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-lg focus:outline-none text-sm sm:text-base transition-colors`;
                  const activeClasses = `text-indigo-700 dark:text-white`;
                  const inactiveClasses = `text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white`;
                  const disabledClasses = (isNavLocked && tab.path !== '/storefront') ? 'opacity-50 cursor-not-allowed' : '';
                  
                  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${disabledClasses}`;
                }}
                end
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center justify-center text-xl">{tab.icon}</span> 
                    <span>{tab.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-highlight"
                        className="absolute left-0 bottom-0 w-full h-full bg-indigo-100 dark:bg-indigo-500/40 rounded-lg -z-10"
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
      <footer className={`py-8 sm:py-12 px-4 sm:px-6 mt-12 ${darkMode ? 'bg-black/80' : 'bg-gray-800'}`}>
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