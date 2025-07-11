import { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { auth, provider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      email,
      password,
      ...(isLogin ? {} : { name }),
    };
    try {
      // Defensive fetch for login/signup
      let url = `https://bizzysite.shop/api/${isLogin ? 'login' : 'signup'}`;
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (fetchErr) {
        console.error("Fetch error (login/signup):", fetchErr, url);
        throw new Error('Failed to connect to server.');
      }
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Something went wrong');
      }
      const data = await response.json();
      // Validate and store userId as string
      const userId = String(data.userId || '').trim();
      if (!userId) {
        console.error("Invalid or missing userId in response", data);
        throw new Error('Invalid user ID received from server.');
      }
      // Save user data to localStorage
      localStorage.setItem('userId', userId);
      localStorage.setItem('token', userId);
      localStorage.setItem('userEmail', data.email || '');
      localStorage.setItem('userName', data.name || '');
      localStorage.setItem('userPhone', data.phone || '');
      localStorage.setItem('userRole', 'vendor');
      if (!isLogin) {
        // Ensure userId is present and valid for store creation
        if (!userId) {
          throw new Error("Missing user ID for store creation.");
        }
        try {
          const businessRes = await fetch('https://bizzysite.shop/api/business', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userId}`
            },
            body: JSON.stringify({
              type: 'business',
              data: {
                name: name || 'My Store',
                email: email,
                phone: '',
                address: '',
                shippingCharge: 0
              }
            })
          });
          const businessData = await businessRes.json();
          if (!businessRes.ok) {
            throw new Error(businessData.message || "Failed to create store");
          }
          const storeId = businessData.storeId;
          if (storeId) {
            localStorage.setItem('storeId', storeId);
          } else {
            throw new Error("Store ID not received from server");
          }
          await fetch('https://bizzysite.shop/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name }),
          });
        } catch (error) {
          console.error("Store creation error:", error);
          toast.error("Failed to initialize your store. Please try again.");
          setIsLoading(false);
          return;
        }
      }
      // Only show success toast after everything succeeds
      toast.success(data.message || (isLogin ? 'Login successful' : 'Signup successful'));
      setIsLoading(false);
      setShowModal(false);
      setTimeout(() => {
        navigate('/storefront');
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Operation failed');
      setIsLoading(false);
    }
  };

  const openModal = (login) => {
    setIsLogin(login);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background using Framer Motion */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => {
          const size = Math.floor(Math.random() * 60) + 60;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 5;

          return (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0.4 }}
              animate={{ y: [-20, 20, -20] }}
              transition={{
                duration: 5,
                delay,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: ["#bbd0ff", "#b8c0ff", "#c8b6ff"][i % 3],
                borderRadius: "9999px",
                filter: "blur(6px)",
                opacity: 0.5
              }}
            />
          );
        })}
      </div>
      <Toaster position="top-right" />
      <header className="bg-white/70 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BizzySite</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
            <button 
              onClick={() => openModal(true)}
              className="px-4 py-2 text-gray-700 font-medium hover:text-[#7a6ff0] transition-colors w-full sm:w-auto"
            >
              Login
            </button>
            <button 
              onClick={() => openModal(false)}
              className="px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 text-[#7a6ff0] font-medium rounded-md hover:bg-white/80 transition-all shadow-sm w-full sm:w-auto"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <div className="relative py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4">BizzySite</h1>
          <TypeAnimation
            sequence={[
              "Build your online store with ease",
              2000,
              "Empower your small business with a beautiful ecommerce website, fast checkout, and integrated payments.",
              4000,
              "",
              1000,
            ]}
            wrapper="p"
            repeat={Infinity}
            className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6"
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
            <button 
              onClick={() => openModal(false)}
              className="px-6 py-3 bg-white/70 backdrop-blur-md border border-white/30 text-[#7a6ff0] font-medium rounded-md hover:bg-white/80 transition-all shadow-lg w-full sm:w-auto"
            >
              Sign Up
            </button>
            <button 
              onClick={() => openModal(true)}
              className="px-6 py-3 bg-transparent border-2 border-[#7a6ff0] text-[#7a6ff0] font-medium rounded-md hover:bg-[#7a6ff0]/10 transition-colors w-full sm:w-auto"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      <div className="relative py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Features</h2>
          <p className="text-base sm:text-lg text-gray-700 mb-8">
            Everything you need to get started is built in – no coding required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: "⚡", title: "Quick Setup", desc: "Get your store online in under 10 minutes with our simple wizard" },
              { icon: "👥", title: "Customer Management", desc: "Track orders and manage customer relationships easily" },
              { icon: "🎨", title: "Easy Customization", desc: "Customize colors, fonts, and layout without any coding" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/30 text-center">
                <div className="text-[#7a6ff0] text-3xl mb-4">{feature.icon}</div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">{feature.title}</h4>
                <p className="text-gray-700 text-base sm:text-lg">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-sm border border-white/30 max-w-4xl mx-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-center mb-6 text-gray-800">
              Why Small Businesses Choose BizzySite
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {["All-in-one ecommerce platform", "No hidden fees or locked-in contracts", "24/7 customer support", "Free SSL and hosting"].map((feature, idx) => (
                <div key={idx} className="flex items-center justify-center mb-4">
                  <div className="text-[#7a6ff0] text-2xl sm:text-3xl mr-3">✓</div>
                  <p className="ml-2 text-gray-700 text-base sm:text-lg">{feature}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => openModal(false)}
                className="inline-block px-6 py-3 bg-white/80 backdrop-blur-md border border-white/30 text-[#7a6ff0] font-medium rounded-md hover:bg-white transition-all shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800/80 backdrop-blur-md text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BizzySite</h3>
              <p className="text-gray-300 mb-4">
                Empowering small businesses to succeed online with simple, powerful tools.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Email: hello@bizzysite.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Business St, City</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Sales</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="#" className="hover:text-white">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white">Features</Link></li>
                <li><Link to="#" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="#" className="hover:text-white">Blog</Link></li>
                <li><Link to="#" className="hover:text-white">FAQs</Link></li>
                <li><Link to="#" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>

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
              willChange: "transform"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-4 px-4 sm:px-6 pb-6 sm:py-6 flex flex-col">
              {/* Drag handle bar */}
              <div className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 text-center">{isLogin ? 'Login' : 'Create Account'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                        const emailPrompt = prompt("Enter your email to reset your password:");
                        if (emailPrompt) {
                          try {
                            const res = await fetch("https://bizzysite.shop/api/request-password-reset", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: emailPrompt })
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.message || "Something went wrong");
                            toast.success(data.message || "Password reset email sent");
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
                        {isLogin ? 'Signing in' : 'Creating account'}
                        <span className="inline-block animate-pulse">...</span>
                      </span>
                    ) : (
                      isLogin ? 'Sign in' : 'Create account'
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

                          const res = await fetch('https://bizzysite.shop/api/google-login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              uid: user.uid,
                              name: user.displayName,
                              email: user.email
                            }),
                          });

                          const data = await res.json();
                          if (!res.ok) throw new Error(data.message || "Google login failed");

                          localStorage.setItem('userId', data.userId);
                          localStorage.setItem('token', data.userId || '');
                          localStorage.setItem('userEmail', data.email || '');
                          localStorage.setItem('userName', data.name || '');
                          localStorage.setItem('userPhone', data.phone || '');
                          localStorage.setItem('userRole', 'vendor');

                          toast.success(data.message || 'Signed in with Google');
                          setShowModal(false);
                          navigate('/storefront');
                        } catch (error) {
                          console.error(error);
                          toast.error(error.message || 'Google sign-in failed');
                        }
                      }}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md bg-white/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7a6ff0]"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
      {/* Background Animated Bubbles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => {
          const size = Math.floor(Math.random() * 60) + 60;
          const left = Math.random() * 90;
          const top = Math.random() * 80;
          const delay = Math.random() * 3;

          return (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0.4 }}
              animate={{ y: [-40, 40, -40] }}
              transition={{
                duration: 3,
                delay,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: ["#bbd0ff", "#b8c0ff", "#c8b6ff"][i % 3],
                borderRadius: "9999px",
                filter: "blur(6px)",
                opacity: 0.4
              }}
            />
          );
        })}
      </div>
    </div>
  );
}