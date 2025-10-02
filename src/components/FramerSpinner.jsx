
import { motion } from 'framer-motion';

const FramerSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <motion.div
        style={{
          width: 40,
          height: 40,
          border: '4px solid rgba(255, 255, 255, 0.2)',
          borderTop: '4px solid #6366f1', // Indigo color
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{
          loop: Infinity,
          ease: "linear",
          duration: 1,
        }}
      />
    </div>
  );
};

export default FramerSpinner;