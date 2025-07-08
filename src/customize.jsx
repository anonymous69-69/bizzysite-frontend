import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomizeStore() {
  const [activeTab, setActiveTab] = useState('Customize');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [headerStyle, setHeaderStyle] = useState('Modern');
  const [productLayout, setProductLayout] = useState('Grid');
  const [imageURL, setImageURL] = useState('');
  const [storeId, setStoreId] = useState('');

useEffect(() => {
  const savedStoreId = localStorage.getItem('storeId');
  if (savedStoreId) {
    setStoreId(savedStoreId);
  }
}, []);

useEffect(() => {
  if (activeTab === 'Customize' && storeId) {
    fetchCustomization(storeId);
  }
}, [activeTab, storeId]);

  const fetchCustomization = async (storeId) => {
    console.log("Reloading customization for storeId:", storeId);
    const userId = localStorage.getItem('userId');
    if (!userId || !storeId) {
      console.warn("Missing userId or storeId");
      return;
    }

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
        console.log("Full GET response:", data);
        console.log("customize field:", data.customize);
        const c = data?.customize ?? {};
        setPrimaryColor(c.primaryColor || '#3b82f6');
        setSecondaryColor(c.secondaryColor || '#8b5cf6');
        setFontFamily(c.fontFamily || 'Inter');
        setHeaderStyle(c.headerStyle || 'Modern');
        setProductLayout(c.productLayout || 'Grid');
      } else {
        console.warn("No customization data found.");
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
      const res = await fetch(`https://bizzysite.onrender.com/api/upload`, {
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
      const response = await fetch(`https://bizzysite.onrender.com/api/business`, {
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
      console.error("❌ Error saving customization:", error);
      toast.error("Failed to save customization: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Link to="/signup" className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-purple-600 transition-colors">BizzySite</Link>
          </div>
          <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Welcome to your business dashboard</h2>
          <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">Set up your online store in minutes and start selling today</p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Color Scheme</h2>
              <p className="text-gray-600 mb-6">Choose colors that match your brand</p>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Primary Color</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {colorPalette.map((color) => (
                    <button
                      key={`primary-${color.value}`}
                      onClick={() => handleColorChange(color.value, 'primary')}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${primaryColor === color.value ? 'border-indigo-500' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div>
                  <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="primary-color"
                      value={primaryColor}
                      onChange={(e) => handleCustomColorChange(e, 'primary')}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handleCustomColorChange(e, 'primary')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Secondary Color</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {colorPalette.map((color) => (
                    <button
                      key={`secondary-${color.value}`}
                      onClick={() => handleColorChange(color.value, 'secondary')}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${secondaryColor === color.value ? 'border-indigo-500' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div>
                  <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="secondary-color"
                      value={secondaryColor}
                      onChange={(e) => handleCustomColorChange(e, 'secondary')}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => handleCustomColorChange(e, 'secondary')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Typography & Layout</h2>
              <p className="text-gray-600 mb-6">Customize the look and feel of your store</p>

              <div className="mb-4 sm:mb-6">
                <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  id="font-family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                >
                  {fontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 sm:mb-6">
                <label htmlFor="header-style" className="block text-sm font-medium text-gray-700 mb-2">
                  Header Style
                </label>
                <select
                  id="header-style"
                  value={headerStyle}
                  onChange={(e) => setHeaderStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                >
                  {headerStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="product-layout" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Layout
                </label>
                <select
                  id="product-layout"
                  value={productLayout}
                  onChange={(e) => setProductLayout(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
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

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Live Preview</h2>
            <p className="text-gray-600 mb-6">See how your changes look</p>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
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
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg p-2 sm:p-3 shadow"
                    style={{ border: `2px solid ${secondaryColor}`, fontFamily }}
                  >
                    <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Product {item}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Sample product description.</p>
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