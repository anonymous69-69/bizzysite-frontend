import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    question: "What is BizzySite?",
    answer: "BizzySite is a transaction-based website builder. We provide a free platform for you to build your online store, and we only earn a small commission when you make a sale. Our success is tied to your success."
  },
  {
    question: "Who is it for?",
    answer: "It's designed for small business owners, social media sellers (Instagram, Facebook, TikTok), dropshippers, and anyone who wants a professional, free website to sell their products without the hassle of monthly fees."
  },
  {
    question: "Why should someone use it?",
    answer: "To launch a professional-looking shop in minutes. A dedicated site boosts your sales, provides credibility, and prevents your direct messages from getting cluttered with orders, allowing you to manage everything efficiently."
  },
  {
    question: "How many products can I upload for free?",
    answer: "There is no limit! You can upload as many products as you want with the free plan. We want to give you the freedom to grow your inventory without worrying about extra costs."
  },
  {
    question: "Can I customize my website?",
    answer: "Absolutely. BizzySite offers millions of color options. You can easily customize the colors of your hero section, text, headers, and more to perfectly match your brand's identity."
  },
  {
    question: "How will I know if I get an order?",
    answer: "You'll receive an instant email notification. Plus, all order details—including customer name, address, price, country, and email—are neatly organized and accessible in the 'Orders' tab of your dashboard."
  }
];

// MODIFIED: FaqItem now accepts an 'index' prop for staggered animation
const FaqItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const variants = {
    open: { opacity: 1, height: 'auto', marginTop: '16px' },
    closed: { opacity: 0, height: 0, marginTop: '0px' },
  };

  return (
    // WRAPPED: The entire item in motion.div for the pop-up effect
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }} // Staggered delay
        viewport={{ once: true, amount: 0.3 }} // Trigger when 30% of the item is visible
        className="border-b border-gray-800"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-5 text-left text-lg font-medium text-gray-200 hover:text-indigo-400 transition-colors focus:outline-none"
      >
        <span>{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-400">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  return (
    <section className="relative bg-black py-24 sm:py-32 overflow-hidden">
        {/* Decorative Gradient Blurs (no change) */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
                {/* MODIFIED: Changed h2 to motion.h2 and added scroll animation props */}
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-6"
                >
                    Frequently Asked Questions
                </motion.h2>
                
                {/* MODIFIED: Changed p to motion.p and added scroll animation props */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="text-xl text-gray-400 mb-12"
                >
                    Have questions? We've got answers. If you can't find what you're looking for, feel free to reach out.
                </motion.p>
            </div>
            <div className="space-y-4">
                {/* MODIFIED: Passed 'index' to FaqItem to enable staggered pop-up */}
                {faqData.map((faq, index) => (
                    <FaqItem key={index} question={faq.question} answer={faq.answer} index={index} />
                ))}
            </div>
        </div>
    </section>
  );
};

export default FAQ;