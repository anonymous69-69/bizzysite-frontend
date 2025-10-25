import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, provider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
// You might need to install 'lucide-react' or replace these with your preferred icon components
import { Eye, EyeOff } from 'lucide-react'; 

const AuthModal = ({ isLogin, setIsLogin, onClose, onSuccess, onForgotPasswordClick }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // NEW: Password visibility state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        if (!isLogin && (!name || !email || !password)) {
            setError("Please fill in all fields.");
            return;
        }
        if (!isLogin && password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        
        setIsLoading(true);
        const payload = { email, password, ...(isLogin ? {} : { name }) };
        try {
            const url = `https://bizzysite.onrender.com/api/${isLogin ? "login" : "signup"}`;
            const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await response.json();

            if (!response.ok) { 
                let errorMessage = data.message || "Request failed";
                
                // Enhanced error handling for user feedback
                if (response.status === 401 && isLogin) {
                    errorMessage = "Invalid email or password. Please try again.";
                } else if (response.status === 409 && !isLogin) {
                    // Assuming 409 Conflict for existing account during signup
                    errorMessage = "An account with this email already exists. Please sign in instead.";
                } else if (isLogin && errorMessage.toLowerCase().includes("credentials")) {
                    errorMessage = "Invalid email or password. Please try again.";
                }

                throw new Error(errorMessage); 
            }
            
            const userId = String(data.userId || data._id || "").trim();
            if (!userId) { throw new Error("Invalid user ID received."); }

            localStorage.setItem("userId", userId);
            localStorage.setItem("token", userId);
            localStorage.setItem("userEmail", data.email || "");
            localStorage.setItem("userName", data.name || "");
            localStorage.setItem("userPhone", data.phone || "");
            localStorage.setItem("userRole", data.role || "vendor");

            if (data.adminToken) {
              localStorage.setItem("adminToken", data.adminToken);
            }

            if (!isLogin) {
              try {
                  await fetch("https://bizzysite.onrender.com/api/send-welcome-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, name }),
                  });
              } catch (emailError) {
                  console.error("Post-signup welcome email failed:", emailError);
              }
          }
            onSuccess();
        } catch (err) {
            setError(err.message);
            console.error("Auth error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const res = await fetch("https://bizzysite.onrender.com/api/google-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, name: user.displayName, email: user.email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Google login failed");

            localStorage.setItem("userId", data.userId);
            localStorage.setItem("token", data.userId || "");
            localStorage.setItem("userEmail", data.email || "");
            localStorage.setItem("userName", data.name || "");
            localStorage.setItem("userPhone", data.phone || "");
            localStorage.setItem("userRole", "vendor");
            
            onSuccess();
        } catch (error) {
            console.error("Google sign-in error:", error);
            setError("Google sign-in failed. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={onClose}>
            <motion.div
                initial={{ y: "5%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "5%", opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full mx-auto border border-gray-700 p-8"
                style={{ boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)" }}
                onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
            >
                <h2 className="text-2xl font-bold mb-6 text-white text-center">{isLogin ? "Welcome Back" : "Create Your Account"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10" // Add pr-10 for the icon
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {/* Using placeholder icons, replace with actual imported ones */}
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />} 
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {isLogin && (<div className="text-right"><button type="button" onClick={onForgotPasswordClick} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</button></div>)}
                    <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-lg disabled:bg-indigo-400">{isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}</button>
                    <div className="relative my-4"><hr className="border-gray-700" /><span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-2 bg-gray-900 text-sm text-gray-400">or</span></div>
                    <button type="button" onClick={handleGoogleSignIn} className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 hover:bg-gray-800 transition">
                        <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                            <path d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.1c-6.3 34.1-25.1 62.9-53.5 82.1v68.2h86.4c50.7-46.7 81.5-115.5 81.5-195.1z" fill="#4285F4" />
                            <path d="M272 544.3c72.9 0 134-24.2 178.6-65.8l-86.4-68.2c-24 16-54.5 25.4-92.2 25.4-70.9 0-131-47.9-152.5-112.1H30.8v70.4C74.7 474.7 166.4 544.3 272 544.3z" fill="#34A853" />
                            <path d="M119.5 323.6c-10.2-30.1-10.2-62.6 0-92.7v-70.4H30.8c-42.5 84.6-42.5 183.3 0 267.9l88.7-70.4z" fill="#FBBC05" />
                            <path d="M272 107.1c39.7-.6 77.5 14.6 106.6 41.6l79.4-79.4C406 24.8 345.8 0 272 0 166.4 0 74.7 69.6 30.8 173.3l88.7 70.4C141 155 201.1 107.1 272 107.1z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm font-medium text-white">Continue with Google</span>
                    </button>
                    <div className="mt-6 text-center"><button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}</button></div>
                </form>
            </motion.div>
        </div>
    );
};

export default AuthModal;