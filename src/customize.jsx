import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from './ThemeContext';



export default function CustomizeStore() {
  const [activeTab, setActiveTab] = useState('Customize');
  const { darkMode } = useTheme();
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [headerStyle, setHeaderStyle] = useState('Modern');
  const [productLayout, setProductLayout] = useState('Grid');
  const [imageURL, setImageURL] = useState('');
  const [storeId, setStoreId] = useState('');
  const [userName, setUserName] = useState('User');
  const [showMenu, setShowMenu] = useState(false);
  
  

  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const storeId = localStorage.getItem('storeId');
  
        if (!userId || !storeId) return;
  
        const response = await fetch('https://bizzysite.onrender.com/api/business', {
          headers: {
            Authorization: `Bearer ${userId}`,
            'x-store-id': storeId
          }
        });
  
        if (!response.ok) throw new Error('Failed to fetch customization');
  
        const data = await response.json();
        setCustomizeSettings(data.customize || {});
      } catch (err) {
        console.error(err);
        toast.error('Could not load customization settings');
      }
    };
  
    fetchCustomization();
  }, []);

  const fetchCustomization = async (storeId) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !storeId) return;

    try {
      const response = await fetch(`https://bizzysite.onrender.com/api/store`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
          'x-store-id': storeId
        }
      });
      if (response.ok) {
        const data = await response.json();
        const c = data?.customize ?? {};
        setPrimaryColor(c.primaryColor || '#3b82f6');
        setSecondaryColor(c.secondaryColor || '#8b5cf6');
        setFontFamily(c.fontFamily || 'Inter');
        setHeaderStyle(c.headerStyle || 'Modern');
        setProductLayout(c.productLayout || 'Grid');
      }
    } catch (err) {
      console.error("Failed to fetch customization:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://bizzysite.onrender.com/api/business?storeId=${storeId}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setImageURL(data.imageUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image');
    }
  };

  const colorPalette = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Indigo', value: '#6366f1' }
  ];

  const fontFamilies = [
    { name: 'Inter', value: 'Inter', category: 'Modern' },
    { name: 'Roboto', value: 'Roboto', category: 'Clean' },
    { name: 'Poppins', value: 'Poppins', category: 'Elegant' },
    { name: 'Montserrat', value: 'Montserrat', category: 'Professional' },
    { name: 'Playfair Display', value: 'Playfair Display', category: 'Classic' }
  ];

  const headerStyles = [
    { name: 'Modern', value: 'Modern' },
    { name: 'Classic', value: 'Classic' },
    { name: 'Minimal', value: 'Minimal' },
    { name: 'Bold', value: 'Bold' }
  ];

  const productLayouts = [
    { name: 'Grid Layout', value: 'Grid' },
    { name: 'List Layout', value: 'List' },
    { name: 'Card Layout', value: 'Card' }
  ];

  const handleColorChange = (color, type) => {
    if (type === 'primary') {
      setPrimaryColor(color);
    } else {
      setSecondaryColor(color);
    }
  };

  const handleCustomColorChange = (e, type) => {
    const color = e.target.value;
    if (type === 'primary') {
      setPrimaryColor(color);
    } else {
      setSecondaryColor(color);
    }
  };

  const handleSaveChanges = async () => {
    if (!primaryColor || !secondaryColor || !fontFamily || !headerStyle || !productLayout) {
      toast.error("Please select all customization options first.");
      return;
    }

    if (!storeId) {
      toast.error("Please complete your business setup first to get a Store ID");
      return;
    }

    const userId = localStorage.getItem('userId');

    const settings = {
      primaryColor,
      secondaryColor,
      fontFamily,
      headerStyle,
      productLayout,
    };

    try {
      const response = await fetch(`https://bizzysite.onrender.com/api/business?storeId=${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
          'x-store-id': storeId
        },
        body: JSON.stringify({ 
          type: 'customize', 
          data: settings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save customization');
      }

      toast.success("Customization saved successfully!");
    } catch (error) {
      toast.error("Failed to save customization: " + error.message);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        {/* Header with dark mode */}
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

        {/* Navigation tabs with dark mode */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className={`flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            {/* Color Scheme Section with dark mode */}
            <div className={`rounded-lg shadow p-4 sm:p-6 mb-6 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Color Scheme
              </h2>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Choose colors that match your brand
              </p>

              <div className="mb-6 sm:mb-8">
                <h3 className={`text-lg font-medium mb-4 ${
                  darkMode ? 'text-gray-300' : 'text-gray-800'
                }`}>
                  Primary Color
                </h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {colorPalette.map((color) => (
                    <button
                      key={`primary-${color.value}`}
                      onClick={() => handleColorChange(color.value, 'primary')}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                        primaryColor === color.value 
                          ? darkMode 
                            ? 'border-indigo-400' 
                            : 'border-indigo-500' 
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div>
                  <label htmlFor="primary-color" className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Custom Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="primary-color"
                      value={primaryColor}
                      onChange={(e) => handleCustomColorChange(e, 'primary')}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded border cursor-pointer ${
                        darkMode ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handleCustomColorChange(e, 'primary')}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-4 ${
                  darkMode ? 'text-gray-300' : 'text-gray-800'
                }`}>
                  Secondary Color
                </h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {colorPalette.map((color) => (
                    <button
                      key={`secondary-${color.value}`}
                      onClick={() => handleColorChange(color.value, 'secondary')}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                        secondaryColor === color.value 
                          ? darkMode 
                            ? 'border-indigo-400' 
                            : 'border-indigo-500' 
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div>
                  <label htmlFor="secondary-color" className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Custom Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="secondary-color"
                      value={secondaryColor}
                      onChange={(e) => handleCustomColorChange(e, 'secondary')}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded border cursor-pointer ${
                        darkMode ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => handleCustomColorChange(e, 'secondary')}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Layout Section with dark mode */}
            <div className={`rounded-lg shadow p-4 sm:p-6 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Typography & Layout
              </h2>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Customize the look and feel of your store
              </p>

              <div className="mb-4 sm:mb-6">
                <label htmlFor="font-family" className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Font Family
                </label>
                <select
                  id="font-family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  {fontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 sm:mb-6">
                <label htmlFor="header-style" className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Header Style
                </label>
                <select
                  id="header-style"
                  value={headerStyle}
                  onChange={(e) => setHeaderStyle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  {headerStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="product-layout" className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Product Layout
                </label>
                <select
                  id="product-layout"
                  value={productLayout}
                  onChange={(e) => setProductLayout(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  {productLayouts.map((layout) => (
                    <option key={layout.value} value={layout.value}>
                      {layout.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Live Preview Section with dark mode */}
          <div className={`rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Live Preview
            </h2>
            <p className={`mb-6 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              See how your changes look
            </p>

            <div className={`border rounded-lg overflow-hidden ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <header
                className="flex items-center justify-between p-3 sm:p-4 text-white text-lg sm:text-xl font-semibold"
                style={{ backgroundColor: primaryColor, fontFamily }}
              >
                <div className="space-y-1">
                  <div className="w-4 h-0.5 sm:w-6" style={{ backgroundColor: secondaryColor }} />
                  <div className="w-4 h-0.5 sm:w-6" style={{ backgroundColor: secondaryColor }} />
                  <div className="w-4 h-0.5 sm:w-6" style={{ backgroundColor: secondaryColor }} />
                </div>
                <div className="mx-auto -ml-6 text-center w-full">Your Business Name</div>
              </header>
              <div className={`grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 ${
                darkMode ? 'bg-gray-900' : 'bg-white'
              }`}>
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`rounded-lg p-2 sm:p-3 shadow ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                    style={{ 
                      border: `2px solid ${secondaryColor}`,
                      fontFamily 
                    }}
                  >
                    <h4 className={`text-base sm:text-lg font-medium mb-1 sm:mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Product {item}
                    </h4>
                    <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Sample product description.
                    </p>
                    <button
                      className="w-full py-1 sm:py-2 rounded-md text-white font-medium text-sm sm:text-base"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveChanges}
              className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm sm:text-base"
            >
              Save Changes
            </button>
          </div>
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
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${
            darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-700 text-gray-400'
          }`}>
            <p>© 2024 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}