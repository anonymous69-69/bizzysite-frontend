import { useState, useEffect, useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import Orb from "./Orb";
import BlurText from "./BlurText";

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
const [resetEmail, setResetEmail] = useState("");
const [isSendingReset, setIsSendingReset] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isLogin && (!name || !email || !password)) {
    toast.error("Please fill all required fields");
    return;
  }

  if (!isLogin && password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  setIsLoading(true);
  const payload = {
    email,
    password,
    ...(isLogin ? {} : { name }),
  };

  try {
    const url = `https://bizzysite.onrender.com/api/${isLogin ? "login" : "signup"}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed. Please try again.");
    }

    const userId = String(data.userId || data._id || "").trim();
    if (!userId) {
      throw new Error("Invalid user ID received from server.");
    }

    localStorage.setItem("userId", userId);
    localStorage.setItem("token", userId);
    localStorage.setItem("userEmail", data.email || "");
    localStorage.setItem("userName", data.name || "");
    localStorage.setItem("userPhone", data.phone || "");
    localStorage.setItem("userRole", "vendor");

    if (!isLogin) {
      try {
        const businessRes = await fetch("https://bizzysite.onrender.com/api/business", {
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
        });

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

        await fetch("https://bizzysite.onrender.com/api/send-welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
      } catch (error) {
        toast.error("Failed to initialize your store. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    toast.success(data.message || (isLogin ? "Login successful" : "Signup successful"));
    setIsLoading(false);
    setShowModal(false);
    setTimeout(() => {
      navigate("/storefront");
    }, 500);
  } catch (error) {
    toast.error(
      error.message || "Registration failed. Please check your details and try again."
    );
    setIsLoading(false);
  }
};


  const openModal = (login) => {
    setIsLogin(login);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Orb */}
      <div className="absolute top-0 left-0 w-full min-h-screen z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[70vmin] aspect-square">
            <Orb
              hue={2}
              hoverIntensity={0.6}
              rotateOnHover={true}
              forceHoverState={false}
            />
          </div>
          {/* <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div> */}
        </div>
      </div>

      <Toaster position="top-right" />

      {/* Header - Dark Theme */}
      <header className="fixed w-full bg-gray-900/80 backdrop-blur-md shadow-sm z-30 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-2xl font-bold text-white">BizzySite</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => openModal(true)}
              className="px-4 py-2 text-gray-300 font-medium hover:text-indigo-400 transition-colors"
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

      {/* Hero Section - Dark Theme */}
      <div className="min-h-screen flex flex-col justify-center items-center pt-24 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight text-center"
          >
            <BlurText
              text="Build Your Online Store"
              animateBy="words"
              direction="top"
              className="leading-tight"
              delay={600}
              stepDuration={1}
            />
            <BlurText
              text="For Free"
              animateBy="words"
              direction="top"
              className="leading-tight"
              delay={600}
              stepDuration={1}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="min-h-[72px] sm:min-h-[60px] flex justify-center items-center">
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
                className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto text-center"
              />
            </div>
          </motion.div>

          <div className="flex justify-center items-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal(false)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/20"
            >
              Get Started Free
            </motion.button>
          </div>
        </div>
      </div>

      {/* Features Section - Dark Theme */}
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed Online
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                        repeatDelay: 0,
                        ease: "easeOut",
                      }}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <div className="text-4xl">🚀</div>
                    </motion.div>
                  </div>
                ),
              },
              {
                title: "Everything for free",
                desc: "Absolutely free for all the users with no hidden charges",
                animation: (
                  <div className="h-16 flex items-center justify-center mb-6">
                    <div
                      style={{
                        position: "relative",
                        width: 80,
                        height: 40,
                        filter:
                          "drop-shadow(0 4px 6px rgba(99, 102, 241, 0.3))",
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
                          backgroundColor: "#4b5563",
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
                          backgroundColor: "#1f2937",
                          borderRadius: 3,
                          boxShadow: `
                            0 2px 8px rgba(0,0,0,0.2),
                            0 4px 12px rgba(79, 70, 229, 0.3),
                            inset 0 0 0 1px rgba(255,255,255,0.05)
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
                            backgroundColor: "#374151",
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
                            backgroundColor: "#6366f1",
                            borderRadius: 2,
                          }}
                        ></div>
                      </motion.div>

                      {/* Subtle glow effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
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
                          backgroundColor: "#6366f1",
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
                        boxShadow: "0 0 10px rgba(99, 102, 241, 0.3)",
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
                            backgroundColor: "#1f2937",
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
                                    i % 2 === 0 ? "#6366f1" : "#8b5cf6",
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
                            backgroundColor: "#6366f1",
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
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700"
              >
                {feature.animation}
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Trusted by Thousands of Businesses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
            {[
              {
                text: "BizzySite helped us launch our online store in just few minutes. The setup was incredibly simple!",
                author: "candy crochet ",
                role: "Crochet store",
              },
              {
                text: "Our sales increased by 40% after switching to BizzySite. The beautiful storefront really makes a difference.",
                author: "siya",
                role: "SiyaCakes",
              },
              {
                text: "As a small business owner with no tech skills, BizzySite has been a game-changer for us.",
                author: "Ron",
                role: "Criss Soaps",
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
            className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-lg shadow-xl hover:bg-gray-100 transition-all"
          >
            Get started for free
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                BizzySite
              </h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Empowering small businesses to succeed online with simple,
                powerful tools.
              </p>
            </div>
            <div></div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Contact
              </h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li>Email: your-store@bizzysite.shop</li>
               
              </ul>
            </div>
          </div>
          <div
            className={`border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-500`}
          >
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>

      {/* Modal - Dark Theme */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end p-0 sm:p-4 z-50"
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
            className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl max-w-lg w-full mx-auto border border-gray-700 p-6 sm:p-8"
            style={{
              boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)",
              willChange: "transform",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-4 px-4 sm:px-6 pb-6 sm:py-6 flex flex-col">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white text-center">
                {isLogin ? "Login" : "Create Account"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder-gray-500 text-sm"
                      required
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder-gray-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder-gray-500 text-sm"
                    required
                  />
                </div>
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
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

                <div className="mt-6"></div>
                <div className="relative my-6">
                  <hr className="border-gray-700" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 -top-2 px-2 text-sm text-gray-400 bg-gray-900">
                    or continue with
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const result = await signInWithPopup(auth, provider);
                        const user = result.user;

                        const res = await fetch(
                          "https://bizzysite.onrender.com/api/google-login",
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

                        toast.success(data.message || "Signed in with Google");
                        setShowModal(false);
                        navigate("/storefront");
                      } catch (error) {
                        console.error(error);
                        toast.error(error.message || "Google sign-in failed");
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  >
                    <div className="w-5 h-5">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 533.5 544.3"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.1c-6.3 34.1-25.1 62.9-53.5 82.1v68.2h86.4c50.7-46.7 81.5-115.5 81.5-195.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M272 544.3c72.9 0 134-24.2 178.6-65.8l-86.4-68.2c-24 16-54.5 25.4-92.2 25.4-70.9 0-131-47.9-152.5-112.1H30.8v70.4C74.7 474.7 166.4 544.3 272 544.3z"
                          fill="#34A853"
                        />
                        <path
                          d="M119.5 323.6c-10.2-30.1-10.2-62.6 0-92.7v-70.4H30.8c-42.5 84.6-42.5 183.3 0 267.9l88.7-70.4z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M272 107.1c39.7-.6 77.5 14.6 106.6 41.6l79.4-79.4C406 24.8 345.8 0 272 0 166.4 0 74.7 69.6 30.8 173.3l88.7 70.4C141 155 201.1 107.1 272 107.1z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white">
                      Continue with Google
                    </span>
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
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
      {/* Forgot Password Modal */}
{showForgotPasswordModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full mx-auto border border-gray-700 p-8"
    >
      <h2 className="text-2xl font-bold mb-6 text-white text-center">
        Reset Your Password
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email address
          </label>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder-gray-500"
            placeholder="your@email.com"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowForgotPasswordModal(false);
              setResetEmail("");
            }}
            className="flex-1 py-2.5 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition-colors"
            disabled={isSendingReset}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={async () => {
              if (!resetEmail) {
                toast.error("Please enter your email address");
                return;
              }
              
              setIsSendingReset(true);
              try {
                const res = await fetch(
                  "https://bizzysite.onrender.com/api/request-password-reset",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: resetEmail }),
                  }
                );
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Something went wrong");
                
                toast.success("Password reset email sent. Please check your inbox.");
                setShowForgotPasswordModal(false);
                setResetEmail("");
              } catch (err) {
                toast.error(err.message);
              } finally {
                setIsSendingReset(false);
              }
            }}
            className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
            disabled={isSendingReset}
          >
            {isSendingReset ? (
              <span>Sending<span className="animate-pulse">...</span></span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  </div>
)}
    </div>
  );
}
