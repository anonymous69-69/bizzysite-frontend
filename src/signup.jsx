import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { auth, provider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload: include name only for signup
    const payload = {
      email,
      password,
      ...(isLogin ? {} : { name }),
    };

    try {
      const response = await fetch(`https://bizzysite.onrender.com/api/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // ensure JSON body
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // On HTTP error status, throw with server's message
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('userId', data.userId);
      toast.success(data.message || (isLogin ? 'Login successful' : 'Signup successful'));
      // Send welcome email after successful signup
      if (!isLogin) {
        await fetch('https://bizzysite.onrender.com/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });
      }
      setShowModal(false);
      navigate('/storefront');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const openModal = (login) => {
    setIsLogin(login);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      {/* Header with Login/Signup buttons */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BizzySite</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => openModal(true)}
              className="px-4 py-2 text-gray-700 font-medium hover:text-pink-600 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => openModal(false)}
              className="px-4 py-2 bg-[#fa6da4] text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">BizzySite</h1>
          <p className="text-2xl font-semibold text-gray-700 mb-6">Build your online store with ease</p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Empower your small business with a beautiful ecommerce website, fast checkout, and integrated payments.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => openModal(false)}
              className="px-6 py-3 bg-[#fa6da4] text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
            >
              Sign Up
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors">
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Features</h2>
          <p className="text-lg text-gray-600 mb-8">
            Everything you need to get started is built in – no coding required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-[#f9d3e0] p-6 rounded-lg shadow-sm">
              <div className="text-pink-800 text-3xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold mb-2">Quick Setup</h4>
              <p className="text-gray-700">
                Get your store online in under 10 minutes with our simple wizard
              </p>
            </div>
            <div className="bg-[#f9d3e0] p-6 rounded-lg shadow-sm">
              <div className="text-pink-800 text-3xl mb-4">👥</div>
              <h4 className="text-xl font-semibold mb-2">Customer Management</h4>
              <p className="text-gray-700">
                Track orders and manage customer relationships easily
              </p>
            </div>
            <div className="bg-[#f9d3e0] p-6 rounded-lg shadow-sm">
              <div className="text-pink-800 text-3xl mb-4">🎨</div>
              <h4 className="text-xl font-semibold mb-2">Easy Customization</h4>
              <p className="text-gray-700">
                Customize colors, fonts, and layout without any coding
              </p>
            </div>
          </div>

          <div className="bg-[#f9d3e0] p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-6">
              Why Small Businesses Choose BizzySite
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {["All-in-one ecommerce platform", "No hidden fees or locked-in contracts", "24/7 customer support", "Free SSL and hosting"].map((feature, idx) => (
                <div key={idx} className="flex items-center mb-4">
                  <div className="text-pink-800 text-3xl mr-3">✓</div>
                  <p className="ml-2 text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => openModal(false)}
                className="inline-block px-6 py-3 bg-[#fa6da4] text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
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

      {/* Login/Signup Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4">
              <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Create Account'}</h2>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa6da4]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa6da4]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa6da4]"
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
                            const res = await fetch("https://bizzysite.onrender.com/api/request-password-reset", {
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
                      className="text-sm text-[#fa6da4] hover:text-pink-700 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-[#fa6da4] text-white font-medium rounded-md hover:bg-pink-700 focus:ring-2 focus:ring-offset-2 focus:ring-[#fa6da4] transition-colors"
                  >
                    {isLogin ? 'Sign in' : 'Create account'}
                  </button>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
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
                          localStorage.setItem('userId', user.uid);
                          toast.success('Signed in with Google');
                          setShowModal(false);
                          navigate('/storefront');
                        } catch (error) {
                          console.error(error);
                          toast.error('Google sign-in failed');
                        }
                      }}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fa6da4]"
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
                    className="text-[#fa6da4] hover:text-pink-700 text-sm font-medium transition-colors"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}