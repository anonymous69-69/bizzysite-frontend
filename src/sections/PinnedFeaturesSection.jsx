import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const PinnedFeaturesSection = () => {
  const features = [
    { title: "Lightning Fast Setup", desc: "Launch your store in minutes with our intuitive setup wizard.", icon: "🚀" },
    { title: "Everything for free", desc: "Absolutely free for all users with no hidden platform fees.", icon: "💳" },
    { title: "Global Payments", desc: "Accept credit cards and other popular payment methods.", icon: "🌍" },
  ];
  
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundColor = useTransform(scrollYProgress, [0, 1], ["#111827", "#3730a3"]);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32">
      <motion.div 
        style={{ backgroundColor }} 
        className="absolute inset-0 -z-10" 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 
          className="rellax text-3xl sm:text-4xl font-bold text-white mb-4"
          data-rellax-speed="1"
        >
          Everything You Need to Succeed Online
        </h2>
        <p className="text-xl text-gray-400">
          Powerful features designed to help your business grow
        </p>

        <div className="mt-16 flex flex-col md:flex-row items-start justify-center gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="rellax w-full md:w-1/3 bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 text-center"
              data-rellax-speed={index + 2}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PinnedFeaturesSection;
