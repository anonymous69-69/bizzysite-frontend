import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [businessInfo, setBusinessInfo] = useState({
    storeId:'',
    name: '',
    phone: '',
    email: '',
    description: '',
    address: ''
  });

  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('Setup');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!businessInfo.name.trim()) {
      alert('Business name is required');
      return;
    }
  
    try {
      const res = await fetch('https://bizzysite.onrender.com/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'business', data: { ...businessInfo } })
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        throw new Error(result.message || "Failed to save");
      }
  
      if (result.storeId) {
        setBusinessInfo(prev => ({ ...prev, storeId: result.storeId }));
      }
  
      console.log("✅ Saved business info:", result);
      setSaved(true);
      setProgress(1);
    } catch (err) {
      console.error('❌ Failed to save business info:', err);
      alert('Failed to save. Please try again.');
    }
  };
  
  useEffect(() => {
    fetch('https://bizzysite.onrender.com/api/business')
      .then(res => res.json())
      .then(data => {
        if (data?.business) {
          setBusinessInfo({ ...data.business, storeId: data.storeId || '' });
        }
      })
      .catch(err => console.error('Failed to fetch business info:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 flex-grow w-full">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-4">
            <Link to="/signup" className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">BizzySite</Link>
            {/* Storefront action buttons */}
            <ViewSiteButtons />
          </div>
        </div>
        <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Welcome to your business dashboard</h2>
        <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">Set up your online store in minutes and start selling today</p>

        {/* Navigation Tabs */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-6 px-2 py-2 bg-gray-50 rounded-lg min-w-max">
              {[
                { name: 'Setup', icon: '📊' },
                { name: 'Products', icon: '📦' },
                { name: 'Orders', icon: '🛒' },
                { name: 'Customize', icon: '🎨' },
                { name: 'Preview', icon: '🌐' },
                { name: 'Payments', icon: '💳' }
              ].map((tab) =>
                tab.name === 'Products' ? (
                  <Link
                    to="/products"
                    key={tab.name}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                      activeTab === tab.name
                        ? 'bg-purple-100 text-indigo-700'
                        : 'text-gray-500 hover:text-indigo-600'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                ) : tab.name === 'Orders' ? (
                  <Link
                    to="/orders"
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                      activeTab === tab.name
                        ? 'bg-purple-100 text-indigo-700'
                        : 'text-gray-500 hover:text-indigo-600'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                ) : (
                  <Link
                    to={
                      tab.name === 'Customize' ? '/customize' :
                      tab.name === 'Setup' ? '/storefront' :
                      tab.name === 'Preview' ? '/navview' :
                      tab.name === 'Payments' ? '/payment' : '#'
                    }
                    key={tab.name}
                    onClick={() => {
                      setActiveTab(tab.name);
                      if (tab.name === 'Setup') {
                        const el = document.getElementById('business-info');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-md focus:outline-none text-sm sm:text-base ${
                      activeTab === tab.name
                        ? 'bg-purple-100 text-indigo-700'
                        : 'text-gray-500 hover:text-indigo-600'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        {/* Business Information Form */}
        <div id="business-info" className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
          <p className="text-gray-600 mb-6">Tell us about your business to get started</p>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={businessInfo.name}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={businessInfo.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={businessInfo.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                value={businessInfo.description}
                onChange={handleChange}
                placeholder="Describe your business"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="mb-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                id="address"
                name="address"
                value={businessInfo.address}
                onChange={handleChange}
                placeholder="Enter your business address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Business Information
              </button>
            </div>
          </form>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Setup Progress</h3>
          <p className="text-gray-600 mb-6">Complete these steps to launch your store</p>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress {progress}/4 steps
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round((progress / 4) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-300 h-2.5 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${(progress / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <ul className="space-y-3">
            {[
              { id: 1, name: 'Business Info', completed: progress >= 1 },
              { id: 2, name: 'Products Added', completed: progress >= 2 },
              { id: 3, name: 'Payment Setup', completed: progress >= 3 },
              { id: 4, name: 'Site Customized', completed: progress >= 4 }
            ].map((step) => (
              <li key={step.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={step.completed}
                  readOnly
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className={`ml-3 ${step.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                  {step.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">BizzySite</h3>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                Empowering small businesses to succeed online with simple, powerful tools.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li>Email: rhythmsarma66@gmail.com</li>
                <li>Phone: +91 7086758292</li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li><Link to="#" className="hover:text-white">Blog</Link></li>
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
// --- ViewSiteButtons Component ---
import React, { useState, useEffect } from "react";

function ViewSiteButtons() {
  const [storeId, setStoreId] = useState("");
  useEffect(() => {
    fetch("https://bizzysite.onrender.com/api/business")
      .then((res) => res.json())
      .then((data) => setStoreId(data.storeId || ""));
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <button
        className="px-3 py-1 sm:px-4 sm:py-2 border border-purple-300 text-purple-500 bg-white rounded-md font-medium hover:bg-purple-50 text-sm sm:text-base"
        onClick={() => {
          if (storeId) {
            window.open(
              `https://bizzysite-frontend.onrender.com/store/${storeId}`,
              "_blank"
            );
          } else {
            alert("Store ID not available. Please complete setup.");
          }
        }}
      >
        View Site
      </button>
      <button
        className="px-3 py-1 sm:px-4 sm:py-2 border border-purple-300 text-purple-500 bg-white rounded-md font-medium hover:bg-purple-50 text-sm sm:text-base"
        onClick={() => {
          if (storeId) {
            navigator.clipboard.writeText(
              `https://bizzysite-frontend.onrender.com/store/${storeId}`
            );
            alert("🔗 Link copied!");
          } else {
            alert("Store ID not available. Please complete setup.");
          }
        }}
      >
        Copy Link
      </button>
    </div>
  );
}