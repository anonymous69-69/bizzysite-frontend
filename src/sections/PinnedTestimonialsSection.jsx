import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const usePinnedAnimation = (numItems) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const activeIndex = useTransform(scrollYProgress, [0, 1], [0, numItems]);
  return { targetRef, activeIndex, scrollYProgress };
};

const HangingShape = ({ scrollYProgress, className, shapeClassName, speed = 1 }) => {
    const y = useTransform(scrollYProgress, [0, 1], ['0%', `${-200 * speed}%`]);

    return (
        <motion.div style={{ y }} className={`absolute ${className}`}>
            <div className="mx-auto h-96 w-px bg-gray-500/50" />
            <div className={`mx-auto ${shapeClassName}`} />
        </motion.div>
    );
};

const TestimonialCard = ({ index, text, author, role, activeIndex }) => {
  const opacity = useTransform(activeIndex, [index - 0.5, index, index + 0.5], [0, 1, 0]);
  const x = useTransform(activeIndex, [index - 0.5, index, index + 0.5], ["25%", "0%", "-25%"]);
  return (
    <motion.div style={{ opacity, x, willChange: 'transform, opacity' }} className="absolute inset-0 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md text-center">
        <div className="text-4xl mb-4 text-indigo-400">“</div>
        <p className="mb-6 text-lg text-gray-300">{text}</p>
        <div className="font-semibold text-xl text-white">{author}</div>
        <div className="text-indigo-400">{role}</div>
      </div>
    </motion.div>
  );
};

const PinnedTestimonialsSection = () => {
  const testimonials = [
    { text: "BizzySite helped us launch our online store in just a few minutes. The setup was incredibly simple!", author: "candy crochet", role: "Crochet store" },
    { text: "Our sales increased by 40% after switching to BizzySite. The beautiful storefront really makes a difference.", author: "siya", role: "SiyaCakes" },
  ];
  const { targetRef, activeIndex, scrollYProgress } = usePinnedAnimation(testimonials.length);
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 py-20 px-4">
         <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">Trusted by Thousands</h2>
         <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map(testimonial => (
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
    <div ref={targetRef} className="relative h-[400vh] bg-gradient-to-br from-indigo-700 to-purple-800">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-white px-4 overflow-hidden">
        <HangingShape scrollYProgress={scrollYProgress} speed={0.7} className="top-0 left-[10%] w-40 z-0" shapeClassName="h-48 w-48 bg-purple-500/20 rounded-full blur-sm" />
        <HangingShape scrollYProgress={scrollYProgress} speed={0.8} className="top-0 right-[10%] w-40 z-0" shapeClassName="h-40 w-40 bg-indigo-500/20 rounded-2xl blur-sm" />
        <HangingShape scrollYProgress={scrollYProgress} speed={0.9} className="top-0 left-[25%] w-40 z-10" shapeClassName="h-24 w-24 bg-purple-400/40 rounded-lg" />
        <HangingShape scrollYProgress={scrollYProgress} speed={1.1} className="top-0 right-[25%] w-40 z-10" shapeClassName="h-28 w-28 bg-indigo-400/40 rounded-full" />
        <HangingShape scrollYProgress={scrollYProgress} speed={1.5} className="top-0 left-[40%] w-24 z-20" shapeClassName="h-10 w-10 bg-indigo-400 rounded-lg" />
        <HangingShape scrollYProgress={scrollYProgress} speed={1.8} className="top-0 right-[40%] w-24 z-20" shapeClassName="h-8 w-8 bg-purple-400 rounded-full" />
        <HangingShape scrollYProgress={scrollYProgress} speed={1.6} className="top-0 left-[55%] w-16 z-20" shapeClassName="h-8 w-8 bg-purple-400/80 rounded-full" />
        <HangingShape scrollYProgress={scrollYProgress} speed={1.7} className="top-0 right-[55%] w-16 z-20" shapeClassName="h-6 w-6 bg-indigo-400/80 rounded-lg" />
        
        <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center relative z-10">Trusted by Thousands of Businesses</h2>
        <div className="relative w-full max-w-2xl h-72 z-10">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} index={index} {...testimonial} activeIndex={activeIndex} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinnedTestimonialsSection;