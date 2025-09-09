import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const platformFee = !isNaN(total) ? total * 0.03 : 0;
  const orderTotal = !isNaN(total + shippingCharge + platformFee)
    ? total + shippingCharge + platformFee
    : 0;
  
  const API_BASE = process.env.NODE_ENV === "production"
    ? "https://bizzysite.onrender.com"
    : "http://localhost:5050";

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
          `https://bizzysite.onrender.com/api/store/slug/${slug}`
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
  }, [slug]);

  // Handle pincode lookup
  const handlePincodeLookup = async (pincode) => {
    if (pincode.length === 6) {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${pincode}`
        );
        const data = await res.json();
        if (data[0].Status === "Success") {
          const locationInfo = data[0].PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            city: locationInfo.District,
            state: locationInfo.State,
            country: "IN",
          }));
        }
      } catch (err) {
        console.error("Pincode lookup failed:", err);
      }
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "pincode") {
      handlePincodeLookup(value);
    }
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
        // FIX: Map `fullName` from form state to `name` for the backend schema.
        const { fullName, ...customerData } = formData;
        
        // Step 1: Create the order in your own database first
        const orderPayload = {
            storeId: business.storeId,
            customer: {
              name: fullName, // Correctly mapped field
              ...customerData
            },
            items: cart,
            subtotal: total,
            shipping: shippingCharge,
            platformFee: platformFee,
            total: orderTotal,
            currency: storeCurrency,
            paid: false, // Mark as not paid initially
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

        // Step 2: Create a Razorpay Order from your server
        const razorpayOrderRes = await fetch(`${API_BASE}/api/create-razorpay-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: orderTotal,
                currency: storeCurrency,
                orderId: dbOrderId, // Pass your internal order ID as the receipt
            }),
        });
        
        const razorpayOrderData = await razorpayOrderRes.json();
        if (!razorpayOrderRes.ok) {
            throw new Error(razorpayOrderData.error || "Failed to create Razorpay order");
        }

        // Step 3: Open Razorpay Checkout
        const options = {
            key: razorpayKey,
            amount: razorpayOrderData.amount,
            currency: razorpayOrderData.currency,
            name: business.name || "BizzySite Store",
            description: `Payment for Order #${dbOrderId}`,
            order_id: razorpayOrderData.id,
            handler: async function (response) {
                // Step 4: Verify the payment on your server
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
                color: "#4f46e5", // Indigo color from your theme
            },
        };
        
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          alert(`Payment failed: ${response.error.description} (Code: ${response.error.code})`);
          // Optionally, you can update your order status to 'failed' here
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-medium text-gray-800">
            Order information incomplete
          </h3>
          <p className="mt-2 text-gray-600">
            Please return to the store and add products to your cart
          </p>
          <Link
            to={`/view/${slug}`}
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-indigo-600 hover:underline flex items-center"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout</h1>

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          >
            <div
              className="bg-white rounded-lg p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
              <p className="mb-6">Your order has been placed successfully.</p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(`/view/${slug}`);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-6">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Details</h3>
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="instagramId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Instagram ID
                    </label>
                    <input
                      type="text"
                      id="instagramId"
                      name="instagramId"
                      value={formData.instagramId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Shipping Address</h3>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="pincode"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Pincode *
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Country</option>
                        {/* Asia */}
                        <option value="IN">India</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="SG">Singapore</option>
                        <option value="MY">Malaysia</option>
                        <option value="ID">Indonesia</option>
                        <option value="TH">Thailand</option>
                        <option value="PH">Philippines</option>
                        <option value="VN">Vietnam</option>
                        <option value="BD">Bangladesh</option>
                        <option value="PK">Pakistan</option>
                        <option value="LK">Sri Lanka</option>
                        <option value="NP">Nepal</option>
                        <option value="BH">Bahrain</option>
                        <option value="KW">Kuwait</option>
                        <option value="QA">Qatar</option>
                        <option value="OM">Oman</option>
                        <option value="TR">Turkey</option>
                        <option value="IL">Israel</option>
                        <option value="CN">China</option>
                        <option value="HK">Hong Kong</option>
                        <option value="TW">Taiwan</option>
                        <option value="JP">Japan</option>
                        <option value="KR">South Korea</option>

                        {/* Europe */}
                        <option value="GB">United Kingdom</option>
                        <option value="IE">Ireland</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                        <option value="PT">Portugal</option>
                        <option value="NL">Netherlands</option>
                        <option value="BE">Belgium</option>
                        <option value="LU">Luxembourg</option>
                        <option value="AT">Austria</option>
                        <option value="CH">Switzerland</option>
                        <option value="SE">Sweden</option>
                        <option value="NO">Norway</option>
                        <option value="DK">Denmark</option>
                        <option value="FI">Finland</option>
                        <option value="PL">Poland</option>
                        <option value="CZ">Czechia</option>
                        <option value="SK">Slovakia</option>
                        <option value="HU">Hungary</option>
                        <option value="RO">Romania</option>
                        <option value="BG">Bulgaria</option>
                        <option value="GR">Greece</option>
                        <option value="HR">Croatia</option>
                        <option value="SI">Slovenia</option>
                        <option value="LT">Lithuania</option>
                        <option value="LV">Latvia</option>
                        <option value="EE">Estonia</option>
                        <option value="IS">Iceland</option>
                        <option value="UA">Ukraine</option>
                        <option value="RU">Russia</option>

                        {/* Americas */}
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="MX">Mexico</option>
                        <option value="BR">Brazil</option>
                        <option value="AR">Argentina</option>
                        <option value="CL">Chile</option>
                        <option value="CO">Colombia</option>
                        <option value="PE">Peru</option>
                        <option value="EC">Ecuador</option>
                        <option value="UY">Uruguay</option>
                        <option value="PY">Paraguay</option>
                        <option value="BO">Bolivia</option>
                        <option value="VE">Venezuela</option>
                        <option value="CR">Costa Rica</option>
                        <option value="PA">Panama</option>
                        <option value="GT">Guatemala</option>
                        <option value="HN">Honduras</option>
                        <option value="NI">Nicaragua</option>
                        <option value="SV">El Salvador</option>
                        <option value="DO">Dominican Republic</option>
                        <option value="PR">Puerto Rico</option>
                        <option value="JM">Jamaica</option>
                        <option value="TT">Trinidad and Tobago</option>

                        {/* Africa */}
                        <option value="ZA">South Africa</option>
                        <option value="EG">Egypt</option>
                        <option value="MA">Morocco</option>
                        <option value="DZ">Algeria</option>
                        <option value="TN">Tunisia</option>
                        <option value="KE">Kenya</option>
                        <option value="NG">Nigeria</option>
                        <option value="GH">Ghana</option>
                        <option value="TZ">Tanzania</option>
                        <option value="UG">Uganda</option>
                        <option value="ET">Ethiopia</option>

                        {/* Oceania */}
                        <option value="AU">Australia</option>
                        <option value="NZ">New Zealand</option>
                        <option value="FJ">Fiji</option>
                        <option value="PG">Papua New Guinea</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Special Note */}
                <div>
                  <label
                    htmlFor="specialNote"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Special Note (Optional)
                  </label>
                  <textarea
                    id="specialNote"
                    name="specialNote"
                    value={formData.specialNote}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isSubmitting ? "Processing..." : "Proceed to Pay"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit sticky top-8">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium mb-3">Your Items</h3>
                <ul className="space-y-3">
                  {cart.map((item) => (
                    <li
                      key={item.id || item._id}
                      className="flex justify-between"
                    >
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 text-sm block">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <span>
                        {`${getCurrencySymbol(storeCurrency)}${(item.price * item.quantity).toFixed(2)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {`${getCurrencySymbol(storeCurrency)}${total.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {`${getCurrencySymbol(storeCurrency)}${shippingCharge.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Platform Fee (3%)</span>
                  <span>
                    {`${getCurrencySymbol(storeCurrency)}${platformFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {`${getCurrencySymbol(storeCurrency)}${orderTotal.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;

