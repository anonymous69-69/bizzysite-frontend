import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ProductCatalog() {
  const API_BASE_URL = 'https://bizzysite.onrender.com/api';
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

  const currencies = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'EUR' },
    { symbol: '£', name: 'GBP' },
    { symbol: '₹', name: 'INR' },
    { symbol: '¥', name: 'JPY' },
  ];

  // Fetch products with useCallback to avoid dependency warnings
  const fetchProducts = useCallback(async (storeId, userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/store`, {
        headers: {
          'Authorization': `Bearer ${userId}`,
          'x-store-id': storeId
        }
      });
      
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
    const savedStoreId = localStorage.getItem('storeId');
    const savedUserId = localStorage.getItem('userId');
    
    if (savedUserId) {
      setUserId(savedUserId);
      if (savedStoreId) {
        setStoreId(savedStoreId);
        fetchProducts(savedStoreId, savedUserId);
      }
    } else {
      navigate('/login');
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
      currency: '$'
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
      currency: '$'
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
      // Limit to 5 images
      const maxImages = 5;
      const availableSlots = maxImages - currentProduct.images.length;
      const filesToUpload = files.slice(0, availableSlots);

      if (files.length > availableSlots) {
        toast.warn(`Only ${availableSlots} images can be added`);
      }

      // Cloudinary upload
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create product data
      const productData = {
        ...currentProduct,
        price: Number(currentProduct.price)
      };

      // Create updated products array
      const updatedProducts = products.some(p => p._id === currentProduct._id)
        ? products.map(p => p._id === currentProduct._id ? productData : p)
        : [...products, productData];

      // Send product data to backend
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Product Catalog</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your products and inventory</p>
          </div>
          <button
            onClick={handleAddProductClick}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm sm:text-base w-fit"
          >
            <span className="text-xl mr-1">+</span> Add Product
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
            <button 
              className="ml-4 text-sm underline"
              onClick={() => setError('')}
            >
              Dismiss
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-4 text-gray-500">No products yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow p-4">
                <div className="h-40 mb-4">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover rounded"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'; }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-gray-800 font-bold mt-2">{product.currency}{product.price}</p>
                <p className="text-gray-500 text-sm">Status: {product.inStock ? 'In Stock' : 'Out of Stock'}</p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{products.some(p => p._id === currentProduct._id) ? 'Edit Product' : 'Add New Product'}</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 text-sm sm:text-base mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={currentProduct.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  />
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 text-sm sm:text-base mb-1">Description</label>
                  <textarea
                    name="description"
                    value={currentProduct.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  />
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 text-sm sm:text-base mb-1">Price</label>
                  <div className="flex">
                    <select
                      name="currency"
                      value={currentProduct.currency}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-r-0 border-gray-300 bg-white rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    >
                      {currencies.map(curr => (
                        <option key={curr.symbol} value={curr.symbol}>{curr.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="price"
                      value={currentProduct.price}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 border-l-0 rounded-r focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 text-sm sm:text-base mb-1">Product Images (up to 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  />
                  {isUploading && (
                    <div className="mt-2 text-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Uploading images...</span>
                    </div>
                  )}
                  
                  {imageUploadError && (
                    <p className="mt-2 text-sm text-red-600">{imageUploadError}</p>
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

                <div className="border-t border-gray-200 my-4 sm:my-6"></div>

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
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700 text-sm sm:text-base">In Stock</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mr-3 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm sm:text-base"
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