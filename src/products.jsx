import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCatalog() {
  const API_BASE_URL = 'https://bizzysite.onrender.com/api';
  // Removed useTheme and using local state for darkMode
  const [darkMode, setDarkMode] = useState(true);
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
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [searchCurrency, setSearchCurrency] = useState("");

  const fetchProducts = useCallback(async (currentStoreId, currentUserId) => {
    if (!currentStoreId || !currentUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      // ================== THE FIX: FETCH FROM THE AUTHENTICATED ENDPOINT ==================
      // Instead of the public `/api/store/:storeId` endpoint, we now use the authenticated `/api/business` endpoint.
      // This ensures we get the latest data directly from the database, bypassing any potential caching layers
      // on public routes that might serve stale information.
      const response = await axios.get(`${API_BASE_URL}/business`, {
        headers: {
          'Authorization': `Bearer ${currentUserId}`,
          'x-store-id': currentStoreId,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      // ====================================================================================

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
  }, [navigate]);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedStoreId = localStorage.getItem('storeId');

    if (savedUserId && savedStoreId) {
      setUserId(savedUserId);
      setStoreId(savedStoreId);
      fetchProducts(savedStoreId, savedUserId);
    } else if (!savedUserId) {
      navigate('/signup');
    } else {
      // Handle case where user is logged in but has no storeId yet
      setIsLoading(false);
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
    const toastId = toast.loading('Uploading images...');
    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "bizzysite"); // Your Cloudinary upload preset
        return fetch(`https://api.cloudinary.com/v1_1/dkbhczdas/image/upload`, {
          method: "POST", body: formData,
        }).then(res => res.json());
      });
      const responses = await Promise.all(uploadPromises);
      const secureUrls = responses.map(res => res.secure_url).filter(Boolean);
      
      setCurrentProduct(prev => ({ ...prev, images: [...prev.images, ...secureUrls] }));
      setImagePreviews(prev => [...prev, ...secureUrls]);
      if (secureUrls.length > 0) toast.success("Images uploaded!", { id: toastId });
    } catch (err) {
      toast.error('Image upload failed.', { id: toastId });
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

    const toastId = toast.loading('Saving product...');
    setIsLoading(true);
    try {
      const productData = {
        ...currentProduct,
        price: Number(currentProduct.price),
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
      toast.success('Product saved successfully!', { id: toastId });
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.response?.data?.message || 'Failed to save product.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const toastId = toast.loading('Deleting product...');
    setIsLoading(true);
    try {
      const updatedProducts = products.filter(p => p._id !== productToDelete._id);
      await axios.put(`${API_BASE_URL}/business`, {
        type: 'products', data: updatedProducts
      }, {
        headers: { 'Authorization': `Bearer ${userId}`, 'x-store-id': storeId }
      });
      setProducts(updatedProducts);
      toast.success('Product deleted!', { id: toastId });
    } catch (err) {
      toast.error('Failed to delete product', { id: toastId });
    } finally {
      setIsLoading(false);
      setProductToDelete(null);
    }
  };

  async function handleCurrencySave(currencyToSave) {
    const toastId = toast.loading('Saving currency...');
    try {
      await axios.put(`${API_BASE_URL}/business`, {
        type: "settings", data: { defaultCurrency: currencyToSave }
      }, {
        headers: { Authorization: `Bearer ${userId}`, "x-store-id": storeId }
      });
      setStoreCurrency(currencyToSave);
      toast.success("Currency saved successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to save currency.", { id: toastId });
    }
  }

  const supportedCurrencies = ["AED","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BMD","BND","BOB","BRL","BSD","BWP","BZD","CAD","CHF","CLP","CNY","COP","CRC","CUP","CZK","DKK","DOP","DZD","EGP","ETB","EUR","FJD","GBP","GHS","GMD","GTQ","GYD","HKD","HRK","HUF","IDR","ILS","INR","ISK","JMD","JOD","JPY","KES","KHR","KWD","KYD","KZT","LAK","LBP","LKR","LRD","LTL","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MUR","MVR","MWK","MXN","MYR","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SCR","SEK","SGD","SLL","SOS","SRD","STD","SVC","SZL","THB","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VND","VUV","WST","XAF","XCD","XOF","XPF","YER","ZAR","ZMW"];
  const currencyFlags = {
    AED: "🇦🇪", ALL: "🇦🇱", AMD: "🇦🇲", ANG: "🇨🇼", AOA: "🇦🇴", ARS: "🇦🇷", AUD: "🇦🇺",
    AWG: "🇦🇼", AZN: "🇦🇿", BAM: "🇧🇦", BBD: "🇧🇧", BDT: "🇧🇩", BGN: "🇧🇬", BMD: "🇧🇲",
    BND: "🇧🇳", BOB: "🇧🇴", BRL: "🇧🇷", BSD: "🇧🇸", BWP: "🇧🇼", BZD: "🇧🇿", CAD: "🇨🇦",
    CHF: "🇨🇭", CLP: "🇨🇱", CNY: "🇨🇳", COP: "🇨🇴", CRC: "🇨🇷", CUP: "🇨🇺", CZK: "🇨🇿",
    DKK: "🇩🇰", DOP: "🇩🇴", DZD: "🇩🇿", EGP: "🇪🇬", ETB: "🇪🇹", EUR: "🇪🇺", FJD: "🇫🇯",
    GBP: "🇬🇧", GHS: "🇬🇭", GMD: "🇬🇲", GTQ: "🇬🇹", GYD: "🇬🇾", HKD: "🇭🇰", HRK: "🇭🇷",
    HUF: "🇭🇺", IDR: "🇮🇩", ILS: "🇮🇱", INR: "🇮🇳", ISK: "🇮🇸", JMD: "🇯🇲", JOD: "🇯🇴",
    JPY: "🇯🇵", KES: "🇰🇪", KHR: "🇰🇭", KWD: "🇰🇼", KYD: "🇰🇾", KZT: "🇰🇿", LAK: "🇱🇦",
    LBP: "🇱🇧", LKR: "🇱🇰", LRD: "🇱🇷", LTL: "🇱🇹", MAD: "🇲🇦", MDL: "🇲🇩", MGA: "🇲🇬",
    MKD: "🇲🇰", MMK: "🇲🇲", MNT: "🇲🇳", MOP: "🇲🇴", MUR: "🇲🇺", MVR: "🇲🇻", MWK: "🇲🇼",
    MXN: "🇲🇽", MYR: "🇲🇾", NAD: "🇳🇦", NGN: "🇳🇬", NIO: "🇳🇮", NOK: "🇳🇴", NPR: "🇳🇵",
    NZD: "🇳🇿", OMR: "🇴🇲", PEN: "🇵🇪", PGK: "🇵🇬", PHP: "🇵🇭", PKR: "🇵🇰", PLN: "🇵🇱",
    PYG: "🇵🇾", QAR: "🇶🇦", RON: "🇷🇴", RSD: "🇷🇸", RUB: "🇷🇺", RWF: "🇷🇼", SAR: "🇸🇦",
    SCR: "🇸🇨", SEK: "🇸🇪", SGD: "🇸🇬", SLL: "🇸🇱", SOS: "🇸🇴", SRD: "🇸🇷", STD: "🇸🇹",
    SVC: "🇸🇻", SZL: "🇸🇿", THB: "🇹🇭", TND: "🇹🇳", TOP: "🇹🇴", TRY: "🇹🇷", TTD: "🇹🇹",
    TWD: "🇹🇼", TZS: "🇹🇿", UAH: "🇺🇦", UGX: "🇺🇬", USD: "🇺🇸", UYU: "🇺🇾", UZS: "🇺🇿",
    VND: "🇻🇳", VUV: "🇻🇺", WST: "🇼🇸", XAF: "🇨🇫", XCD: "🇦🇬", XOF: "🇸🇳", XPF: "🇵🇫",
    YER: "🇾🇪", ZAR: "🇿🇦", ZMW: "🇿🇲"
  };

  const currencySymbols = {
    AED: "د.إ", ALL: "Lek", AMD: "֏", ANG: "ƒ", AOA: "Kz", ARS: "$", AUD: "$",
    AWG: "ƒ", AZN: "₼", BAM: "KM", BBD: "$", BDT: "৳", BGN: "лв", BMD: "$",
    BND: "$", BOB: "Bs.", BRL: "R$", BSD: "$", BWP: "P", BZD: "$", CAD: "$",
    CHF: "CHF", CLP: "$", CNY: "¥", COP: "$", CRC: "₡", CUP: "$", CZK: "Kč",
    DKK: "kr", DOP: "$", DZD: "د.ج", EGP: "E£", ETB: "Br", EUR: "€", FJD: "$",
    GBP: "£", GHS: "₵", GMD: "D", GTQ: "Q", GYD: "$", HKD: "$", HRK: "kn",
    HUF: "Ft", IDR: "Rp", ILS: "₪", INR: "₹", ISK: "kr", JMD: "$", JOD: "JD",
    JPY: "¥", KES: "KSh", KHR: "៛", KWD: "KD", KYD: "$", KZT: "₸", LAK: "₭",
    LBP: "ل.ل", LKR: "Rs", LRD: "$", LTL: "Lt", MAD: "د.م.", MDL: "L", MGA: "Ar",
    MKD: "ден", MMK: "K", MNT: "₮", MOP: "P", MUR: "₨", MVR: "Rf", MWK: "MK",
    MXN: "$", MYR: "RM", NAD: "$", NGN: "₦", NIO: "C$", NOK: "kr", NPR: "₨",
    NZD: "$", OMR: "ر.ع.", PEN: "S/", PGK: "K", PHP: "₱", PKR: "₨", PLN: "zł",
    PYG: "₲", QAR: "ر.ق", RON: "lei", RSD: "дин", RUB: "₽", RWF: "FRw", SAR: "ر.س",
    SCR: "₨", SEK: "kr", SGD: "$", SLL: "Le", SOS: "Sh", SRD: "$", STD: "Db",
    SVC: "$", SZL: "L", THB: "฿", TND: "د.ت", TOP: "T$", TRY: "₺", TTD: "$",
    TWD: "$", TZS: "Sh", UAH: "₴", UGX: "USh", USD: "$", UYU: "$", UZS: "soʻm",
    VND: "₫", VUV: "Vt", WST: "T", XAF: "FCFA", XCD: "$", XOF: "CFA", XPF: "₣",
    YER: "﷼", ZAR: "R", ZMW: "ZK"
  };  const safeCurrency = supportedCurrencies.includes(storeCurrency) ? storeCurrency : "USD";
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Product Catalog</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your products and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-44">
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className={`w-full flex items-center justify-between border rounded-md px-3 py-2 shadow-sm transition ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{currencyFlags[storeCurrency] || "🌐"}</span>
                <span className={`${darkMode ? "text-white" : "text-gray-800"} text-sm font-medium`}>{storeCurrency}</span>
              </span>
              <svg className={`w-4 h-4 transition-transform ${isCurrencyOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <AnimatePresence>
              {isCurrencyOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <input type="text" placeholder="Search..." value={searchCurrency} onChange={(e) => setSearchCurrency(e.target.value)} className={`w-full px-2 py-1 border rounded text-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}/>
                  </div>
                  <ul>
                    {supportedCurrencies.filter(c => c.toLowerCase().includes(searchCurrency.toLowerCase())).map(code => (
                      <li key={code} onClick={() => { setTempCurrency(code); setShowCurrencyModal(true); setIsCurrencyOpen(false); }} className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-indigo-100 dark:hover:bg-gray-700 ${darkMode ? "text-white" : "text-gray-800"}`}>
                        <span>{currencyFlags[code] || "🌐"}</span><span>{code}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={handleAddProductClick} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm font-semibold w-fit transition-transform transform hover:scale-105">
            <span className="text-xl mr-1 font-light">+</span> Add Product
          </button>
        </div>
      </div>

      {isLoading ? ( <div className="text-center p-8"><p>Loading products...</p></div> ) : 
       error ? ( <div className={`text-center p-8 rounded-xl border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}><p>{error}</p></div> ) : 
       products.length === 0 ? (
        <div className={`text-center p-12 rounded-xl border-2 border-dashed ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-300'}`}>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>You haven't added any products yet. Click "Add Product" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className={`rounded-xl shadow-lg overflow-hidden transition-all transform hover:scale-[1.02] hover:shadow-2xl backdrop-blur-md border ${darkMode ? 'bg-gray-800/40 border-gray-700 hover:border-indigo-400/60' : 'bg-white/50 border-gray-200 hover:border-indigo-400/60'}`}>
              <div className="w-full h-48 sm:h-56 overflow-hidden">
                <img src={product.images[0] || 'https://placehold.co/400x300/e2e8f0/475569?text=No+Image'} alt={product.name} className="w-full h-full object-cover"/>
              </div>
              <div className="p-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{product.name}</h3>
                <div className="mt-3 flex justify-between items-center">
                  <p className={`font-bold text-lg ${darkMode ? 'text-indigo-300' : 'text-gray-800'}`}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: safeCurrency }).format(product.price)}</p>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${product.inStock ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button onClick={() => handleEditProduct(product)} className={`px-4 py-1.5 rounded font-semibold transition text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Edit</button>
                  <button onClick={() => setProductToDelete(product)} className="px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showProductModal && currentProduct && (
          <motion.div key="productModal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className={`rounded-xl shadow-lg max-w-lg w-full p-6 border overflow-y-auto max-h-[90vh] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{products.some(p => p._id === currentProduct._id) ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={handleCloseModal} className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} text-2xl font-bold`}>&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label><input type="text" name="name" value={currentProduct.name} onChange={handleInputChange} required className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}/></div>
                <div><label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label><textarea name="description" value={currentProduct.description} onChange={handleInputChange} rows="3" className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}/></div>
                <div><label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</label><div className="flex"><span className={`p-2 border rounded-l font-semibold ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>{currencySymbols[safeCurrency] || safeCurrency}</span><input type="number" name="price" value={currentProduct.price} onChange={handleInputChange} required className={`w-full p-2 border border-l-0 rounded-r ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}/></div></div>
                <div><label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Images</label><input type="file" accept="image/*" multiple onChange={handleImageUpload} className={`w-full text-sm ${darkMode ? 'text-gray-300' : ''} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${darkMode ? 'file:bg-indigo-900 file:text-indigo-200 hover:file:bg-indigo-800' : 'file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'}`}/></div>
                {isUploading && <p className="text-sm text-indigo-400">Uploading images...</p>}
                {imagePreviews.length > 0 && <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">{imagePreviews.map((p, i) => <div key={i} className="relative"><img src={p} alt="preview" className="h-24 w-full object-cover rounded"/><button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">&times;</button></div>)}</div>}
                <div className="flex items-center"><input type="checkbox" id="inStockCheck" name="inStock" checked={currentProduct.inStock} onChange={() => setCurrentProduct(p => ({...p, inStock: !p.inStock}))} className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"/><label htmlFor="inStockCheck" className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>In Stock</label></div>
                <div className="flex justify-end pt-4 space-x-2"><button type="button" onClick={handleCloseModal} className={`px-4 py-2 border rounded font-semibold ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>Cancel</button><button type="submit" disabled={isUploading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 font-semibold">Save Product</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {productToDelete && (
          <motion.div key="deleteModal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
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
          <motion.div key="currencyModal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
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
    </>
  );
}