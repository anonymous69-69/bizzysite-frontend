// src/SignupPage.jsx (Previously signup.jsx, now refactored)

import { Suspense, lazy, useEffect } from "react";
import Rellax from "rellax";

// --- Sections to be rendered on this page ---
// Hero is above the fold, so we import it directly
import HeroSection from './sections/HeroSection';

// Lazy load the sections that are below the fold for faster initial load
const PinnedFeaturesSection = lazy(() => import('./sections/PinnedFeaturesSection'));
const PinnedTestimonialsSection = lazy(() => import('./sections/PinnedTestimonialsSection'));
const RellaxDemoSection = lazy(() => import('./sections/RellaxDemoSection'));

// A simple loading component for Suspense
const SectionLoader = () => <div className="h-screen w-full flex items-center justify-center"><p>Loading Section...</p></div>;

export default function SignupPage() {
  // Initialize Rellax for parallax effects
  useEffect(() => {
    // FIX: Store the instance in a variable
    const rellaxInstance = new Rellax('.rellax', {
      center: true,
    });
    
    // FIX: The cleanup function now checks if the instance exists before destroying it
    return () => {
      if (rellaxInstance) {
        rellaxInstance.destroy();
      }
    };
  }, []);

  return (

    <>
      {/* This component is now just the content of the landing page */}
      <HeroSection onGetStartedClick={() => { /* This will be handled by the Header in the layout */ }} />
      
      <Suspense fallback={<SectionLoader />}>
        <PinnedFeaturesSection />
        <PinnedTestimonialsSection />
        <RellaxDemoSection />
      </Suspense>
    </>
  );
}