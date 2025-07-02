import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function ProductCatalog() {
  const BASE_URL = "https://bizzysite.onrender.com/api";
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    _id: uuidv4(),
    name: '',
    price: '0',
    description: '',
    images: [],
    inStock: true,
    currency: '$'
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activeTab, setActiveTab] = useState('Products');

  const currencies = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'EUR' },
    { symbol: '£', name: 'GBP' },
    { symbol: '₹', name: 'INR' },
    { symbol: '¥', name: 'JPY' },
    { symbol: '₹', name: 'INR' },
  ];

  const handleAddProductClick = () => {
    setCurrentProduct({
      _id: uuidv4(),
      name: '',
      description: '',
      images: [],
      inStock: true,
      currency: '$'
    });
    setImagePreviews([]);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct({
      _id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      images: product.images,
      inStock: product.inStock,
      currency: product.currency
    });
    setImagePreviews(product.images);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setCurrentProduct({
      id: null,
      _id: null,
      name: '',
      price: '0.00',
      description: '',
      images: [],
      inStock: true,
      currency: '$'
    });
    setImagePreviews([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...currentProduct.images, ...files];

    setCurrentProduct(prev => ({
      ...prev,
      images: newImages
    }));

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentProduct.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (isNaN(parseFloat(currentProduct.price)) || parseFloat(currentProduct.price) < 0) {
      alert('Please enter a valid price');
      return;
    }

    const productData = {
      _id: currentProduct._id,
      name: currentProduct.name,
      price: currentProduct.price,
      currency: currentProduct.currency,
      description: currentProduct.description,
      images: imagePreviews,
      inStock: currentProduct.inStock,
      createdAt: new Date().toISOString()
    };

    const isExistingProduct = products.some(p => p._id === currentProduct._id);
    const updatedProducts = isExistingProduct
      ? products.map(p => p._id === currentProduct._id ? productData : p)
      : [...products, productData];

    fetch(`${BASE_URL}/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'products', data: updatedProducts })
    })
      .then(res => res.json())
      .then(() => {
        setProducts(updatedProducts);
        handleCloseModal();
      })
      .catch(err => {
        console.error('Failed to save product:', err);
        alert('Failed to save product');
      });
  };

  useEffect(() => {
    fetch(`${BASE_URL}/business`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error('Failed to fetch products:', err));
  }, []);

  const handleDeleteProduct = (productId) => {
    const updatedProducts = products.filter(product => product._id !== productId);

    fetch(`${BASE_URL}/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'products', data: updatedProducts })
    })
      .then(res => res.json())
      .then(data => {
        setProducts(updatedProducts);
      })
      .catch(err => {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Link to="/signup" className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-purple-600 transition-colors">BizzySite</Link>
          </div>
          <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Welcome to your business dashboard</h2>
          <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">Set up your online store in minutes and start selling today</p>
        </div>

        {/* Updated Navigation Tabs to match storefront.jsx */}
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

        {/* Product Catalog UI */}
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

        {products.length === 0 ? (
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
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No products yet</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Add your first product to start building your catalog
              </p>
              <button
                onClick={handleAddProductClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
              >
                Add Your First Product
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-32 sm:h-40 md:h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/300x200?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No image</span>
                  </div>
                )}
                <div className="p-2 sm:p-3 md:p-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                  <p className="text-indigo-600 font-medium mt-1 text-sm md:text-base">
                    {product.currency}{product.price}
                  </p>
                  <p className="text-gray-600 mt-1 md:mt-2 text-xs md:text-sm line-clamp-2">
                    {product.description || 'No description'}
                  </p>
                  <div className="flex items-center mt-2 md:mt-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="mt-2 md:mt-4 flex justify-between">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-800 text-xs md:text-sm font-medium"
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
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                    {currentProduct.id ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    {currentProduct.id ? 'Update your product details' : 'Add a new product to your catalog'}
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4 sm:mb-6">
                      <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="product-name"
                        name="name"
                        value={currentProduct.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="border-t border-gray-200 my-4 sm:my-6"></div>

                    <div className="mb-4 sm:mb-6">
                      <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <select
                          name="currency"
                          value={currentProduct.currency}
                          onChange={handleInputChange}
                          className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        >
                          {currencies.map(currency => (
                            <option key={currency.symbol} value={currency.symbol}>
                              {currency.symbol} ({currency.name})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          id="product-price"
                          name="price"
                          value={currentProduct.price}
                          onChange={(e) => {
                            if (e.target.value === '' || /^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                              handleInputChange(e);
                            }
                          }}
                          placeholder="0"
                          className="flex-1 px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                          required
                          min="0"
                          step="any"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 my-4 sm:my-6"></div>

                    <div className="mb-4 sm:mb-6">
                      <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="product-description"
                        name="description"
                        value={currentProduct.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Describe your product..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                      />
                    </div>

                    <div className="border-t border-gray-200 my-4 sm:my-6"></div>

                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Images
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600 flex-wrap justify-center">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Upload images</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>

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
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm sm:text-base"
                      >
                        {currentProduct.id ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
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