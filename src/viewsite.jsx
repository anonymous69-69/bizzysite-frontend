import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const ViewSite = () => {
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const { storeId } = useParams();

  // Fetch business data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5050/api/business/${storeId}`,
          {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setBusinessData(data);
      } catch (err) {
        console.error("Error fetching business data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  // Add to cart function
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => (item.id || item._id) === (product.id || product._id)
      );
      if (existingItem) {
        return prevCart.map((item) =>
          (item.id || item._id) === (product.id || product._id)
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

    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id || item._id) === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Remove from cart function
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => (item.id || item._id) !== productId)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-medium text-red-600">
            Error loading website
          </h3>
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
          <h3 className="text-lg font-medium text-gray-800">
            No website data found
          </h3>
          <p className="mt-2 text-gray-600">
            Please set up your business information, add products, and customize
            your site.
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
  const products = businessData.products || [];
  const theme = businessData.customize || {};

  // Theme defaults
  const primaryColor = theme.primaryColor || "#4f46e5";
  const secondaryColor = theme.secondaryColor || "#d1d5db";
  const fontFamily = theme.fontFamily || "Inter, sans-serif";
  const productLayout = theme.productLayout || "Grid";

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
              <Link to="/preview" className="block py-2 hover:text-indigo-600">
                Home
              </Link>
            </li>
            <li>
              <Link to="#products" className="block py-2 hover:text-indigo-600">
                Products
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="block py-2 hover:text-indigo-600"
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
                  key={item.id || item._id}
                  className="flex items-center space-x-4 border-b border-gray-100 pb-4"
                >
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/150"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.currency}
                      {item.price}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id || item._id, item.quantity - 1)
                      }
                      className="w-6 h-6 flex items-center justify-center border rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id || item._id, item.quantity + 1)
                      }
                      className="w-6 h-6 flex items-center justify-center border rounded"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id || item._id)}
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
              {cart.length > 0 ? cart[0].currency : "$"}
              {cart
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toFixed(2)}
            </span>
          </div>

          <Link
            to={`/shop/${storeId}/orderform`}
            state={{
              cart,
              total: cart.reduce(
                (total, item) => total + item.price * item.quantity,
                0
              ),
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
            <Link to="#home" className="hover:opacity-80">
              Home
            </Link>
            <Link to="#products" className="hover:opacity-80">
              Products
            </Link>
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
      </header>

      {/* Hero Section */}
      <section
        className="py-8 md:py-12 px-4 text-center"
        style={{
          backgroundColor: secondaryColor,
        }}
        id="home"
      >
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            {business.name || "Welcome to Our Store"}
          </h1>
          <p className="text-base md:text-lg mb-6 md:mb-8 text-gray-700">
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
                Please add products in your dashboard to display them here.
              </p>
            </div>
          ) : (
            <div
              className={`grid ${
                productLayout === "Grid"
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
                  : productLayout === "List"
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-2"
              } gap-4 md:gap-6`}
            >
              {products.map((product) => {
                const cartItem = cart.find(
                  (item) =>
                    (item.id || item._id) === (product.id || product._id)
                );

                return (
                  <div
                    key={product.id || product._id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    style={{
                      border:
                        productLayout === "Card"
                          ? `2px solid ${secondaryColor}`
                          : "none",
                      display: productLayout === "List" ? "flex" : "block",
                    }}
                  >
                    <Link
                      to={`/shop/${storeId}/product/${
                        product.id || product._id
                      }`}
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className={`${
                            productLayout === "List"
                              ? "w-1/3 h-auto object-cover"
                              : "w-full h-48 object-cover"
                          }`}
                        />
                      ) : (
                        <div
                          className={`${
                            productLayout === "List" ? "w-1/3" : "w-full"
                          } bg-gray-200 flex items-center justify-center`}
                        >
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                    </Link>

                    <div
                      className={`p-4 ${
                        productLayout === "List" ? "w-2/3" : ""
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
                                onClick={() =>
                                  updateQuantity(
                                    product.id || product._id,
                                    cartItem.quantity - 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center border rounded"
                                style={{ borderColor: primaryColor }}
                              >
                                -
                              </button>
                              <span>{cartItem.quantity}</span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    product.id || product._id,
                                    cartItem.quantity + 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center border rounded"
                                style={{ borderColor: primaryColor }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="px-3 py-1 text-sm rounded-md text-white font-medium hover:opacity-90 md:px-4 md:py-2 md:text-base"
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
      <footer
        className="py-8 px-4 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BizzySite</h3>
              <p className="text-opacity-80">
                Empowering small businesses to succeed online with simple,
                powerful tools.
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
                <li>
                  <Link to="#home" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="#products" className="hover:underline">
                    Products
                  </Link>
                </li>
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

export default ViewSite;
