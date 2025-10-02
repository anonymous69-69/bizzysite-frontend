import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Rellax from "rellax";
import Lenis from '@studio-freight/lenis';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Assuming Orb is in src/
import Orb from "../Orb";

// Lazy-loaded components
const Header = lazy(() => import('../components/landing/Header'));
const HeroSection = lazy(() => import('../components/landing/HeroSection'));
const PinnedFeaturesSection = lazy(() => import('../components/landing/PinnedFeaturesSection'));
const PinnedTestimonialsSection = lazy(() => import('../components/landing/PinnedTestimonialsSection'));
const RellaxDemoSection = lazy(() => import('../components/landing/RellaxDemoSection'));
const VideoGrowSection = lazy(() => import('../components/landing/VideoGrowSection'));
const Footer = lazy(() => import('../components/landing/Footer'));
const CustomCursor = lazy(() => import('../components/landing/CustomCursor'));
const AuthModal = lazy(() => import('../components/modals/AuthModal'));
const ForgotPasswordModal = lazy(() => import('../components/modals/ForgotPasswordModal'));

gsap.registerPlugin(ScrollTrigger);

// Fallback component for Suspense
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center bg-black text-white">
    Loading...
  </div>
);

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const rellax = new Rellax('.rellax', { center: true });
    
    return () => {
      rellax.destroy();
      gsap.ticker.remove(lenis.raf);
      lenis.destroy();
    };
  }, []);

  const openLoginModal = () => { setIsLogin(true); setShowModal(true); };
  const openSignUpModal = () => { setIsLogin(false); setShowModal(true); };
  const handleAuthSuccess = () => {
    setShowModal(false);
    setShowForgotPasswordModal(false);
    navigate("/storefront", { state: { fromLogin: true } });
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen bg-black text-white">
        <CustomCursor /> 

        <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-50" style={{ scaleX: scrollYProgress, willChange: 'transform' }} />
        
        <motion.div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden pointer-events-none flex items-center justify-center" style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "55%"]) }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div className="relative w-[70vmin] aspect-square" style={{ scale: useTransform(scrollYProgress, [0, 0.5], [1, 1.3]) }}>
              <Orb hue={2} hoverIntensity={0.6} rotateOnHover={true} forceHoverState={false} />
            </motion.div>
          </div>
        </motion.div>
        
        <Header onLoginClick={openLoginModal} onSignUpClick={openSignUpModal} />
        
        <main>
          <HeroSection onGetStartedClick={openSignUpModal} />
          <PinnedFeaturesSection />
          <PinnedTestimonialsSection />
          <RellaxDemoSection />
          <VideoGrowSection />
        </main>
        
        <Footer onSignUpClick={openSignUpModal} />
        
        <AnimatePresence>
          {showModal && (
            <AuthModal isLogin={isLogin} setIsLogin={setIsLogin} onClose={() => setShowModal(false)} onSuccess={handleAuthSuccess} onForgotPasswordClick={() => {setShowModal(false); setShowForgotPasswordModal(true)}} />
          )}
          {showForgotPasswordModal && (
            <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} onBackToLogin={() => {setShowForgotPasswordModal(false); openLoginModal()}}/>
          )}
        </AnimatePresence>
      </div>
    </Suspense>
  );
}
