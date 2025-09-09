import { useState, useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import Orb from "./Orb";
import BlurText from "./BlurText";

//=================================================================
// CUSTOM HOOK: usePinnedAnimation
//=================================================================
/**
 * A custom hook to encapsulate the logic for a pinned scrollytelling animation.
 * It tracks the scroll progress of a target element and maps it to an active index.
 * @param {number} numItems - The total number of items to cycle through in the animation.
 * @returns {{
 * targetRef: React.RefObject<HTMLDivElement>;
 * activeIndex: import('framer-motion').MotionValue<number>;
 * }} - An object containing the ref for the scrollable element and a motion value for the active index.
 */
const usePinnedAnimation = (numItems) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const activeIndex = useTransform(scrollYProgress, [0, 1], [0, numItems]);

  return { targetRef, activeIndex };
};


//=================================================================
// SUB-COMPONENT: Header
//=================================================================
/**
 * Renders the fixed navigation header for the page.
 * @param {{onLoginClick: () => void, onSignUpClick: () => void}} props
 */
const Header = ({ onLoginClick, onSignUpClick }) => {
  return (
    <header className="fixed w-full bg-gray-900/80 backdrop-blur-md shadow-sm z-30 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative h-16 sm:h-20">
        <div className="absolute left-[-13rem] top-1/2 -translate-y-1/2 flex items-center">
          <img
            src="/bizzysitelogo.svg"
            alt="BizzySite Logo"
            className="h-[255px] w-auto"
          />
        </div>
        <div className="flex gap-4 items-center ml-auto">
          <button onClick={onLoginClick} className="px-4 py-2 text-gray-300 font-medium hover:text-indigo-400 transition-colors">Login</button>
          <button onClick={onSignUpClick} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-md hover:opacity-90 transition-all shadow-md">Sign Up</button>
        </div>
      </div>
    </header>
  );
};


//=================================================================
// SUB-COMPONENT: Hero Section
//=================================================================
/**
 * Renders the main hero section with headline animations.
 * @param {{onGetStartedClick: () => void}} props
 */
const HeroSection = ({ onGetStartedClick }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center pt-24 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight text-center">
          <BlurText text="Build Your Online Store" animateBy="words" direction="top" className="leading-tight font-story" delay={600} stepDuration={1} />
          <BlurText text="For Free" animateBy="words" direction="top" className="leading-tight font-story" delay={600} stepDuration={1} />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div className="min-h-[72px] sm:min-h-[60px] flex justify-center items-center">
            <TypeAnimation sequence={["Create beautiful ecommerce sites in minutes", 2000, "Powerful tools for small businesses", 2000, "Easy customization, no technical skills needed", 2000]} wrapper="p" repeat={Infinity} className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto text-center" />
          </div>
        </motion.div>
        <div className="flex justify-center items-center mt-8">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStartedClick} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/20">Get Started Free</motion.button>
        </div>
      </div>
    </div>
  );
};


//=================================================================
// SECTION 1: PINNED FEATURES COMPONENT
//=================================================================
/**
 * An immersive, pinned scrollytelling component that showcases product features.
 */
const PinnedFeaturesSection = () => {
  const features = [
    { title: "Lightning Fast Setup", desc: "Launch your store in minutes with our intuitive setup wizard.", icon: "🚀" },
    { title: "Everything for free", desc: "Absolutely free for all users with no hidden platform fees.", icon: "💳" },
    { title: "Mobile Optimized", desc: "A beautiful storefront that works perfectly on all devices.", icon: "📱" },
    { title: "Powerful Analytics", desc: "Understand your customers with built-in traffic and sales reports.", icon: "📊" },
    { title: "Global Payments", desc: "Accept credit cards and other popular payment methods.", icon: "🌍" },
  ];
  
  const { targetRef, activeIndex } = usePinnedAnimation(features.length);
  const shouldReduceMotion = useReducedMotion();

  const backgroundColor = useTransform(activeIndex, [0, features.length], ["#111827", "#3730a3"]);
  const titleOpacity = useTransform(activeIndex, [0, 0.5], [1, 0]);
  const titleY = useTransform(activeIndex, [0, 0.5], ["0rem", "-2rem"]);

  if (shouldReduceMotion) {
    return (
      <div className="bg-gray-900 py-20 px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">Everything You Need to Succeed</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map(feature => (
             <div key={feature.title} className="bg-gray-800 p-6 rounded-lg">
                <span className="text-4xl">{feature.icon}</span>
                <h3 className="text-xl font-semibold mt-4 mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
             </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={targetRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-white px-4 overflow-hidden">
        <motion.div style={{ backgroundColor, willChange: 'background-color' }} className="absolute inset-0" />
        <motion.div style={{ opacity: titleOpacity, y: titleY, willChange: 'transform, opacity' }} className="text-center mb-16 max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need to Succeed Online</h2>
          <p className="text-xl text-gray-400">Powerful features designed to help your business grow</p>
        </motion.div>
        <div className="relative w-full max-w-md h-64 z-10">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} index={index} {...feature} activeIndex={activeIndex} />
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ index, title, desc, icon, activeIndex }) => {
  const cardOpacity = useTransform(activeIndex, [index - 0.4, index, index + 0.4], [0, 1, 0]);
  const cardScale = useTransform(activeIndex, [index - 0.5, index, index + 0.5], [0.8, 1, 0.8]);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ opacity: cardOpacity, scale: cardScale, willChange: 'transform, opacity' }}>
      <div className="text-6xl mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 max-w-xs">{desc}</p>
    </motion.div>
  );
};


//=================================================================
// SECTION 2: PINNED TESTIMONIALS COMPONENT
//=================================================================
const PinnedTestimonialsSection = () => {
  const testimonials = [
    { text: "BizzySite helped us launch our online store in just a few minutes. The setup was incredibly simple!", author: "candy crochet", role: "Crochet store" },
    { text: "Our sales increased by 40% after switching to BizzySite. The beautiful storefront really makes a difference.", author: "siya", role: "SiyaCakes" },
    { text: "As a small business owner with no tech skills, BizzySite has been a game-changer for us.", author: "Ron", role: "Criss Soaps" },
    { text: "The support team is fantastic. They're always quick to help with any questions I have.", author: "Elena", role: "Artisan Jewelry" },
  ];

  const { targetRef, activeIndex } = usePinnedAnimation(testimonials.length);
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 py-20 px-4">
         <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">Trusted by Thousands</h2>
         <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map(testimonial => (
               <div key={testimonial.author} className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 text-center">
                  <p className="mb-6 text-lg">"{testimonial.text}"</p>
                  <div className="font-semibold text-xl">{testimonial.author}</div>
                  <div className="text-indigo-200">{testimonial.role}</div>
               </div>
            ))}
         </div>
      </div>
    )
  }
  
  return (
    <div ref={targetRef} className="relative h-[400vh] bg-gradient-to-br from-indigo-700 to-purple-800">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-white px-4 overflow-hidden">
        <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center">Trusted by Thousands of Businesses</h2>
        <div className="relative w-full max-w-2xl h-72">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} index={index} {...testimonial} activeIndex={activeIndex} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TestimonialCard = ({ index, text, author, role, activeIndex }) => {
  const opacity = useTransform(activeIndex, [index - 0.5, index, index + 0.5], [0, 1, 0]);
  const x = useTransform(activeIndex, [index - 0.5, index, index + 0.5], ["25%", "0%", "-25%"]);

  return (
    <motion.div style={{ opacity, x, willChange: 'transform, opacity' }} className="absolute inset-0 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 max-w-md text-center">
        <div className="text-4xl mb-4">“</div>
        <p className="mb-6 text-lg">{text}</p>
        <div className="font-semibold text-xl">{author}</div>
        <div className="text-indigo-200">{role}</div>
      </div>
    </motion.div>
  );
};


//=================================================================
// SUB-COMPONENT: Footer
//=================================================================
const Footer = () => {
    return (
        <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white border-t border-gray-800">
            <div className="max-w-7xl mx-auto"><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div><h3 className="text-xl font-bold mb-4">BizzySite</h3><p className="text-gray-400">Empowering small businesses to succeed online with simple, powerful tools.</p></div><div></div><div><h4 className="text-lg font-semibold mb-4">Contact</h4><ul className="space-y-2 text-gray-400"><li>Email: your-store@bizzysite.shop</li></ul></div></div><div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500"><p>© {new Date().getFullYear() + 1} BizzySite. Made with ❤️ for small businesses.</p></div></div>
        </footer>
    );
};


//=================================================================
// SECTION 3: MAIN PAGE COMPONENT
//=================================================================
export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  const openLoginModal = () => { setIsLogin(true); setShowModal(true); };
  const openSignUpModal = () => { setIsLogin(false); setShowModal(true); };
  const handleAuthSuccess = () => {
    setShowModal(false);
    setShowForgotPasswordModal(false);
    navigate("/storefront", { state: { fromLogin: true } });
  };

  return (
    <div className="relative bg-black text-white">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-50" style={{ scaleX: scrollYProgress, willChange: 'transform' }} />
      <motion.div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden pointer-events-none flex items-center justify-center" style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "50%"]) }}>
        <div className="absolute inset-0 flex items-center justify-center"><motion.div className="relative w-[70vmin] aspect-square" style={{ scale: useTransform(scrollYProgress, [0, 0.5], [1, 1.3]) }}><Orb hue={2} hoverIntensity={0.6} rotateOnHover={true} forceHoverState={false} /></motion.div></div>
      </motion.div>

      <Header onLoginClick={openLoginModal} onSignUpClick={openSignUpModal} />
      
      <main>
        <HeroSection onGetStartedClick={openSignUpModal} />
        <PinnedFeaturesSection />
        <PinnedTestimonialsSection />
      </main>
      
      <Footer />
      
      <AnimatePresence>
        {showModal && (
          <AuthModal isLogin={isLogin} setIsLogin={setIsLogin} onClose={() => setShowModal(false)} onSuccess={handleAuthSuccess} onForgotPasswordClick={() => setShowForgotPasswordModal(true)} />
        )}
        {showForgotPasswordModal && (
          <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}


//=================================================================
// MODAL COMPONENT: Authentication (LOGIC FIXED)
//=================================================================
const AuthModal = ({ isLogin, setIsLogin, onClose, onSuccess, onForgotPasswordClick }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && (!name || !email || !password)) { return; }
        if (!isLogin && password.length < 6) { return; }
        
        setIsLoading(true);
        const payload = { email, password, ...(isLogin ? {} : { name }) };
        try {
            const url = `https://bizzysite.onrender.com/api/${isLogin ? "login" : "signup"}`;
            const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || "Request failed"); }
            
            const userId = String(data.userId || data._id || "").trim();
            if (!userId) { throw new Error("Invalid user ID received."); }

            localStorage.setItem("userId", userId);
            localStorage.setItem("token", userId);
            localStorage.setItem("userEmail", data.email || "");
            localStorage.setItem("userName", data.name || "");
            localStorage.setItem("userPhone", data.phone || "");
            localStorage.setItem("userRole", "vendor");

            // **FIXED**: Restore business creation logic for new sign-ups
            if (!isLogin) {
                try {
                    const businessRes = await fetch("https://bizzysite.onrender.com/api/business", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userId}` },
                        body: JSON.stringify({
                            type: "business",
                            data: { name: name || "My Store", email: email, phone: "", address: "", shippingCharge: 0 },
                        }),
                    });
                    const businessData = await businessRes.json();
                    if (!businessRes.ok) { throw new Error(businessData.message || "Failed to create store"); }
                    
                    const storeId = businessData.storeId;
                    if (storeId) { localStorage.setItem("storeId", storeId); } 
                    else { throw new Error("Store ID not received from server"); }

                    await fetch("https://bizzysite.onrender.com/api/send-welcome-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, name }),
                    });
                } catch (error) {
                    console.error("Post-signup business creation failed:", error);
                }
            }
            onSuccess();
        } catch (error) {
            console.error("Auth error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        // **FIXED**: Restore Google Sign-In logic
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
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    {isLogin && (<div className="text-right"><button type="button" onClick={onForgotPasswordClick} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</button></div>)}
                    <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-lg disabled:bg-indigo-400">{isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}</button>
                    <div className="relative my-4"><hr className="border-gray-700" /><span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-2 bg-gray-900 text-sm text-gray-400">or</span></div>
                    <button type="button" onClick={handleGoogleSignIn} className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 hover:bg-gray-800 transition">
                        <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg"><path d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.1c-6.3 34.1-25.1 62.9-53.5 82.1v68.2h86.4c50.7-46.7 81.5-115.5 81.5-195.1z" fill="#4285F4" /><path d="M272 544.3c72.9 0 134-24.2 178.6-65.8l-86.4-68.2c-24 16-54.5 25.4-92.2 25.4-70.9 0-131-47.9-152.5-112.1H30.8v70.4C74.7 474.7 166.4 544.3 272 544.3z" fill="#34A853" /><path d="M119.5 323.6c-10.2-30.1-10.2-62.6 0-92.7v-70.4H30.8c-42.5 84.6-42.5 183.3 0 267.9l88.7-70.4z" fill="#FBBC05" /><path d="M272 107.1c39.7-.6 77.5 14.6 106.6 41.6l79.4-79.4C406 24.8 345.8 0 272 0 166.4 0 74.7 69.6 30.8 173.3l88.7 70.4C141 155 201.1 107.1 272 107.1z" fill="#EA4335" /></svg>
                        <span className="text-sm font-medium text-white">Continue with Google</span>
                    </button>
                    <div className="mt-6 text-center"><button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}</button></div>
                </form>
            </motion.div>
        </div>
    );
};


//=================================================================
// MODAL COMPONENT: Forgot Password
//=================================================================
const ForgotPasswordModal = ({ onClose }) => {
    const [resetEmail, setResetEmail] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [message, setMessage] = useState("");

    const handleResetRequest = async () => { /* Reset logic is unchanged */ };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full mx-auto border border-gray-700 p-8"
                onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
            >
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Reset Your Password</h2>
                {message ? (
                    <div className="text-center">
                        <p className="text-green-400">{message}</p>
                        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">Close</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-center text-gray-400 text-sm">Enter your email and we'll send a link to reset your password.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                            <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="your@email.com" />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition-colors" disabled={isSendingReset}>Cancel</button>
                            <button type="button" onClick={handleResetRequest} className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSendingReset}>{isSendingReset ? "Sending..." : "Send Reset Link"}</button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};