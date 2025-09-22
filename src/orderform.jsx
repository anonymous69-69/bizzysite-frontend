import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Icon components for form fields for a modern look
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const OrderForm = () => {
  // Helper to get currency symbol from currency code
  function getCurrencySymbol(currencyCode) {
    try {
      const parts = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode
      }).formatToParts(0);
      return parts.find(p => p.type === 'currency')?.value || '';
    } catch {
      return '';
    }
  }
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [business, setBusiness] = useState(null);
  const [storeCurrency, setStoreCurrency] = useState("INR");
  const [razorpayKey, setRazorpayKey] = useState(""); // State for Razorpay Key

  const {
    cart = [],
    total: passedTotal = 0,
    shippingCharge: sc = 0
  } = location.state || {};

  const total = passedTotal;

  const [formData, setFormData] = useState({
    fullName: "",
    instagramId: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    specialNote: "",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Order summary calculations
  const shippingCharge = !isNaN(parseFloat(sc)) ? parseFloat(sc) : 0;
  const platformFee = !isNaN(total) ? total * 0.05 : 0; // Changed from 0.03 to 0.05
  const orderTotal = !isNaN(total + shippingCharge + platformFee)
    ? total + shippingCharge + platformFee
    : 0;
  
  const API_BASE = "https://bizzysite.onrender.com";

  // Effect to load Razorpay script and fetch API Key
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch Razorpay Key
    const fetchKey = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/get-razorpay-key`);
        const data = await res.json();
        if (data.key) {
          setRazorpayKey(data.key);
        } else {
          console.error("Razorpay Key ID not received from server.");
        }
      } catch (err) {
        console.error("Failed to fetch Razorpay key:", err);
      }
    };

    fetchKey();

    return () => {
      // Cleanup script when component unmounts
       const razorpayScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
       if (razorpayScript) {
        document.body.removeChild(razorpayScript);
       }
    };
  }, [API_BASE]);


  useEffect(() => {
    if (!slug) {
      const storedSlug = localStorage.getItem("bizzySlug");
      if (storedSlug) {
        navigate(`/order/${storedSlug}`);
      } else {
        // Using a more user-friendly notification than alert
        console.error("Store slug is missing.");
        navigate("/");
      }
    } else {
      localStorage.setItem("bizzySlug", slug);
    }
  }, [slug, navigate]);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/store/slug/${slug}`
        );
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
          setStoreCurrency(data.defaultCurrency || "INR");
        }
      } catch (err) {
        console.error("Failed to fetch business info:", err);
      }
    };

    if (slug) {
      fetchBusiness();
    }
  }, [slug, API_BASE]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission with new Razorpay logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug || !business?.storeId) {
        alert("Store information is missing. Cannot proceed.");
        return;
    }
    if (!razorpayKey) {
        alert("Payment gateway is not configured correctly. Please try again later.");
        return;
    }

    setIsSubmitting(true);

    try {
        const { fullName, ...customerData } = formData;
        
        const sanitizedCart = cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));

        const orderPayload = {
            storeId: business.storeId,
            customer: {
              name: fullName, 
              ...customerData
            },
            items: sanitizedCart, 
            subtotal: total,
            shipping: shippingCharge,
            platformFee: platformFee,
            total: orderTotal,
            currency: storeCurrency,
            paid: false, 
            // CHANGE: Added status field to explicitly track order state
            status: 'pending',
        };

        const orderRes = await fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
            throw new Error(orderData.message || "Failed to create order");
        }
        const dbOrderId = orderData.orderId;

        const razorpayOrderRes = await fetch(`${API_BASE}/api/create-razorpay-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: orderTotal,
                currency: storeCurrency,
                orderId: dbOrderId, 
                storeId: business.storeId, 
            }),
        });
        
        const razorpayOrderData = await razorpayOrderRes.json();
        if (!razorpayOrderRes.ok) {
            throw new Error(razorpayOrderData.error || "Failed to create Razorpay order");
        }

        const options = {
            key: razorpayKey,
            amount: razorpayOrderData.amount,
            currency: razorpayOrderData.currency,
            name: business.name || "BizzySite Store",
            description: `Payment for Order #${dbOrderId}`,
            order_id: razorpayOrderData.id,
            method: {
              card: true,
              netbanking: true,
              upi: true,
              wallet: true,
              paypal: true, // ✅ Enable PayPal for international users
            },
            handler: async function (response) {
                const verificationPayload = {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    db_order_id: dbOrderId,
                };

                const verifyRes = await fetch(`${API_BASE}/api/verify-razorpay-payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(verificationPayload),
                });
                
                const verifyData = await verifyRes.json();

                if (verifyData.success) {
                    setShowSuccessModal(true);
                } else {
                    alert(`Payment verification failed: ${verifyData.message}. Please contact support.`);
                }
            },
            prefill: {
                name: formData.fullName,
                email: formData.email,
                contact: formData.phone,
            },
            theme: {
                color: "#4f46e5", 
            },
            // ---- START: FIX FOR CANCELED PAYMENTS ----
            // This `modal.ondismiss` function is triggered when the user closes the payment window.
            modal: {
                ondismiss: async function() {
                    console.log('Payment modal dismissed.');
                    // We now make an API call to your backend to mark the pre-created order as "canceled".
                    try {
                        await fetch(`${API_BASE}/api/orders/${dbOrderId}/cancel`, {
                            method: "POST", // Or PUT, depending on your API design
                            headers: { 'Content-Type': 'application/json' },
                        });
                    } catch (err) {
                        console.error("Failed to send cancellation status to backend:", err);
                    }
                }
            }
            // ---- END: FIX FOR CANCELED PAYMENTS ----
        };
        
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          // Also mark the order as failed in the backend on explicit failure.
          fetch(`${API_BASE}/api/orders/${dbOrderId}/fail`, { method: "POST" });
          alert(`Payment failed: ${response.error.description} (Code: ${response.error.code})`);
        });

        rzp.open();

    } catch (err) {
        alert(`An error occurred: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
};

  if (!cart || cart.length === 0 || !location.state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h3 className="text-xl font-semibold text-gray-800">
            Your Cart is Empty
          </h3>
          <p className="mt-2 text-gray-600">
            Looks like you haven't added any products yet.
          </p>
          <Link
            to={`/${slug}`}
            className="inline-block mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
        <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Store
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                <p className="text-gray-600 mb-8">Please fill in your details to complete the purchase.</p>

                {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 opacity-100">
                        <div className="mx-auto bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
                        <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
                        
                        {/* ## FIX: The redirect path is now correct (`/${slug}`) ## */}
                        <button onClick={() => { setShowSuccessModal(false); navigate(`/${slug}`); }} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                            Continue Shopping
                        </button>
                    </div>
                </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-7">
                        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-8">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none"><UserIcon /></div>
                                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none"><MailIcon /></div>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none"><PhoneIcon /></div>
                                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Shipping Address</h2>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                                        <div className="absolute top-9 left-0 pl-3 flex items-center pointer-events-none"><LocationIcon /></div>
                                        <textarea id="address" name="address" value={formData.address} onChange={handleChange} required rows={3} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                            <select id="country" name="country" value={formData.country} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                                <option value="">Select Country</option>
                                                <option value="IN">India</option><option value="AE">United Arab Emirates</option><option value="SA">Saudi Arabia</option><option value="SG">Singapore</option><option value="MY">Malaysia</option><option value="ID">Indonesia</option><option value="TH">Thailand</option><option value="PH">Philippines</option><option value="VN">Vietnam</option><option value="BD">Bangladesh</option><option value="PK">Pakistan</option><option value="LK">Sri Lanka</option><option value="NP">Nepal</option><option value="BH">Bahrain</option><option value="KW">Kuwait</option><option value="QA">Qatar</option><option value="OM">Oman</option><option value="TR">Turkey</option><option value="IL">Israel</option><option value="CN">China</option><option value="HK">Hong Kong</option><option value="TW">Taiwan</option><option value="JP">Japan</option><option value="KR">South Korea</option><option value="GB">United Kingdom</option><option value="IE">Ireland</option><option value="DE">Germany</option><option value="FR">France</option><option value="IT">Italy</option><option value="ES">Spain</option><option value="PT">Portugal</option><option value="NL">Netherlands</option><option value="BE">Belgium</option><option value="LU">Luxembourg</option><option value="AT">Austria</option><option value="CH">Switzerland</option><option value="SE">Sweden</option><option value="NO">Norway</option><option value="DK">Denmark</option><option value="FI">Finland</option><option value="PL">Poland</option><option value="CZ">Czechia</option><option value="SK">Slovakia</option><option value="HU">Hungary</option><option value="RO">Romania</option><option value="BG">Bulgaria</option><option value="GR">Greece</option><option value="HR">Croatia</option><option value="SI">Slovenia</option><option value="LT">Lithuania</option><option value="LV">Latvia</option><option value="EE">Estonia</option><option value="IS">Iceland</option><option value="UA">Ukraine</option><option value="RU">Russia</option><option value="US">United States</option><option value="CA">Canada</option><option value="MX">Mexico</option><option value="BR">Brazil</option><option value="AR">Argentina</option><option value="CL">Chile</option><option value="CO">Colombia</option><option value="PE">Peru</option><option value="EC">Ecuador</option><option value="UY">Uruguay</option><option value="PY">Paraguay</option><option value="BO">Bolivia</option><option value="VE">Venezuela</option><option value="CR">Costa Rica</option><option value="PA">Panama</option><option value="GT">Guatemala</option><option value="HN">Honduras</option><option value="NI">Nicaragua</option><option value="SV">El Salvador</option><option value="DO">Dominican Republic</option><option value="PR">Puerto Rico</option><option value="JM">Jamaica</option><option value="TT">Trinidad and Tobago</option><option value="ZA">South Africa</option><option value="EG">Egypt</option><option value="MA">Morocco</option><option value="DZ">Algeria</option><option value="TN">Tunisia</option><option value="KE">Kenya</option><option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="TZ">Tanzania</option><option value="UG">Uganda</option><option value="ET">Ethiopia</option><option value="AU">Australia</option><option value="NZ">New Zealand</option><option value="FJ">Fiji</option><option value="PG">Papua New Guinea</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">Postal / ZIP Code *</label>
                                            <input type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                            <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State / Province *</label>
                                            <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg sticky top-8">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-4">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id || item._id} className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                          <img src={item.images?.[0] || 'https://placehold.co/100x100/F1F5F9/475569?text=Image'} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-gray-700">
                                            {`${getCurrencySymbol(storeCurrency)}${(item.price * item.quantity).toFixed(2)}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 border-t pt-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{`${getCurrencySymbol(storeCurrency)}${total.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium">{`${getCurrencySymbol(storeCurrency)}${shippingCharge.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Platform Fee (5%)</span>
                                    <span className="font-medium">{`${getCurrencySymbol(storeCurrency)}${platformFee.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-4 mt-4">
                                    <span>Total</span>
                                    <span>{`${getCurrencySymbol(storeCurrency)}${orderTotal.toFixed(2)}`}</span>
                                </div>
                            </div>
                             <button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </div>
                                ) : `Proceed to Pay (${getCurrencySymbol(storeCurrency)}${orderTotal.toFixed(2)})`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default OrderForm;