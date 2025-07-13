import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';


const InProduct = () => {
  const { productId, slug } = useParams();
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  

  // Fetch business data
  // Extracted fetchProducts function
  const fetchProducts = async () => {
    try {
      const response = await fetch(`https://bizzysite.onrender.com/api/store/slug/${slug}`, { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBusinessData(data);
    } catch (err) {
      console.error("Error fetching business data:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    fetchData();
  }, []);

  // Fetch product data - THIS IS THE MAIN FIX
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching product with ID:", productId);
        const res = await fetch(`https://bizzysite.onrender.com/api/store/slug/${slug}/product/${productId}`);

        if (!res.ok) {
          throw new Error(`Product not found (status: ${res.status})`);
        }

        const data = await res.json();
        console.log("Received product data:", data);

        if (!data) {
          throw new Error("No product data received");
        }

        // Ensure we have _id and images array
        setProduct({
          ...data,
          _id: data._id, // Should already be set by backend
          images: Array.isArray(data.images) ? data.images : []
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId && productId !== 'undefined') {
      fetchProduct();
    }
  }, [productId, slug]);

  // Add to cart function
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Update quantity function
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Remove from cart function
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 animate-pulse p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-12 bg-gray-300 rounded w-1/3"></div>
          <div className="h-96 bg-gray-300 rounded"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          <div className="h-6 bg-gray-300 rounded w-2/3"></div>
          <div className="h-10 bg-gray-300 rounded w-1/4 mt-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-medium text-red-600">Error loading website</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-medium text-gray-800">No website data found</h3>
          <p className="mt-2 text-gray-600">
            Please set up your business information, add products, and customize your site.
          </p>
          <Link
            to="/storefront"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const business = businessData.business || {};
  const theme = businessData.customize || {};

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Theme defaults
  const primaryColor = theme.primaryColor || '#4f46e5';
  const secondaryColor = theme.secondaryColor || '#d1d5db';
  const fontFamily = theme.fontFamily || 'Inter, sans-serif';

  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  // Check if product is already in cart
  const cartItem = cart.find(item => item._id === product._id);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ fontFamily }}>
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Mobile Side Menu */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{business.name || 'Menu'}</h3>
        </div>
        <nav className="p-4">
          <ul className="space-y-3">
            <li><Link to="/preview" className="block py-2 hover:text-indigo-600">Home</Link></li>
            <li><Link to="#products" className="block py-2 hover:text-indigo-600">Products</Link></li>
            <li><button onClick={() => setIsContactModalOpen(true)} className="block py-2 hover:text-indigo-600">Contact</button></li>
          </ul>
        </nav>
      </div>

      {/* Contact Modal Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-70 z-50 transition-opacity duration-300 ${
          isContactModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsContactModalOpen(false)}
      ></div>

      {/* Contact Modal */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 w-full max-w-md transition-all duration-300 ${
          isContactModalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
          <button 
            onClick={() => setIsContactModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 text-gray-700">
          <p><span className="font-medium">Phone:</span> {business.phone || 'Not provided'}</p>
          <p><span className="font-medium">Email:</span> {business.email || 'Not provided'}</p>
          <p><span className="font-medium">Address:</span> {business.address || 'Not provided'}</p>
        </div>
      </div>

      {/* Cart Sidebar with darker background */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-70 z-30 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCartOpen(false)}
      ></div>
      
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Cart ({totalItems})</h3>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4 h-[calc(100%-150px)] overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item._id} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.currency}{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center border rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center border rounded"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">
              {(product.currency || '$')}{cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
            </span>
          </div>
        
<Link
  to={`/shop/${slug}/orderform`}
  state={{
    cart,
    total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    shippingCharge: business.shippingCharge || 0,
    currency: product.currency || '$'
  }}
  className="w-full py-2 text-white rounded-md font-medium text-center block"
  style={{ backgroundColor: primaryColor }}
>
  Checkout
</Link>
        </div>
      </div>

      {/* Header */}
      <header 
        className="sticky top-0 z-20 p-4 text-white shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button (hamburger icon) */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="flex flex-col space-y-1"
            >
              <span className="block w-6 h-0.5" style={{ backgroundColor: secondaryColor }}></span>
              <span className="block w-6 h-0.5" style={{ backgroundColor: secondaryColor }}></span>
              <span className="block w-6 h-0.5" style={{ backgroundColor: secondaryColor }}></span>
            </button>
            <h1 className="text-xl font-bold">{business.name || businessData.name || 'Your Store'}</h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="#home" className="hover:opacity-80">Home</Link>
            <Link to="#products" className="hover:opacity-80">Products</Link>
            <button onClick={() => setIsContactModalOpen(true)} className="hover:opacity-80">Contact</button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative ml-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Product Detail Section */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Products
          </button>

          {/* Product Content */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image Gallery */}
            <div className="relative">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-contain bg-gray-100"
                  />
                  
                  {/* Navigation arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Image indicators */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-xl font-semibold mb-4" style={{ color: primaryColor }}>
                {product.currency || '$'}{product.price}
              </p>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-600">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

            {/* Add to cart section */}
<div className="border-t border-gray-200 pt-6">
  {!product.inStock && (
    <p className="text-red-500 text-sm mb-4">This product is currently out of stock</p>
  )}
  
  {product.inStock ? (
    cartItem ? (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => updateQuantity(product._id, cartItem.quantity - 1)}
            className="w-10 h-10 flex items-center justify-center border rounded-md text-xl"
            style={{ borderColor: primaryColor }}
          >
            -
          </button>
          <span className="text-lg font-medium">{cartItem.quantity}</span>
          <button
            onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
            className="w-10 h-10 flex items-center justify-center border rounded-md text-xl"
            style={{ borderColor: primaryColor }}
          >
            +
          </button>
        </div>
        <button
          onClick={() => removeFromCart(product._id)}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
        >
          Remove
        </button>
      </div>
    ) : (
      <button
        onClick={() => addToCart(product)}
        className="w-full py-3 px-4 rounded-md text-white font-medium hover:opacity-90 transition-opacity"
        style={{ backgroundColor: primaryColor }}
      >
        Add to Cart
      </button>
    )
  ) : (
    <button
      disabled
      className="w-full py-3 px-4 rounded-md text-gray-400 font-medium cursor-not-allowed"
      style={{ backgroundColor: secondaryColor }}
    >
      Out of Stock
    </button>
  )}
</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="py-8 px-4 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BizzySite</h3>
              <p className="text-opacity-80">
                Empowering small businesses to succeed online with simple, powerful tools.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="mb-2">+91 7086758292</p>
              <p className="mb-2">rhythmsarma66@gmail.com</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="#home" className="hover:underline">Home</Link></li>
                <li><Link to="#products" className="hover:underline">Products</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-opacity-20 mt-8 pt-8 text-center">
            <p>© 2025 BizzySite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InProduct;