// PinnedTestimonialsSection.jsx

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import TestimonialCard from './TestimonialCard';

// Lazily import the Aurora component so it only loads on desktop
const Aurora = lazy(() => import('./Aurora'));

// The reliable hook to check screen size
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event) => {
      setMatches(event.matches);
    };
    mediaQueryList.addEventListener('change', listener);
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};


const PinnedTestimonialsSection = () => {
  const testimonials = [
    { text: "BizzySite helped us launch our online store in just a few minutes. The setup was incredibly simple!", author: "candy crochet", role: "Crochet store" },
    { text: "Our sales increased by 40% after switching to BizzySite. The beautiful storefront really makes a difference.", author: "siya", role: "SiyaCakes" },
    { text: "The support team is amazing and the platform is genuinely free. Highly recommend!", author: "mark", role: "Custom Tees" },
    { text: "A powerful, easy-to-use platform that helped me quit my day job.", author: "diana", role: "Vintage Finds" },
    { text: "Incredibly intuitive and the results are professional. I got my first sale the day I launched.", author: "leo", role: "Art Prints" },
    { text: "Finally, a platform that doesn't nickel and dime you. The 3% commission is fair and transparent.", author: "sara", role: "Handmade Jewelry" },
  ];
  
  const loopedTestimonials = [...testimonials, ...testimonials];
  const shouldReduceMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Fallback for users who prefer reduced motion
  if (shouldReduceMotion) {
    return (
      <div className="bg-gray-900 py-20 px-4">
         <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">Trusted by Thousands</h2>
         <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.slice(0, 4).map(testimonial => (
               <div key={testimonial.author} className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                  <p className="mb-6 text-lg text-gray-300">"{testimonial.text}"</p>
                  <div className="font-semibold text-xl text-white">{testimonial.author}</div>
                  <div className="text-indigo-400">{testimonial.role}</div>
               </div>
            ))}
         </div>
      </div>
    );
  }

  return (
    <section className="relative h-[200vh] bg-gray-900">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* === CONDITIONAL BACKGROUND LOGIC === */}
        {isDesktop ? (
          // On Desktop: Show the animated Aurora
          <Suspense fallback={<div className="absolute inset-0 bg-gray-900" />}>
            <div className="absolute inset-0 z-0">
              <Aurora speed={0.5} colorStops={['#111827', '#4338ca', '#111827']} />
            </div>
          </Suspense>
        ) : (
          // On Mobile: Show the static CSS gradient
          <div 
            className="absolute inset-0 z-0 bg-gray-900"
            style={{
              backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(129, 140, 248, 0.3), transparent)'
            }}
          ></div>
        )}
        
        <div className="relative z-10 flex w-full flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-16 text-center px-4">
              Trusted by Hundreds of Businesses
            </h2>
            <motion.div
              className="flex gap-4"
              animate={{ x: ["0%", "-20%"] }}
              transition={{
                ease: "linear",
                duration: 60,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              {loopedTestimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PinnedTestimonialsSection;