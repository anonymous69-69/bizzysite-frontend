import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// A modern skeleton loader for a better user experience while data is loading.
const ProductPageSkeleton = () => (
    <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="w-full h-96 bg-gray-200 rounded-lg"></div>
                    <div className="flex gap-2 mt-4">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
                    <div className="h-20 w-full bg-gray-200 rounded"></div>
                    <div className="h-12 w-1/2 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);


const InProduct = () => {
    const { productId, slug } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for UI components, consistent with viewsite.jsx
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // State for the image gallery
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // --- FIX: Centralized Cart Logic ---
    // The cart state is now managed identically to viewsite.jsx to ensure consistency.
    const [cart, setCart] = useState([]);
    const CART_KEY = `cart_${slug}`; // Use a unique key for each store's cart.

    // Effect to load the correct cart from localStorage when the store slug changes.
    useEffect(() => {
        const storedCart = localStorage.getItem(CART_KEY);
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        } else {
            setCart([]);
        }
    }, [slug, CART_KEY]);

    // Effect to save the cart to localStorage whenever it changes.
    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart, CART_KEY]);
    
    // Unified data fetching for business and product info.
    useEffect(() => {
        const fetchBusinessAndProduct = async () => {
            if (!slug) return;
            setLoading(true);
            setError(null);
            try {
                // Fetch all store data using the slug, with cache-busting.
                const res = await fetch(`https://bizzysite.onrender.com/api/store/slug/${slug}?timestamp=${new Date().getTime()}`, {
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                });

                if (!res.ok) {
                    throw new Error(`Store not found (status: ${res.status})`);
                }
                const data = await res.json();
                setBusiness(data);

                // Find the specific product from the fetched data.
                const currentProduct = data.products?.find(p => p._id === productId);
                if (currentProduct) {
                    setProduct(currentProduct);
                } else {
                    throw new Error("Product not found in this store.");
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinessAndProduct();
    }, [slug, productId]);

    // --- FIX: Cart management functions are now identical to viewsite.jsx ---
    const addToCart = (productToAdd) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item._id === productToAdd._id);
            const updatedCart = existingItem
                ? prevCart.map((item) =>
                    item._id === productToAdd._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
                : [...prevCart, { ...productToAdd, quantity: 1 }];
            return updatedCart;
        });
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(id);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item._id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };
    
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item._id !== id));
    };

    // Helper to get currency symbol.
    const getCurrencySymbol = (currencyCode) => {
        try {
            const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).formatToParts(0);
            return parts.find(part => part.type === 'currency')?.value || '$';
        } catch (e) {
            return '$'; // Fallback
        }
    };

    // Image navigation functions
    const nextImage = () => {
        if (!product || !product.images) return;
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % product.images.length);
    };

    const prevImage = () => {
        if (!product || !product.images) return;
        setCurrentImageIndex(prevIndex => (prevIndex - 1 + product.images.length) % product.images.length);
    };
    
    if (loading) return <ProductPageSkeleton />;
    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
                <h3 className="text-lg font-medium text-red-600">Error Loading Product</h3>
                <p className="mt-2 text-gray-600">{error}</p>
                <button onClick={() => navigate(`/${slug}`)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Back to Store</button>
            </div>
        </div>
    );
    if (!product || !business) return null; // Should be handled by loading/error states

    const theme = business.customize || {};
    const primaryColor = theme.primaryColor || '#3b82f6';
    const secondaryColor = theme.secondaryColor || '#8b5cf6';
    const textColor = theme.textColor || 'white';
    const storeCurrency = business.defaultCurrency || 'USD';
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartItem = cart.find(item => item._id === product._id);

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800">
             {/* Header */}
            <header className="sticky top-0 z-20 p-4 shadow-md text-white" style={{ backgroundColor: primaryColor, color: textColor }}>
                <div className="container mx-auto flex justify-between items-center">
                     <Link to={`/${slug}`} className="text-xl font-bold">{business.name || 'Your Business'}</Link>
                    <button onClick={() => setIsCartOpen(true)} className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold" style={{ backgroundColor: secondaryColor, color: textColor }}>
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Cart Sidebar */}
            <AnimatePresence>
                {isCartOpen && (
                     <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-30" onClick={() => setIsCartOpen(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-lg z-40 flex flex-col">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Your Cart ({totalItems})</h3>
                                <button onClick={() => setIsCartOpen(false)} className="text-2xl">&times;</button>
                            </div>
                            <div className="p-4 flex-grow overflow-y-auto">
                               {cart.length === 0 ? (
                                    <p className="text-center py-8">Your cart is empty.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {cart.map(item => (
                                            <li key={item._id} className="flex items-center gap-4">
                                                <img src={item.images?.[0] || 'https://placehold.co/100x100/e2e8f0/475569?text=Image'} alt={item.name} className="w-16 h-16 object-cover rounded"/>
                                                <div className="flex-grow">
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">{getCurrencySymbol(storeCurrency)}{item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-6 h-6 border rounded">-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-6 h-6 border rounded">+</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                             <div className="p-4 border-t border-gray-200">
                                <div className="flex justify-between font-semibold mb-4">
                                    <span>Total:</span>
                                    <span>{getCurrencySymbol(storeCurrency)}{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => navigate(`/order/${slug}`, { state: { cart, currency: storeCurrency } })}
                                    className="w-full py-3 rounded-lg font-semibold transition-transform transform hover:scale-105"
                                    style={{ backgroundColor: primaryColor, color: textColor }}
                                    disabled={cart.length === 0}
                                >
                                    Checkout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            
            <main className="flex-grow container mx-auto px-4 py-6">
                <div className="max-w-5xl mx-auto">
                    <button onClick={() => navigate(`/${slug}`)} className="flex items-center gap-2 mb-6 text-gray-600 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to Products
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Image Gallery */}
                        <div className="flex flex-col gap-4">
                             <div className="relative">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImageIndex}
                                        src={product.images?.[currentImageIndex] || 'https://placehold.co/600x600/e2e8f0/475569?text=No+Image'}
                                        alt={product.name}
                                        className="w-full h-auto aspect-square object-cover rounded-lg shadow-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </AnimatePresence>
                                {product.images && product.images.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </>
                                )}
                             </div>
                            {product.images && product.images.length > 1 && (
                                <div className="flex justify-center gap-2">
                                    {product.images.map((img, index) => (
                                        <button key={index} onClick={() => setCurrentImageIndex(index)}
                                            className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-indigo-500 scale-110' : 'border-transparent'}`}>
                                            <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col pt-4">
                            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{product.name}</h1>
                            <p className="text-2xl lg:text-3xl font-semibold mb-4" style={{ color: primaryColor }}>
                               {new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(product.price)}
                            </p>
                            <div className="prose max-w-none text-gray-600 mb-4">
                                <p>{product.description || 'No description provided.'}</p>
                            </div>

                            <div className="mt-auto pt-4">
                                {!product.inStock && <p className="text-red-500 font-semibold mb-4">Out of Stock</p>}
                                
                                {product.inStock ? (
                                    cartItem ? (
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center border rounded-lg">
                                                <button onClick={() => updateQuantity(product._id, cartItem.quantity - 1)} className="px-4 py-3 text-lg">-</button>
                                                <span className="px-4 text-lg font-semibold">{cartItem.quantity}</span>
                                                <button onClick={() => updateQuantity(product._id, cartItem.quantity + 1)} className="px-4 py-3 text-lg">+</button>
                                            </div>
                                            <button onClick={() => setIsCartOpen(true)} className="flex-grow py-3 rounded-lg font-semibold" style={{ backgroundColor: secondaryColor, color: textColor }}>
                                                View in Cart
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="w-full py-4 text-lg rounded-lg font-semibold transition-transform transform hover:scale-105"
                                            style={{ backgroundColor: primaryColor, color: textColor }}
                                        >
                                            Add to Cart
                                        </button>
                                    )
                                ) : (
                                     <button disabled className="w-full py-4 text-lg rounded-lg font-semibold cursor-not-allowed bg-gray-200 text-gray-500">
                                        Out of Stock
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
             {/* Footer */}
            <footer className="py-8 px-4 text-white" style={{ backgroundColor: primaryColor, color: textColor }}>
                <div className="container mx-auto text-center text-sm opacity-80">
                    <p>© {new Date().getFullYear()} {business.name}. Powered by BizzySite.</p>
                </div>
            </footer>
        </div>
    );
};

export default InProduct;

