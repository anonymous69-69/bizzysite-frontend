import { useState, useEffect, useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    // Auto-scroll the laptop screen content for mockup
    let scrollPos = 0;
    const scrollInterval = setInterval(() => {
      if (contentRef.current) {
        scrollPos += 0.5;
        if (scrollPos > 300) scrollPos = 0;
        contentRef.current.style.transform = `translateY(-${scrollPos}px)`;
      }
    }, 30);

    return () => clearInterval(scrollInterval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      email,
      password,
      ...(isLogin ? {} : { name }),
    };
    try {
      let url = ` https://bizzysite.onrender.com/api/${
        isLogin ? "login" : "signup"
      }`;
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (fetchErr) {
        console.error("Fetch error (login/signup):", fetchErr, url);
        throw new Error("Failed to connect to server.");
      }
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const raw = await response.text();
        console.error("Non-JSON response from server:", raw);
        throw new Error("Unexpected server response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Something went wrong");
      }
      const userId = String(data.userId || "").trim();
      if (!userId) {
        console.error("Invalid or missing userId in response", data);
        throw new Error("Invalid user ID received from server.");
      }
      localStorage.setItem("userId", userId);
      localStorage.setItem("token", userId);
      localStorage.setItem("userEmail", data.email || "");
      localStorage.setItem("userName", data.name || "");
      localStorage.setItem("userPhone", data.phone || "");
      localStorage.setItem("userRole", "vendor");
      if (!isLogin) {
        if (!userId) {
          throw new Error("Missing user ID for store creation.");
        }
        try {
          const businessRes = await fetch(
            " https://bizzysite.onrender.com/api/business",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userId}`,
              },
              body: JSON.stringify({
                type: "business",
                data: {
                  name: name || "My Store",
                  email: email,
                  phone: "",
                  address: "",
                  shippingCharge: 0,
                },
              }),
            }
          );
          const businessData = await businessRes.json();
          if (!businessRes.ok) {
            throw new Error(businessData.message || "Failed to create store");
          }
          const storeId = businessData.storeId;
          if (storeId) {
            localStorage.setItem("storeId", storeId);
          } else {
            throw new Error("Store ID not received from server");
          }
          await fetch(
            " https://bizzysite.onrender.com/api/send-welcome-email",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, name }),
            }
          );
        } catch (error) {
          console.error("Store creation error:", error);
          toast.error("Failed to initialize your store. Please try again.");
          setIsLoading(false);
          return;
        }
      }
      toast.success(
        data.message || (isLogin ? "Login successful" : "Signup successful")
      );
      setIsLoading(false);
      setShowModal(false);
      setTimeout(() => {
        navigate("/storefront");
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Operation failed");
      setIsLoading(false);
    }
  };

  const openModal = (login) => {
    setIsLogin(login);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50 to-indigo-50">
      {/* Floating background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => {
          const size = Math.floor(Math.random() * 40) + 20;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 5;
          const duration = Math.random() * 5 + 5;
          const colors = [
            "#818cf8",
            "#a78bfa",
            "#c084fc",
            "#e879f9",
            "#f472b6",
          ];

          return (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [-20, 20, -20] }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor:
                  colors[Math.floor(Math.random() * colors.length)],
                borderRadius: "9999px",
                filter: "blur(10px)",
                opacity: Math.random() * 0.1 + 0.05,
              }}
            />
          );
        })}
      </div>

      <Toaster position="top-right" />

      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BizzySite</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => openModal(true)}
              className="px-4 py-2 text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => openModal(false)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-md hover:opacity-90 transition-all shadow-md"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Floating Laptop */}
      <div className="min-h-screen flex flex-col justify-center items-center pt-32 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6"
          >
            Build Your Online Store <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Without Coding
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <TypeAnimation
              sequence={[
                "Create beautiful ecommerce sites in minutes",
                2000,
                "Powerful tools for small businesses",
                2000,
                "Easy customization, no technical skills needed",
                2000,
              ]}
              wrapper="p"
              repeat={Infinity}
              className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto"
            />
          </motion.div>

          <div className="flex justify-center items-center mb-20">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal(false)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-all shadow-xl"
            >
              Get Started Free
            </motion.button>
          </div>

          {/* Floating Laptop */}
          <motion.div
            className="relative w-full max-w-3xl mx-auto mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: 0,
              x: [0, 5, 0],
              y: [0, 5, 0],
            }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              x: {
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
              y: {
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
            whileInView={{
              x: window.innerWidth < 768 ? 0 : [0, 5, 0],
              y: window.innerWidth < 768 ? 0 : [0, 5, 0],
            }}
          
          >
            <div className="relative" style={{ perspective: "1000px" }}>
              <motion.div
                className="relative mx-auto"
                animate={{
                  rotateX: window.innerWidth < 768 ? 0 : 5,
                  rotateY: window.innerWidth < 768 ? 0 : -15,
                  rotateZ: window.innerWidth < 768 ? 0 : -3,
                }}
          
                
                transition={{
                  duration: 1,
                  ease: "easeOut",
                }}
              >
                {/* Laptop Screen */}
                <div
                  className="absolute inset-0 w-[76%] h-[75%] mx-auto rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800"
                  style={{
                    top: "5%",
                    left: "12%",
                    backgroundColor: "#f0f0f0",
                    zIndex: 10,
                  }}
                >
                  <div className="absolute inset-0 bg-white flex flex-col">
                    <div
                      ref={contentRef}
                      className="w-full h-[200%] transition-transform duration-300"
                    >
                      {/* E-commerce mockup content (keep your existing mockup code) */}
                      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
                        <div className="font-bold">MyStore</div>
                        <div className="flex space-x-4">
                          <div className="w-6 h-6 rounded-full bg-white/20"></div>
                          <div className="w-6 h-6 rounded-full bg-white/20"></div>
                        </div>
                      </div>

                      {/* Hero section */}
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-8 text-center">
                        <h3 className="text-xl font-bold mb-2">My Store</h3>
                        <p className="text-sm opacity-80">
                          Discover our new products
                        </p>
                      </div>

                      {/* Products grid */}
                      <div className="grid grid-cols-2 gap-4 p-4">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                          <div
                            key={item}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-100 h-24"></div>
                            <div className="p-2">
                              <div className="text-sm font-medium">
                                Product {item}
                              </div>
                              <div className="text-xs text-gray-500">
                                $29.99
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* More products */}
                      <div className="p-4">
                        <div className="text-center py-4 text-gray-500">
                          More products...
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[7, 8, 9, 10].map((item) => (
                            <div
                              key={item}
                              className="border rounded-lg overflow-hidden"
                            >
                              <div className="bg-gray-100 h-20"></div>
                              <div className="p-2">
                                <div className="text-sm font-medium">
                                  Product {item}
                                </div>
                                <div className="text-xs text-gray-500">
                                  $29.99
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Laptop Body */}
                <div className="relative w-full" style={{ zIndex: 5 }}>
                  <svg viewBox="0 0 800 550" className="w-full h-auto">
                    <path
                      d="M100,100 C100,50 700,50 700,100 L700,450 C700,500 100,500 100,450 Z"
                      fill="#f3f4f6"
                      stroke="#d1d5db"
                      strokeWidth="2"
                    />
                    <rect
                      x="150"
                      y="110"
                      width="500"
                      height="280"
                      rx="5"
                      fill="#ffffff"
                    />
                    {/* Keyboard area */}
                    <rect
                      x="180"
                      y="400"
                      width="440"
                      height="80"
                      rx="5"
                      fill="#e5e7eb"
                      stroke="#d1d5db"
                      strokeWidth="1"
                    />
                    {/* Trackpad */}
                    <rect
                      x="320"
                      y="420"
                      width="160"
                      height="50"
                      rx="3"
                      fill="#d1d5db"
                    />
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed Online
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to help your business grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Lightning Fast Setup",
                desc: "Launch your store in minutes with our intuitive setup wizard",
                animation: (
                  <div className="h-16 flex items-center justify-center mb-6 relative">
                    {/* Rocket */}
                    <motion.div
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: -40, opacity: 0 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        ease: "easeOut",
                      }}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <div className="text-4xl">🚀</div>
                    </motion.div>

                    {/* Enhanced smoke effect - now more visible */}
                    <motion.div
                      initial={{
                        scale: 0.5,
                        opacity: 0.9,
                        y: 10,
                      }}
                      animate={{
                        scale: 4,
                        opacity: 0,
                        y: -20,
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        ease: "easeOut",
                      }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        marginLeft: -15,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: "rgba(120, 120, 120, 0.7)", // Darker gray color
                        filter: "blur(8px)", // Increased blur
                        zIndex: 1,
                      }}
                    />
                    {/* Additional smoke particle for more effect */}
                    <motion.div
                      initial={{
                        scale: 0.3,
                        opacity: 0.7,
                        y: 15,
                        x: -5,
                      }}
                      animate={{
                        scale: 3,
                        opacity: 0,
                        y: -10,
                        x: 5,
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        ease: "easeOut",
                      }}
                      style={{
                        position: "absolute",
                        bottom: -5,
                        left: "50%",
                        width: 25,
                        height: 25,
                        borderRadius: "50%",
                        backgroundColor: "rgba(150, 150, 150, 0.6)", // Medium gray
                        filter: "blur(6px)",
                        zIndex: 1,
                      }}
                    />
                  </div>
                ),
              },
              {
                title: "Integrated Payments",
                desc: "Accept credit cards, PayPal, and other payment methods securely",
                animation: (
                  <div className="h-16 flex items-center justify-center mb-6">
                    <div
                      style={{
                        position: "relative",
                        width: 80,
                        height: 40,
                        filter: "drop-shadow(0 4px 6px rgba(79, 70, 229, 0.2))",
                      }}
                    >
                      {/* Payment Terminal Base */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 60,
                          height: 30,
                          backgroundColor: "#d1d5db",
                          borderRadius: 4,
                          boxShadow:
                            "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      ></div>

                      {/* Credit Card */}
                      <motion.div
                        initial={{ x: 30, y: 0, rotate: 0 }}
                        animate={{ x: -30, rotate: -10 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "50%",
                          width: 40,
                          height: 25,
                          backgroundColor: "white",
                          borderRadius: 3,
                          boxShadow: `
                            0 2px 8px rgba(0,0,0,0.2),
                            0 4px 12px rgba(79, 70, 229, 0.15),
                            inset 0 0 0 1px rgba(0,0,0,0.05)
                          `,
                          zIndex: 10,
                        }}
                      >
                        {/* Card Details */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            right: 4,
                            height: 4,
                            backgroundColor: "#e5e7eb",
                            borderRadius: 2,
                          }}
                        ></div>
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 4,
                            width: 12,
                            height: 8,
                            backgroundColor: "#818cf8",
                            borderRadius: 2,
                          }}
                        ></div>
                      </motion.div>

                      {/* Subtle glow effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          top: -5,
                          left: "50%",
                          width: 50,
                          height: 30,
                          backgroundColor: "#818cf8",
                          borderRadius: "50%",
                          filter: "blur(8px)",
                          transform: "translateX(-50%)",
                          zIndex: 1,
                        }}
                      />
                    </div>
                  </div>
                ),
              },
              {
                title: "Mobile Optimized",
                desc: "Beautiful storefront that works perfectly on all devices",
                animation: (
                  <div className="h-16 flex items-center justify-center mb-6">
                    <div
                      style={{
                        position: "relative",
                        width: 40,
                        height: 60,
                        backgroundColor: "black",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "2px solid #333",
                      }}
                    >
                      <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: -60 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }}
                      >
                        <div
                          style={{
                            height: 60,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "center",
                            }}
                          >
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                style={{
                                  width: 12,
                                  height: 12,
                                  backgroundColor:
                                    i % 2 === 0 ? "#818cf8" : "#a78bfa",
                                  margin: 3,
                                  borderRadius: 3,
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div
                          style={{
                            height: 60,
                            backgroundColor: "#818cf8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: "white",
                              borderRadius: 10,
                            }}
                          ></div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ),
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                {feature.animation}
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Trusted by Thousands of Businesses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
            {[
              {
                text: "BizzySite helped us launch our online store in just 2 days. The setup was incredibly simple!",
                author: "Sarah Johnson",
                role: "Owner, Boutique Store",
              },
              {
                text: "Our sales increased by 40% after switching to BizzySite. The beautiful storefront really makes a difference.",
                author: "Michael Chen",
                role: "Founder, Tech Gadgets",
              },
              {
                text: "As a small business owner with no tech skills, BizzySite has been a game-changer for us.",
                author: "Emma Rodriguez",
                role: "CEO, Handmade Crafts",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <div className="text-3xl mb-4">“</div>
                <p className="mb-6">{testimonial.text}</p>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-indigo-200">{testimonial.role}</div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal(false)}
            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg shadow-xl hover:bg-gray-100 transition-all"
          >
            Start Your Free Trial
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <h3 className="text-xl font-bold">BizzySite</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Empowering small businesses to succeed online with simple,
                powerful tools.
              </p>
              <div className="flex space-x-4">
                {["twitter", "facebook", "instagram", "linkedin"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                        {social[0].toUpperCase()}
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>

            {[
              {
                title: "Product",
                links: [
                  "Features",
                  "Templates",
                  "Pricing",
                  "Integrations",
                  "Roadmap",
                ],
              },
              {
                title: "Resources",
                links: [
                  "Blog",
                  "Documentation",
                  "Guides",
                  "Help Center",
                  "API Status",
                ],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Partners", "Legal"],
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="text-lg font-semibold mb-6">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        to="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">
              © 2024 BizzySite. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end p-0 sm:p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 100 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 100) {
                setShowModal(false);
              }
            }}
            className="bg-white/40 backdrop-blur-md rounded-t-2xl shadow-xl max-w-lg w-full mx-auto border border-white/20 sm:rounded-lg sm:max-w-md"
            style={{
              boxShadow: "0 0 12px rgba(122, 111, 240, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              willChange: "transform",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-4 px-4 sm:px-6 pb-6 sm:py-6 flex flex-col">
              <div className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 text-center">
                {isLogin ? "Login" : "Create Account"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a6ff0] bg-white/70"
                      required
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a6ff0] bg-white/70"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a6ff0] bg-white/70"
                    required
                  />
                </div>
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        const emailPrompt = prompt(
                          "Enter your email to reset your password:"
                        );
                        if (emailPrompt) {
                          try {
                            const res = await fetch(
                              " https://bizzysite.onrender.com/api/request-password-reset",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: emailPrompt }),
                              }
                            );
                            const data = await res.json();
                            if (!res.ok)
                              throw new Error(
                                data.message || "Something went wrong"
                              );
                            toast.success(
                              data.message || "Password reset email sent"
                            );
                          } catch (err) {
                            toast.error(err.message);
                          }
                        }
                      }}
                      className="text-sm text-[#7a6ff0] hover:text-[#5a50d0] transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-[#7a6ff0] text-white font-medium rounded-md hover:bg-[#5a50d0] focus:ring-2 focus:ring-offset-2 focus:ring-[#7a6ff0] transition-colors shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>
                        {isLogin ? "Signing in" : "Creating account"}
                        <span className="inline-block animate-pulse">...</span>
                      </span>
                    ) : isLogin ? (
                      "Sign in"
                    ) : (
                      "Create account"
                    )}
                  </button>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white/70 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const result = await signInWithPopup(auth, provider);
                          const user = result.user;

                          const res = await fetch(
                            " https://bizzysite.onrender.com/api/google-login",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                uid: user.uid,
                                name: user.displayName,
                                email: user.email,
                              }),
                            }
                          );

                          const data = await res.json();
                          if (!res.ok)
                            throw new Error(
                              data.message || "Google login failed"
                            );

                          localStorage.setItem("userId", data.userId);
                          localStorage.setItem("token", data.userId || "");
                          localStorage.setItem("userEmail", data.email || "");
                          localStorage.setItem("userName", data.name || "");
                          localStorage.setItem("userPhone", data.phone || "");
                          localStorage.setItem("userRole", "vendor");

                          toast.success(
                            data.message || "Signed in with Google"
                          );
                          setShowModal(false);
                          navigate("/storefront");
                        } catch (error) {
                          console.error(error);
                          toast.error(error.message || "Google sign-in failed");
                        }
                      }}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md bg-white/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7a6ff0]"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.545 10.239v3.821h5.445c-0.261 1.353-1.126 2.471-2.381 3.229l3.845 2.979c2.246-2.071 3.538-5.116 3.538-8.579 0-0.741-0.071-1.457-0.202-2.155h-8.245z" />
                      </svg>
                      <span className="ml-2">Google</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#7a6ff0] hover:text-[#5a50d0] text-sm font-medium transition-colors"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
