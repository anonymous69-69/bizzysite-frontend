import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

const ProductSkeleton = ({ layout }) => {
  const isListLayout = layout === "List";
  const isCardLayout = layout === "Card";

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden shadow-md ${
        isListLayout ? "flex flex-col sm:flex-row" : "block"
      }`}
      style={{
        border: isCardLayout ? "2px solid #d1d5db" : "none",
      }}
    >
      <div
        className={`${
          isListLayout ? "sm:w-1/3" : "w-full"
        } h-48 bg-gray-200 animate-pulse`}
      ></div>
      <div className={`p-4 ${isListLayout ? "sm:w-2/3" : ""}`}>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const ViewSite = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const { slug } = useParams(); // Added storeId state
  const navigate = useNavigate();
  const [textColor, setTextColor] = useState("white");

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(
          `https://bizzysite.onrender.com/api/store/slug/${slug}`
        );
        setLoading(true);
        setError(null);

        // Get slug from URL path (first segment)
        const pathSlug = window.location.pathname.split("/")[1];
        // Use URL slug if available, otherwise use state slug
        const finalSlug = pathSlug || slug;

        if (!finalSlug) {
          setError("Store slug is missing");
          setLoading(false);
          return;
        }

        console.log(`[ViewSite] Fetching store data for slug: ${slug}`);

        // Use your actual backend URL

        if (res.status === 404) {
          setError("Store not found");
          setBusiness(null);
        } else if (!res.ok) {
          throw new Error("Failed to fetch store data");
        } else {
          const data = await res.json();
          setBusiness(data);
          // Update slug in state if we used pathSlug
          // Slug comes from URL; no need to update it in state
        }
      } catch (err) {
        console.error("[ViewSite] Error loading store:", err);
        setError(err.message || "Could not load this store");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [slug]);

  // Add to cart function (syncs to localStorage 'cart')
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      const updatedCart = existingItem
        ? prevCart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // Update quantity function (syncs to localStorage 'cart')
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };
  

 
  // Initialize cart from localStorage 'cart'
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Remove from cart function (syncs to localStorage 'cart')
  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item._id !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const productLayout = business?.customize?.productLayout || "Grid";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-20 p-4 bg-gray-200 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-6 animate-pulse"></div>
          </div>
        </header>

        {/* Hero Section Skeleton */}
        <section className="py-8 md:py-12 px-4 bg-gray-100">
          <div className="container mx-auto max-w-4xl">
            <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto animate-pulse"></div>
          </div>
        </section>

        {/* Products Section Skeleton */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="h-6 bg-gray-300 rounded w-1/4 mx-auto mb-8 animate-pulse"></div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, index) => (
                <ProductSkeleton key={index} layout={productLayout} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-medium text-red-600">
            Error loading store
          </h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <p className="mt-3 text-sm text-gray-500">
            Store URL:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {slug || "N/A"}
            </code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
          <div className="mt-4 space-y-2">
            <Link to="/login" className="block text-indigo-600 hover:underline">
              Login Again
            </Link>
            <Link to="/" className="block text-indigo-600 hover:underline">
              Return to Home
            </Link>
            <a
              href="mailto:support@bizzysite.com"
              className="block text-indigo-600 hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-medium text-gray-800">Store not found</h3>
          <p className="mt-2 text-gray-600">
            The store URL{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code> does
            not exist.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Make sure you've completed your store setup.
          </p>
          <Link
            to="/"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const products = business.products || [];
  const theme = business.customize || {};

  // Theme defaults
  const primaryColor = theme.primaryColor || "#4f46e5";
  const secondaryColor = theme.secondaryColor || "#d1d5db";
  const fontFamily = theme.fontFamily || "Inter, sans-serif";

  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ fontFamily }}
    >
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{business.name || "Menu"}</h3>
        </div>
        <nav className="p-4">
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  document
                    .getElementById("home")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block py-2 hover:text-indigo-600 w-full text-left"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block py-2 hover:text-indigo-600 w-full text-left"
              >
                Products
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsContactModalOpen(true);
                }}
                className="block py-2 hover:text-indigo-600 w-full text-left"
              >
                Contact
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Contact Modal Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 z-50 transition-opacity duration-300 ${
          isContactModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsContactModalOpen(false)}
      ></div>

      {/* Contact Modal */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 w-full max-w-md transition-all duration-300 ${
          isContactModalOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Contact Information
          </h3>
          <button
            onClick={() => setIsContactModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 text-gray-700">
          <p>
            <span className="font-medium">Phone:</span>{" "}
            {business.phone || "Not provided"}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {business.email || "Not provided"}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {business.address || "Not provided"}
          </p>
        </div>
      </div>

      {/* Cart Sidebar with darker background */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 z-30 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
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
                <li
                  key={item._id}
                  className="flex items-center space-x-4 border-b border-gray-100 pb-4"
                >
                  {item.images?.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.currency || "$"}
                      {item.price}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="w-6 h-6 flex items-center justify-center border rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
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
              {cart.length > 0 ? cart[0].currency || "$" : "$"}
              {cart
                .reduce(
                  (total, item) =>
                    total + parseFloat(item.price) * item.quantity,
                  0
                )
                .toFixed(2)}
            </span>
          </div>

          <button
           onClick={() => {
            setIsCartOpen(false);
            navigate(`/order/${slug}`, {
              state: {
                cart,
                total: cart.reduce(
                  (total, item) =>
                    total + parseFloat(item.price) * item.quantity,
                  0
                ),
                shippingCharge: business.shippingCharge || 0,
              },
            });
          }}
            className="w-full py-2 text-white rounded-md font-medium text-center"
            style={{ backgroundColor: primaryColor }}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-20 p-4 shadow-md ${
          textColor === "white" ? "text-white" : "text-black"
        }`}
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button (hamburger icon) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex flex-col space-y-1"
            >
              <span
                className="block w-6 h-0.5"
                style={{ backgroundColor: secondaryColor }}
              ></span>
              <span
                className="block w-6 h-0.5"
                style={{ backgroundColor: secondaryColor }}
              ></span>
              <span
                className="block w-6 h-0.5"
                style={{ backgroundColor: secondaryColor }}
              ></span>
            </button>
            <h1 className="text-xl font-bold">
              {business.name || "Your Business"}
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() =>
                document
                  .getElementById("home")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:opacity-80"
            >
              Home
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:opacity-80"
            >
              Products
            </button>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="hover:opacity-80"
            >
              Contact
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative ml-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  style={{ backgroundColor: secondaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                style={{ backgroundColor: secondaryColor }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className={`py-8 md:py-12 px-4 text-center ${
          textColor === "white" ? "text-white" : "text-black"
        }`}
        style={{ backgroundColor: secondaryColor }}
      >
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            {business.name || "Welcome to Our Store"}
          </h1>
          <p
            className={`text-base md:text-lg mb-6 md:mb-8 ${
              textColor === "white" ? "text-white" : "text-black"
            }`}
          >
            {business.description ||
              "Discover our amazing products and services"}
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Products</h2>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No products available
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please check back later for our products.
              </p>
            </div>
          ) : (
            <div
              className={`grid ${
                productLayout === "Grid"
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3" // Changed from grid-cols-1 to grid-cols-2 for mobile
                  : productLayout === "List"
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-2"
              } gap-4 md:gap-6`}
            >
              {products.map((product, index) => {
                const cartItem = cart.find((item) => item._id === product._id);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-slideIn"
                    style={{
                      border:
                        productLayout === "Card"
                          ? `2px solid ${secondaryColor}`
                          : "none",
                      display:
                        productLayout === "List"
                          ? "flex flex-col sm:flex-row"
                          : "block",
                      animationDelay: `${index * 0.1}s`, // Staggered animation
                    }}
                  >
                    <button
                      onClick={
                        () => navigate(`/${slug}/product/${product._id}`) // Changed from storeId to slug
                      }
                      className="w-full text-left"
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className={`${
                            productLayout === "List"
                              ? "w-full h-48 sm:w-1/3 sm:h-auto object-cover"
                              : "w-full h-48 object-cover"
                          }`}
                        />
                      ) : (
                        <div
                          className={`${
                            productLayout === "List" ? "sm:w-1/3" : "w-full"
                          } h-48 bg-gray-200 flex items-center justify-center`}
                        >
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                    </button>

                    <div
                      className={`p-4 ${
                        productLayout === "List" ? "sm:w-2/3" : ""
                      }`}
                    >
                      <h3 className="text-lg font-semibold mb-2">
                        {product.name || "Product Name"}
                      </h3>
                      {!product.inStock && (
                        <p className="text-red-500 text-sm mb-2">
                          Out of Stock
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <span
                          className="font-bold"
                          style={{ color: primaryColor }}
                        >
                          {product.currency || "$"}
                          {product.price || "0.00"}
                        </span>

                        {product.inStock ? (
                          cartItem ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(
                                    product._id,
                                    cartItem.quantity - 1
                                  );
                                }}
                                className="w-8 h-8 flex items-center justify-center border rounded"
                                style={{ borderColor: primaryColor }}
                              >
                                -
                              </button>
                              <span>{cartItem.quantity}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(
                                    product._id,
                                    cartItem.quantity + 1
                                  );
                                }}
                                className="w-8 h-8 flex items-center justify-center border rounded"
                                style={{ borderColor: primaryColor }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className={`px-3 py-1 text-sm rounded-md font-medium hover:opacity-90 md:px-4 md:py-2 md:text-base ${
                              textColor === "white" ? "text-white" : "text-black"
                            }`}
                            style={{ backgroundColor: primaryColor }}
                          >
                            Add to Cart
                          </button>
                          )
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1 text-sm rounded-md text-gray-400 font-medium md:px-4 md:py-2 md:text-base cursor-not-allowed"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            Out of Stock
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                BizzySite
              </h3>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                Made with BizzySite. A free website builder for small
                businesses.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Contact
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li>Email: your-store@bizzysite.shop</li>
                <li>Phone: +91 7086758292</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ViewSite;
