// src/PublicLayout.jsx (NEW FILE)

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// We assume you have split these into their own component files
import Header from './components/Header';
import Footer from './sections/Footer'; // Or wherever you placed it
import Orb from './Orb';
import AuthModal from './components/AuthModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';

export default function PublicLayout() {
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
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-50" 
        style={{ scaleX: scrollYProgress, willChange: 'transform' }} 
      />
      
      {/* Background Orb Effect */}
      <motion.div 
        className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden pointer-events-none flex items-center justify-center" 
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "50%"]) }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="relative w-[70vmin] aspect-square" 
            style={{ scale: useTransform(scrollYProgress, [0, 0.5], [1, 1.3]) }}
          >
            <Orb hue={2} />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Shared Header */}
      <Header onLoginClick={openLoginModal} onSignUpClick={openSignUpModal} />

      <main>
        {/* This is where the specific page content (e.g., SignupPage) will be rendered */}
        <Outlet />
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Modals are managed by the layout since the Header triggers them */}
      <AnimatePresence>
        {showModal && (
          <AuthModal 
            isLogin={isLogin} 
            setIsLogin={setIsLogin} 
            onClose={() => setShowModal(false)} 
            onSuccess={handleAuthSuccess} 
            onForgotPasswordClick={() => {
              setShowModal(false);
              setShowForgotPasswordModal(true);
            }} 
          />
        )}
        {showForgotPasswordModal && (
          <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}