import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCatalog() {
  const API_BASE_URL = 'https://bizzysite.onrender.com/api';
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [storeCurrency, setStoreCurrency] = useState('USD');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [tempCurrency, setTempCurrency] = useState(storeCurrency);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [userName, setUserName] = useState('User');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  // For custom currency dropdown
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [searchCurrency, setSearchCurrency] = useState("");

  const fetchProducts = useCallback(async (currentStoreId, currentUserId) => {
    if (!currentStoreId || !currentUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/store/${currentStoreId}`);
      const businessData = response.data;
      setProducts(businessData?.products || []);
      setStoreCurrency(businessData?.defaultCurrency || 'USD');
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Failed to load products');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, API_BASE_URL]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedStoreId = localStorage.getItem('storeId');

    if (savedUserId) {
      setUserId(savedUserId);
      setStoreId(savedStoreId);
      
      fetch(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${savedUserId}` }
      })
      .then(res => res.json())
      .then(data => data?.name && setUserName(data.name))
      .catch(err => console.error('Failed to fetch user info:', err));

      fetchProducts(savedStoreId, savedUserId);
    } else {
      navigate('/signup');
    }
  }, [navigate, fetchProducts]);

  const handleAddProductClick = () => {
    setCurrentProduct({
      _id: uuidv4(),
      name: '',
      price: 0,
      description: '',
      images: [],
      inStock: true,
    });
    setImagePreviews([]);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct({ ...product, price: Number(product.price) });
    setImagePreviews([...product.images]);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setCurrentProduct(null);
    setImagePreviews([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0 || !currentProduct) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "bizzysite");
        return fetch(`https://api.cloudinary.com/v1_1/dkbhczdas/image/upload`, {
          method: "POST", body: formData,
        }).then(res => res.json());
      });
      const responses = await Promise.all(uploadPromises);
      const secureUrls = responses.map(res => res.secure_url).filter(Boolean);
      
      setCurrentProduct(prev => ({ ...prev, images: [...prev.images, ...secureUrls] }));
      setImagePreviews(prev => [...prev, ...secureUrls]);
      if (secureUrls.length > 0) toast.success("Images uploaded!");
    } catch (err) {
      toast.error('Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setCurrentProduct(prev => {
      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });
    setImagePreviews(prev => {
      const updatedPreviews = [...prev];
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;

    setIsLoading(true);
    try {
      const productData = {
        _id: currentProduct._id,
        name: currentProduct.name,
        price: Number(currentProduct.price),
        description: currentProduct.description,
        images: currentProduct.images,
        inStock: currentProduct.inStock,
      };

      const isExisting = products.some(p => p._id === productData._id);
      const updatedProducts = isExisting
        ? products.map(p => (p._id === productData._id ? productData : p))
        : [...products, productData];

      await axios.put(`${API_BASE_URL}/business`, {
        type: 'products', data: updatedProducts
      }, {
        headers: { 'Authorization': `Bearer ${userId}`, 'x-store-id': storeId }
      });

      setProducts(updatedProducts);
      handleCloseModal();
      toast.success('Product saved successfully!');
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsLoading(true);
    try {
      const updatedProducts = products.filter(p => p._id !== productToDelete._id);
      await axios.put(`${API_BASE_URL}/business`, {
        type: 'products', data: updatedProducts
      }, {
        headers: { 'Authorization': `Bearer ${userId}`, 'x-store-id': storeId }
      });
      setProducts(updatedProducts);
      toast.success('Product deleted!');
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setIsLoading(false);
      setProductToDelete(null);
    }
  };

  async function handleCurrencySave(currencyToSave) {
    try {
      await axios.put(`${API_BASE_URL}/business`, {
        type: "settings", data: { defaultCurrency: currencyToSave }
      }, {
        headers: { Authorization: `Bearer ${userId}`, "x-store-id": storeId }
      });
      setStoreCurrency(currencyToSave);
      toast.success("Currency saved successfully!", { id: "currency-save", duration: 2000 });
    } catch (error) {
      toast.error("Failed to save currency.", { id: "currency-save-error", duration: 2000 });
    }
  }

  // Razorpay-supported currencies (about 100)
  const supportedCurrencies = [
    "AED","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN",
    "BAM","BBD","BDT","BGN","BMD","BND","BOB","BRL","BSD","BWP","BZD",
    "CAD","CHF","CLP","CNY","COP","CRC","CUP","CZK",
    "DKK","DOP","DZD",
    "EGP","ETB","EUR",
    "FJD","GBP","GHS","GMD","GTQ","GYD",
    "HKD","HRK","HUF",
    "IDR","ILS","INR","ISK",
    "JMD","JOD","JPY",
    "KES","KHR","KWD","KYD","KZT",
    "LAK","LBP","LKR","LRD","LTL",
    "MAD","MDL","MGA","MKD","MMK","MNT","MOP","MUR","MVR","MWK","MXN","MYR",
    "NAD","NGN","NIO","NOK","NPR","NZD",
    "OMR",
    "PEN","PGK","PHP","PKR","PLN","PYG",
    "QAR",
    "RON","RSD","RUB","RWF",
    "SAR","SCR","SEK","SGD","SLL","SOS","SRD","STD","SVC","SZL",
    "THB","TND","TOP","TRY","TTD","TWD","TZS",
    "UAH","UGX","USD","UYU","UZS",
    "VND","VUV",
    "WST",
    "XAF","XCD","XOF","XPF",
    "YER",
    "ZAR","ZMW"
  ];
  // Currency code to flag emoji mapping
  const currencyFlags = {
    AED: "🇦🇪", ALL: "🇦🇱", AMD: "🇦🇲", ANG: "🇳🇱", AOA: "🇦🇴", ARS: "🇦🇷", AUD: "🇦🇺", AWG: "🇦🇼", AZN: "🇦🇿",
    BAM: "🇧🇦", BBD: "🇧🇧", BDT: "🇧🇩", BGN: "🇧🇬", BMD: "🇧🇲", BND: "🇧🇳", BOB: "🇧🇴", BRL: "🇧🇷", BSD: "🇧🇸", BWP: "🇧🇼", BZD: "🇧🇿",
    CAD: "🇨🇦", CHF: "🇨🇭", CLP: "🇨🇱", CNY: "🇨🇳", COP: "🇨🇴", CRC: "🇨🇷", CUP: "🇨🇺", CZK: "🇨🇿",
    DKK: "🇩🇰", DOP: "🇩🇴", DZD: "🇩🇿",
    EGP: "🇪🇬", ETB: "🇪🇹", EUR: "🇪🇺",
    FJD: "🇫🇯", GBP: "🇬🇧", GHS: "🇬🇭", GMD: "🇬🇲", GTQ: "🇬🇹", GYD: "🇬🇾",
    HKD: "🇭🇰", HRK: "🇭🇷", HUF: "🇭🇺",
    IDR: "🇮🇩", ILS: "🇮🇱", INR: "🇮🇳", ISK: "🇮🇸",
    JMD: "🇯🇲", JOD: "🇯🇴", JPY: "🇯🇵",
    KES: "🇰🇪", KHR: "🇰🇭", KWD: "🇰🇼", KYD: "🇰🇾", KZT: "🇰🇿",
    LAK: "🇱🇦", LBP: "🇱🇧", LKR: "🇱🇰", LRD: "🇱🇷", LTL: "🇱🇹",
    MAD: "🇲🇦", MDL: "🇲🇩", MGA: "🇲🇬", MKD: "🇲🇰", MMK: "🇲🇲", MNT: "🇲🇳", MOP: "🇲🇴", MUR: "🇲🇺", MVR: "🇲🇻", MWK: "🇲🇼", MXN: "🇲🇽", MYR: "🇲🇾",
    NAD: "🇳🇦", NGN: "🇳🇬", NIO: "🇳🇮", NOK: "🇳🇴", NPR: "🇳🇵", NZD: "🇳🇿",
    OMR: "🇴🇲",
    PEN: "🇵🇪", PGK: "🇵🇬", PHP: "🇵🇭", PKR: "🇵🇰", PLN: "🇵🇱", PYG: "🇵🇾",
    QAR: "🇶🇦",
    RON: "🇷🇴", RSD: "🇷🇸", RUB: "🇷🇺", RWF: "🇷🇼",
    SAR: "🇸🇦", SCR: "🇸🇨", SEK: "🇸🇪", SGD: "🇸🇬", SLL: "🇸🇱", SOS: "🇸🇴", SRD: "🇸🇷", STD: "🇸🇹", SVC: "🇸🇻", SZL: "🇸🇿",
    THB: "🇹🇭", TND: "🇹🇳", TOP: "🇹🇴", TRY: "🇹🇷", TTD: "🇹🇹", TWD: "🇹🇼", TZS: "🇹🇿",
    UAH: "🇺🇦", UGX: "🇺🇬", USD: "🇺🇸", UYU: "🇺🇾", UZS: "🇺🇿",
    VND: "🇻🇳", VUV: "🇻🇺",
    WST: "🇼🇸",
    XAF: "🌍", XCD: "🌍", XOF: "🌍", XPF: "🌍",
    YER: "🇾🇪",
    ZAR: "🇿🇦", ZMW: "🇿🇲"
  };
  // Use a safe currency for formatting (fallback to USD if not supported)
  const safeCurrency = supportedCurrencies.includes(storeCurrency) ? storeCurrency : "USD";
  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-black text-white' : 'bg-gradient-to-br from-indigo-100 to-white text-black'}`}>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        
        <div className="mb-6 rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <Link to="/signup" className={`text-3xl sm:text-4xl font-extrabold ${darkMode ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent' : 'text-gray-900'}`}>
              BizzySite
            </Link>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="focus:outline-none">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&bold=true`} alt="Profile" className="w-10 h-10 rounded-full"/>
              </button>
              <div className={`absolute right-0 mt-2 w-44 rounded-md shadow-lg z-50 bg-gray-800 text-white border border-gray-700 transform transition-all duration-300 ease-out origin-top-right ${showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <span className="block px-4 py-2 text-sm font-medium text-white/50">Profile</span>
                <div className="border-t border-gray-700"></div>
                <Link to="/settings" className="block px-4 py-2 text-sm text-white hover:bg-gray-700" onClick={() => setShowMenu(false)}>Settings</Link>
              </div>
            </div>
          </div>
          <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return <>🌞 Good Morning, {userName}!</>;
              if (hour < 18) return <>🌤️ Good Afternoon, {userName}!</>;
              return <>🌙 Good Evening, {userName}!</>;
            })()} 🚀
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-6"></div>
          <p className={`mb-6 sm:mb-8 text-base sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl`}>
            Manage your products easily — add, edit, and organize with ease.
          </p>
        </div>

        <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
          <div className="flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            {[ { name: 'Setup', icon: '📊', path: '/storefront' }, { name: 'Products', icon: '📦', path: '/products' }, { name: 'Orders', icon: '🛒', path: '/orders' }, { name: 'Customize', icon: '🎨', path: '/customize' }, { name: 'Preview', icon: '🌐', path: '/navview' }, { name: 'Payments', icon: '💳', path: '/payment' } ].map((tab) => (
              <Link to={tab.path} key={tab.name} className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md text-sm sm:text-base ${window.location.pathname === tab.path ? 'bg-white/20' : 'text-white/80 hover:text-white'}`}>
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Product Catalog</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your products and inventory</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Custom Currency Selector */}
            <div className="relative w-44">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="w-full flex items-center justify-between border rounded-md px-3 py-2 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{currencyFlags[storeCurrency] || "🌐"}</span>
                  <span className={`${darkMode ? "text-white" : "text-gray-800"} text-sm font-medium`}>{storeCurrency}</span>
                </span>
                <span className="text-gray-400">▼</span>
              </button>
              {isCurrencyOpen && (
                <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchCurrency}
                      onChange={(e) => setSearchCurrency(e.target.value)}
                      className={`w-full px-2 py-1 border rounded text-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                    />
                  </div>
                  <ul className="max-h-48 overflow-y-auto">
                    {supportedCurrencies
                      .filter(code => code.toLowerCase().includes(searchCurrency.toLowerCase()))
                      .map(code => (
                        <li
                          key={code}
                          onClick={() => {
                            setTempCurrency(code);
                            setShowCurrencyModal(true);
                            setIsCurrencyOpen(false);
                          }}
                          className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-indigo-100 dark:hover:bg-gray-700 ${darkMode ? "text-white" : "text-gray-800"}`}
                        >
                          <span>{currencyFlags[code] || "🌐"}</span>
                          <span>{code}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
            <button onClick={handleAddProductClick} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm w-fit">
              <span className="text-xl mr-1">+</span> Add Product
            </button>
          </div>
        </div>

        {isLoading ? ( <p>Loading products...</p> ) : 
         error ? ( <p className="text-red-500">{error}</p> ) : 
         products.length === 0 ? (
          <div className={`text-center p-8 rounded-xl border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>You haven't added any products yet. Click "Add Product" to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className={`rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02] border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
                <div className="w-full h-48 sm:h-56 overflow-hidden">
                  <img src={product.images[0] || 'https://placehold.co/400x300/F1F5F9/475569?text=No+Image'} alt={product.name} className="w-full h-full object-cover"/>
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-indigo-200' : 'text-gray-800'}`}>{product.name}</h3>
                  <div className="mt-3 flex justify-between items-center">
                    <p className={`font-bold ${darkMode ? 'text-indigo-300' : 'text-gray-800'}`}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: safeCurrency }).format(product.price)}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${product.inStock ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button onClick={() => handleEditProduct(product)} className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">Edit</button>
                    <button onClick={() => setProductToDelete(product)} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showProductModal && currentProduct && (
          <motion.div key="productModal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className={`rounded-xl shadow-lg max-w-lg w-full p-6 border overflow-y-auto max-h-[90vh] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{products.some(p => p._id === currentProduct._id) ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={handleCloseModal} className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} text-2xl`}>&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label><input type="text" name="name" value={currentProduct.name} onChange={handleInputChange} required className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}/></div>
                <div><label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label><textarea name="description" value={currentProduct.description} onChange={handleInputChange} className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}/></div>
                <div><label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</label><div className="flex"><span className={`p-2 border rounded-l ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: safeCurrency }).formatToParts(0).find(p => p.type === 'currency')?.value || '$'}</span><input type="number" name="price" value={currentProduct.price} onChange={handleInputChange} required className={`w-full p-2 border border-l-0 rounded-r ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}/></div></div>
                <div><label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Images (up to 5)</label><input type="file" accept="image/*" multiple onChange={handleImageUpload} className={`w-full text-sm ${darkMode ? 'text-gray-300' : ''} file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold ${darkMode ? 'file:bg-indigo-900 file:text-indigo-200' : 'file:bg-indigo-50 file:text-indigo-700'}`}/></div>
                {isUploading && <p className="text-sm text-gray-400">Uploading...</p>}
                {imagePreviews.length > 0 && <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">{imagePreviews.map((p, i) => <div key={i} className="relative"><img src={p} alt="preview" className="h-24 w-full object-cover rounded"/><button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">&times;</button></div>)}</div>}
                <div className="flex items-center"><input type="checkbox" name="inStock" checked={currentProduct.inStock} onChange={() => setCurrentProduct(p => ({...p, inStock: !p.inStock}))} className="h-4 w-4 text-indigo-600 rounded"/><span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>In Stock</span></div>
                <div className="flex justify-end pt-4 space-x-2"><button type="button" onClick={handleCloseModal} className={`px-4 py-2 border rounded ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>Cancel</button><button type="submit" disabled={isUploading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400">Save</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {productToDelete && (
          <motion.div key="deleteModal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`rounded-xl shadow-lg max-w-sm w-full p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl font-bold mb-2">Confirm Deletion</h2>
              <p className={`mb-6 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setProductToDelete(null)} className={`px-4 py-2 rounded font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>Cancel</button>
                <button onClick={confirmDeleteProduct} className="px-4 py-2 rounded font-medium bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCurrencyModal && (
          <motion.div key="currencyModal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`p-6 rounded-xl shadow-xl max-w-sm w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-2">Change Currency to {tempCurrency}?</h2>
              <p className={`mb-6 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>This will update the currency for your entire store.</p>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowCurrencyModal(false)} className={`px-4 py-2 rounded font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>Cancel</button>
                <button onClick={() => { handleCurrencySave(tempCurrency); setShowCurrencyModal(false); }} className="px-4 py-2 rounded font-medium bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className={`py-8 mt-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-800 text-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-400">© 2025 BizzySite. Made with ❤️ for small businesses.</p>
        </div>
      </footer>
    </div>
  );
}