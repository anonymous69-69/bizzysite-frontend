import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email,
      password,
      ...(isLogin ? {} : { name }),
    };

    try {
      const response = await fetch(`http://localhost:5050/api/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      alert(data.message || (isLogin ? 'Login successful' : 'Signup successful'));
      setShowModal(false);
      navigate('/storefront');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const openModal = (login) => {
    setIsLogin(login);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Build Your Online Store in Minutes, Not Months
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Perfect for small business owners who want to sell online without the complexity. 
            No coding, no hassle, just results.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => openModal(false)}
              className="px-6 py-3 bg-[#fa6da4] text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
            >
              Start Building Free →
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-semibold text-center text-gray-900 mb-12">
            Everything You Need to Succeed Online
          </h3>
          <p className="text-lg text-gray-600 text-center mb-12">
            We've built the simplest way for small businesses to create professional online stores
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
              {[
                'No technical knowledge required',
                'Mobile-friendly stores',
                'Multiple payment options (UPI, Bank Transfer)',
                'Real-time order management',
                'Professional design templates',
                'SEO-optimized for better visibility'
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-pink-800 mt-0.5">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-2 text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => openModal(false)}
                className="inline-block px-6 py-3 bg-[#fa6da4] text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
              >
                Start Your Free Store →
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
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Community</Link></li>
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
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {isLogin ? 'Welcome back!' : 'Create your store'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
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
                
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-[#fa6da4] text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fa6da4] transition-colors"
                  >
                    {isLogin ? 'Sign in' : 'Create account'}
                  </button>
                </div>
              </form>
              
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
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fa6da4]"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.146-2.675-6.735-2.675-5.522 0-10 4.479-10 10s4.478 10 10 10c8.396 0 10-7.496 10-10 0-0.67-0.069-1.325-0.189-1.961h-9.811z" />
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}