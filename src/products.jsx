import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from './ThemeContext';

export default function ProductCatalog() {
  const API_BASE_URL = 'https://bizzysite.onrender.com/api';
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    _id: uuidv4(),
    name: '',
    price: 0,
    currency: '$',
    description: '',
    images: [],
    inStock: true
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activeTab, setActiveTab] = useState('Products');
  const [storeId, setStoreId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [userName, setUserName] = useState('User');
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);


  // FIXED: Updated API endpoint and headers
  const fetchProducts = useCallback(async (storeId, userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/business?storeId=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${userId}`,
          'x-store-id': storeId
        }
      });

      // FIX: Corrected data path to products array
      const products = response.data?.products || [];
      setProducts(Array.isArray(products) ? products : []);
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const savedStoreId = localStorage.getItem('storeId');
    const savedUserId = localStorage.getItem('userId');

    if (savedUserId) {
      setUserId(savedUserId);
      // Fetch user name
      fetch(`https://bizzysite.onrender.com/api/user`, {
        headers: {
          Authorization: `Bearer ${savedUserId}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.name) setUserName(data.name);
        })
        .catch(err => console.error('Failed to fetch user info:', err));

      if (savedStoreId) {
        setStoreId(savedStoreId);
        fetchProducts(savedStoreId, savedUserId);
      } else {
        console.error("Store ID not found in localStorage");
        toast.error("Your store is not properly configured");
      }
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
      currency: '₹'
    });
    setImagePreviews([]);
    setImageUploadError('');
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct({
      ...product,
      price: Number(product.price)
    });
    setImagePreviews([...product.images]);
    setImageUploadError('');
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setCurrentProduct({
      _id: uuidv4(),
      name: '',
      price: 0,
      description: '',
      images: [],
      inStock: true,
      currency: '₹'
    });
    setImagePreviews([]);
    setImageUploadError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploadError('');
    setIsUploading(true);

    try {
      const maxImages = 5;
      const availableSlots = maxImages - currentProduct.images.length;
      const filesToUpload = files.slice(0, availableSlots);

      if (files.length > availableSlots) {
        toast.warn(`Only ${availableSlots} images can be added`);
      }

      const cloudName = "dkbhczdas";
      const uploadPreset = "bizzysite";

      const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Upload failed");
        return data.secure_url;
      };

      const cloudUrls = [];
      for (const file of filesToUpload) {
        const url = await uploadToCloudinary(file);
        cloudUrls.push(url);
      }

      setCurrentProduct(prev => ({
        ...prev,
        images: [...prev.images, ...cloudUrls]
      }));
      setImagePreviews(prev => [...prev, ...cloudUrls]);
      toast.success("Images uploaded successfully!");
    } catch (err) {
      console.error('Image upload error:', err);
      setImageUploadError('Failed to add images');
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...currentProduct.images];
    newImages.splice(index, 1);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);

    setCurrentProduct(prev => ({
      ...prev,
      images: newImages
    }));
    setImagePreviews(newPreviews);
  };

  // FIXED: Added storeId to headers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const productData = {
        ...currentProduct,
        price: Number(currentProduct.price)
      };

      const updatedProducts = products.some(p => p._id === currentProduct._id)
        ? products.map(p => p._id === currentProduct._id ? productData : p)
        : [...products, productData];

      await axios.put(`${API_BASE_URL}/business`, {
        type: 'products',
        data: updatedProducts
      }, {
        headers: {
          'Authorization': `Bearer ${userId}`,
          'x-store-id': storeId,
          'Content-Type': 'application/json'
        }
      });

      setProducts(updatedProducts);
      setShowProductModal(false);
      toast.success('Product saved successfully!');
    } catch (err) {
      console.error('Save product error:', err);
      let errorMsg = 'Failed to save product. Please try again.';

      if (err.response) {
        if (err.response.status === 401) {
          navigate('/login');
          return;
        }

        errorMsg = err.response.data?.message ||
          err.response.data?.error?.message ||
          `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMsg = 'Network error. Please check your connection.';
      } else {
        errorMsg = err.message || errorMsg;
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Added storeId to headers
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product permanently?')) return;

    setIsLoading(true);
    try {
      const updatedProducts = products.filter(p => p._id !== productId);

      await axios.put(`${API_BASE_URL}/business`, {
        type: 'products',
        data: updatedProducts
      }, {
        headers: {
          'Authorization': `Bearer ${userId}`,
          'x-store-id': storeId
        }
      });

      setProducts(updatedProducts);
      toast.success('Product deleted successfully!');
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
      toast.error('Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        {/* Header with dark mode */}
        <div className={`mb-6 rounded-md p-3 ${darkMode ? 'bg-gray-800' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <Link
              to="/signup"
              className={`text-2xl sm:text-3xl font-bold transition-colors ${darkMode ? 'text-white hover:text-indigo-300' : 'text-gray-800 hover:text-purple-600'
                }`}
            >
              BizzySite
            </Link>
            <div className="flex items-center space-x-4">
            <div className="relative" ref={menuRef}>
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
                  <div className={`absolute right-0 mt-2 w-40 border rounded-md shadow-lg z-50 dark:text-white ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800'
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

          <h2 className={`text-lg sm:text-xl mb-6 sm:mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
            Welcome to your business dashboard
          </h2>

          <p className={`mb-6 sm:mb-8 text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-700'
            }`}>
            Set up your online store in minutes and start selling today
          </p>
        </div>

        {/* Navigation tabs with dark mode */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className={`flex space-x-2 sm:space-x-6 px-2 py-2 rounded-lg min-w-max ${darkMode ? 'bg-gray-800' : 'bg-gray-50'
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
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${activeTab === tab.name
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

        {/* Product catalog header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'
              }`}>
              Product Catalog
            </h1>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Manage your products and inventory
            </p>
          </div>
          <button
            onClick={handleAddProductClick}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm sm:text-base w-fit"
          >
            <span className="text-xl mr-1">+</span> Add Product
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-4 border border-gray-200 rounded-lg shadow-md animate-pulse bg-white"
              >
                <div className="w-full h-40 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={`border rounded mb-6 px-4 py-3 ${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-700'
            }`}>
            <strong>Error:</strong> {error}
            <button
              className={`ml-4 text-sm underline ${darkMode ? 'text-red-200' : 'text-red-800'}`}
              onClick={() => setError('')}
            >
              Dismiss
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className={`rounded-lg shadow p-6 sm:p-8 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className="max-w-md mx-auto">
              <svg
                className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                No products yet.
              </p>
            </div>
          </div>
        ) : (
          // Product cards with larger images
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow overflow-hidden transition-transform hover:scale-[1.02]"
              >
                {/* Image container with reduced padding */}
                <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mt-1 text-sm line-clamp-2">{product.description}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-gray-800 font-bold">{product.currency}{product.price}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${product.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className={`rounded-lg shadow-lg max-w-lg w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                  {products.some(p => p._id === currentProduct._id) ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} focus:outline-none`}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4 sm:mb-6">
                  <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base`}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentProduct.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={currentProduct.description}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                  />
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base`}>
                    Price
                  </label>
                  <div className="flex">
                    <span className={`px-3 py-2 border rounded-l text-sm sm:text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      ₹
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={currentProduct.price}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border border-l-0 rounded-r focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base`}>
                    Product Images (up to 5)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className={`block w-full text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      } file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold ${darkMode
                        ? 'file:bg-indigo-900 file:text-indigo-200 hover:file:bg-indigo-800'
                        : 'file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                      }`}
                  />
                  {isUploading && (
                    <div className="mt-2 text-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Uploading images...
                      </span>
                    </div>
                  )}

                  {imageUploadError && (
                    <p className={`mt-2 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {imageUploadError}
                    </p>
                  )}

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            className="h-24 w-full object-cover rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`border-t my-4 sm:my-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}></div>

                <div className="mb-4 sm:mb-6">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={currentProduct.inStock}
                      onChange={() => setCurrentProduct(prev => ({
                        ...prev,
                        inStock: !prev.inStock
                      }))}
                      className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded ${darkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}
                    />
                    <span className={`ml-2 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      In Stock
                    </span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className={`mr-3 px-3 py-1.5 sm:px-4 sm:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm sm:text-base ${darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    disabled={isLoading || isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm sm:text-base"
                    disabled={isLoading || isUploading}
                  >
                    {isLoading ? 'Saving...' : (products.some(p => p._id === currentProduct._id) ? 'Update Product' : 'Add Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
              
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
              <li>Email: your-store@bizzysite.com</li>
              <li>Phone: +91 7086758292</li>
              </ul>
            </div>
          </div>
          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-700 text-gray-400'
            }`}>
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}