import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import BlurText from "../BlurText"; // Adjusted path

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

export default HeroSection;