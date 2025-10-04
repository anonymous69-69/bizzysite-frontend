import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTheme } from "./ThemeContext";
import { useNavigate } from "react-router-dom";

export default function CustomizeStore() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [textColor, setTextColor] = useState("white");
  const [storeId, setStoreId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Reset to Default function
  const resetToDefault = () => {
    setPrimaryColor("#3b82f6");
    setSecondaryColor("#8b5cf6");
    setTextColor("white");
    toast.success("Colors reset to default.");
  };


  useEffect(() => {
    document.title = 'Customize your website with millions of colors';
}, []);


  useEffect(() => {
    const savedStoreId = localStorage.getItem("storeId");
    const userId = localStorage.getItem("userId");

    if (!userId) {
      navigate("/login");
      return;
    }

    if (savedStoreId) {
      setStoreId(savedStoreId);
      fetchCustomization(savedStoreId, userId);
    } else {
        toast.error("Please set up your store first!");
        navigate('/storefront');
    }
    setIsLoading(false);
  }, [navigate]);

  const fetchCustomization = async (storeId, userId) => {
    if (!userId || !storeId) return;

    try {
      const response = await fetch(
        `https://bizzysite.onrender.com/api/business`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userId}`,
            "x-store-id": storeId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const customization = data?.customize || {};

        setPrimaryColor(customization.primaryColor || "#3b82f6");
        setSecondaryColor(customization.secondaryColor || "#8b5cf6");
        setTextColor(customization.textColor || "white");
      }
    } catch (err) {
      console.error("Failed to fetch customization:", err);
      toast.error("Could not load your customization settings.");
    }
  };
  
  const colorPalette = [
    { name: "Blue", value: "#3b82f6" }, { name: "Green", value: "#10b981" },
    { name: "Red", value: "#ef4444" }, { name: "Violet", value: "#8b5cf6" },
    { name: "Yellow", value: "#f59e0b" }, { name: "Pink", value: "#ec4899" },
    { name: "Purple", value: "#9333ea" }, { name: "Indigo", value: "#6366f1" },
  ];

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");

    if (!primaryColor || !secondaryColor || !textColor) {
      toast.error("Please select all customization options.", { id: toastId });
      setIsSaving(false);
      return;
    }

    const userId = localStorage.getItem("userId");
    const settings = { primaryColor, secondaryColor, textColor };

    try {
      const response = await fetch(
        `https://bizzysite.onrender.com/api/business`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userId}`,
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            type: "customize",
            data: settings,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save customization");
      }

      toast.success("Customization saved successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to save customization: " + error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-pulse">
            <div className="lg:col-span-2 space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
                  <div className={`h-6 w-1/3 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                  <div className={`h-4 w-1/2 rounded mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {[...Array(6)].map((_, j) => <div key={j} className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
                <div className={`h-6 w-1/2 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className={`h-4 w-3/4 rounded mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                <div className={`h-64 w-full rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </div>
            </div>
        </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Color Scheme Section */}
          <div className={`rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>Color Scheme</h2>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Choose colors that match your brand's identity.</p>
            {['primary', 'secondary'].map((type) => (
              <div key={type} className="mb-6 sm:mb-8">
                <h3 className={`text-lg font-medium mb-4 capitalize ${darkMode ? "text-gray-300" : "text-gray-800"}`}>{type} Color</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {colorPalette.map((color) => (
                    <button
                      key={`${type}-${color.value}`}
                      onClick={() => type === 'primary' ? setPrimaryColor(color.value) : setSecondaryColor(color.value)}
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 focus:outline-none ${ (type === 'primary' ? primaryColor : secondaryColor) === color.value ? "ring-2 ring-indigo-500 scale-110" : "border-transparent"} hover:scale-110`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {(type === 'primary' ? primaryColor : secondaryColor) === color.value && ( <span className="absolute inset-0 flex items-center justify-center"><svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>)}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor={`${type}-color`} className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Custom Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" id={`${type}-color`} value={type === 'primary' ? primaryColor : secondaryColor} onChange={(e) => type === 'primary' ? setPrimaryColor(e.target.value) : setSecondaryColor(e.target.value)} className={`w-8 h-8 sm:w-10 sm:h-10 p-0 border-none rounded-lg cursor-pointer ${darkMode ? "bg-gray-700" : "bg-white"}`}/>
                    <input type="text" value={type === 'primary' ? primaryColor : secondaryColor} onChange={(e) => type === 'primary' ? setPrimaryColor(e.target.value) : setSecondaryColor(e.target.value)} className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Text Color Section */}
          <div className={`rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>Button Text Color</h2>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Choose whether text on colored buttons is white or black.</p>
            <div className="flex gap-4">
              {['white', 'black'].map(color => (
                <button key={color} onClick={() => setTextColor(color)} className={`relative p-2 rounded-md border-2 transition-all duration-200 focus:outline-none ${textColor === color ? "ring-2 ring-indigo-500 scale-110 border-transparent" : (darkMode ? "border-gray-600" : "border-gray-300")} ${darkMode ? "bg-gray-700" : "bg-white"} hover:scale-110`}>
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: color, border: color === 'white' ? '1px solid #ccc' : 'none' }}/>
                  {textColor === color && ( <span className="absolute inset-0 flex items-center justify-center"><svg className={`w-5 h-5 ${color === 'white' ? 'text-indigo-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button onClick={handleSaveChanges} disabled={isSaving} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ${isSaving ? "opacity-70 cursor-wait" : "hover:scale-105"}`}>
              {isSaving && (<span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>)}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={resetToDefault} className={`text-sm font-semibold transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}>
              Reset to Default
            </button>
          </div>
        </div>
        
        {/* Live Preview Section */}
        <div className="lg:sticky lg:top-6 lg:self-start w-full">
          <div className={`rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>Live Preview</h2>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>See your changes in real-time.</p>
            <div className={`border rounded-lg overflow-hidden transition-colors duration-300 ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
              <header className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-xl font-semibold" style={{ backgroundColor: primaryColor, color: textColor }}>
                <span>Your Store</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
              </header>
              
              {/* --- HERO SECTION (FIXED) --- */}
              <div className="p-6 sm:p-8 text-center" style={{ backgroundColor: secondaryColor, color: textColor }}>
                  <h2 className="text-2xl font-bold">Welcome to Our Store</h2>
                  <p className="text-sm mt-2 opacity-90">Discover our amazing products</p>
              </div>

              {/* --- PRODUCT SECTION (FIXED) --- */}
              <div className="p-4" style={{ backgroundColor: '#ffffff' }}>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[1, 2].map((item) => (
                    <div key={item} className={`rounded-lg p-2 sm:p-3 shadow-md bg-white`} style={{ border: `1px solid ${secondaryColor}` }}>
                      <div className="aspect-square w-full bg-gray-200 rounded mb-2"></div>
                      <h4 className={`text-sm font-semibold mb-1 text-gray-800`}>Product {item}</h4>
                      <button className="w-full py-1.5 rounded-md font-semibold text-xs" style={{ backgroundColor: secondaryColor, color: textColor }}>
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

