import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderForm = () => {
  const { slug } = useParams(); // Use slug for store identification
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], total = 0, shippingCharge: sc } = location.state || {};

  // Form state
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

  // Order summary (safer version to prevent NaN issues)
  const shippingCharge = !isNaN(parseFloat(sc)) ? parseFloat(sc) : 0;
  const platformFee = !isNaN(total) ? total * 0.03 : 0;
  const orderTotal = !isNaN(total + shippingCharge + platformFee)
    ? total + shippingCharge + platformFee
    : 0;

  // Handle pincode lookup using postalpincode.in API
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
            country: "India",
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

  // Handle form submission (Razorpay integration)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Debug logs
    console.log("📦 total:", total);
    console.log("🚚 shippingCharge:", shippingCharge);
    console.log("🧾 platformFee:", platformFee);
    console.log("💰 orderTotal:", orderTotal);
    // Log amount and slug before the fetch call
    console.log(
      "Sending amount (paise):",
      Math.round((total + shippingCharge + platformFee) * 100)
    );
    console.log("Slug being sent:", slug);
    console.log("location.state:", location.state);
    console.log("✅ Using slug from URL params:", slug);
    console.log("📦 Total:", total);
    console.log("🚚 Shipping:", shippingCharge);
    console.log("🧾 Platform Fee:", platformFee);
    console.log("💰 Final Order Total:", orderTotal);
    console.log(
      "📨 Amount in paise being sent to backend:",
      Math.round((total + shippingCharge + platformFee) * 100)
    );
    console.log("🧾 Slug:", slug);

    try {
      // Step 1: Create Razorpay Order
      const createOrderRes = await fetch(
        "https://bizzysite.onrender.com/api/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(orderTotal * 100),
            slug: slug,
            customerName: formData.fullName,
          }),
        }
      );

      const razorOrder = await createOrderRes.json();
      console.log("💳 Razorpay Order response from backend:", razorOrder);


      // Step 2: Launch Razorpay Checkout
      const options = {
        key: "rzp_live_QIjpR4yQhX9L3h",
        amount: razorOrder.amount,
        currency: razorOrder.currency,
        name: "my store",
        description: "Order Payment",
        order_id: razorOrder.id,
        notes: {
          slug: slug,
          storeOwnerName: localStorage.getItem("userName") || "",
          storeOwnerEmail: localStorage.getItem("userEmail") || "",
          storeOwnerPhone: localStorage.getItem("userPhone") || "",
        },
        handler: async function (response) {
          // Step 3: On successful payment, save order
          const order = {
            slug: slug,
            customer: {
              name: formData.fullName,
              instagramId: formData.instagramId,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              country: formData.country,
              specialNote: formData.specialNote,
            },
            items: cart.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            subtotal: total,
            shipping: shippingCharge,
            platformFee: platformFee,
            total: orderTotal,
            currency: cart[0]?.currency || "$",
            status: "Pending",
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: razorOrder.id,
          };

          console.log("📦 Order data being saved:", order);

          const saveRes = await fetch(
            "https://bizzysite.onrender.com/api/orders",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(order),
            }
          );

          if (saveRes.ok) {
            setShowSuccessModal(true);
          } else {
            console.error("Order save failed:", await saveRes.text());
            alert("Order failed to save. Please contact support.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#6366F1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert(`Payment initiation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamically add Razorpay script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    console.log("🪵 location.state in OrderForm:", location.state);
  }, []);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-medium text-gray-800">
            Your cart is empty
          </h3>
          <p className="mt-2 text-gray-600">
            Please add some products to your cart before checkout.
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
              <p className="mb-6">Thanks for confirming your order.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Close
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
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
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
                        {item.currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {cart[0]?.currency || "$"}
                    {total.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {cart[0]?.currency || "$"}
                    {shippingCharge.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Platform Fee (3%)</span>
                  <span>
                    {cart[0]?.currency || "$"}
                    {platformFee.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {cart[0]?.currency || "$"}
                    {orderTotal.toFixed(2)}
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
