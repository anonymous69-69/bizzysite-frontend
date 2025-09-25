import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// A simple loading spinner component to show while fetching data
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Loading Checkout...</p>
        </div>
    </div>
);


// Icon components (no changes)
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

const countries = [
  { code: 'DZ', name: 'Algeria' }, { code: 'AR', name: 'Argentina' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' }, { code: 'BO', name: 'Bolivia' }, { code: 'BR', name: 'Brazil' },
  { code: 'BG', name: 'Bulgaria' }, { code: 'CA', name: 'Canada' }, { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' }, { code: 'CO', name: 'Colombia' }, { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' }, { code: 'CZ', name: 'Czechia' }, { code: 'DK', name: 'Denmark' },
  { code: 'DO', name: 'Dominican Republic' }, { code: 'EC', name: 'Ecuador' }, { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' }, { code: 'EE', name: 'Estonia' }, { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' }, { code: 'FI', name: 'Finland' }, { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' }, { code: 'GH', name: 'Ghana' }, { code: 'GR', name: 'Greece' },
  { code: 'GT', name: 'Guatemala' }, { code: 'HN', name: 'Honduras' }, { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' }, { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' }, { code: 'IE', name: 'Ireland' }, { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' }, { code: 'JM', name: 'Jamaica' }, { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' }, { code: 'KW', name: 'Kuwait' }, { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' }, { code: 'MY', name: 'Malaysia' },
  { code: 'MX', name: 'Mexico' }, { code: 'MA', name: 'Morocco' }, { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' }, { code: 'NI', name: 'Nicaragua' },
  { code: 'NG', name: 'Nigeria' }, { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' }, { code: 'PA', name: 'Panama' }, { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' }, { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' }, { code: 'PR', name: 'Puerto Rico' },
  { code: 'QA', name: 'Qatar' }, { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' }, { code: 'SG', name: 'Singapore' }, { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' }, { code: 'ZA', name: 'South Africa' }, { code: 'KR', name: 'South Korea' },
  { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' }, { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' }, { code: 'TW', name: 'Taiwan' }, { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' }, { code: 'TT', name: 'Trinidad and Tobago' }, { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' }, { code: 'UG', name: 'Uganda' }, { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' }, { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' }
].sort((a, b) => a.name.localeCompare(b.name));


const OrderForm = () => {

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
  };
  function getCurrencySymbol(currencyCode) {
    // Fallback to the code itself if the symbol is not found
    return currencySymbols[currencyCode] || currencyCode;
  }
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ NEW: Loading state for fetching business data
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [storeCurrency, setStoreCurrency] = useState("INR");
  const [razorpayKey, setRazorpayKey] = useState("");

  const {
    cart = [],
    total: passedTotal = 0,
    shippingCharge: sc // We will use the fetched shipping charge later
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

  const [countrySearch, setCountrySearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const API_BASE = "https://bizzysite.onrender.com";

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

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
        console.error("Store slug is missing.");
        navigate("/");
      }
    } else {
      localStorage.setItem("bizzySlug", slug);
    }
  }, [slug, navigate]);

  // ✅ MODIFIED: This effect now controls the main loading state
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      };
      
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/store/slug/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
          setStoreCurrency(data.defaultCurrency?.toUpperCase() || "INR");
        } else {
          // Handle case where business is not found
          console.error("Business not found");
          navigate("/"); // or to a 404 page
        }
      } catch (err) {
        console.error("Failed to fetch business info:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusiness();
  }, [slug, API_BASE, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Recalculate totals now that we have business data
  const shippingCharge = business?.shippingCharge || 0;
  const platformFee = !isNaN(total) ? total * 0.05 : 0;
  const orderTotal = total + shippingCharge + platformFee;

// Replace the existing handleSubmit function with this one

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

      const isIndianCurrency = storeCurrency === 'INR';

      const options = {
          key: razorpayKey,
          amount: razorpayOrderData.amount,
          currency: razorpayOrderData.currency,
          // ✅ FIXED: Safely access the business name
          name: business?.business?.name || "BizzySite Store",
          description: `Payment for Order #${dbOrderId}`,
          order_id: razorpayOrderData.id,
          method: {
            card: true,
            upi: isIndianCurrency,
            netbanking: isIndianCurrency,
            wallet: isIndianCurrency,
            paypal: !isIndianCurrency,
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
          modal: {
              ondismiss: async function() {
                  console.log('Payment modal dismissed.');
                  try {
                      await fetch(`${API_BASE}/api/orders/${dbOrderId}/cancel`, {
                          method: "POST",
                          headers: { 'Content-Type': 'application/json' },
                      });
                  } catch (err) {
                      console.error("Failed to send cancellation status to backend:", err);
                  }
              }
          }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
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

  // ✅ MODIFIED: Show loader while fetching business data
  if (isLoading) {
    return <LoadingSpinner />;
  }

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

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

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
                                        <div className="relative" ref={dropdownRef}>
                                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                            <input
                                                type="text"
                                                id="country"
                                                name="country"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Search or select a country"
                                                value={countrySearch}
                                                onChange={(e) => {
                                                    setCountrySearch(e.target.value);
                                                    setFormData(prev => ({ ...prev, country: '' }));
                                                    setIsDropdownOpen(true);
                                                }}
                                                onFocus={() => setIsDropdownOpen(true)}
                                            />
                                            {isDropdownOpen && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {filteredCountries.length > 0 ? (
                                                        filteredCountries.map(country => (
                                                            <div
                                                                key={country.code}
                                                                className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, country: country.code }));
                                                                    setCountrySearch(country.name);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                            >
                                                                {country.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-gray-500">No country found</div>
                                                    )}
                                                </div>
                                            )}
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
