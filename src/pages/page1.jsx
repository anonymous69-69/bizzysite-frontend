import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import { Helmet } from "react-helmet-async";

//=================================================================
// Reusable Components (Header, Footer, Cursor)
//=================================================================

const BlogHeader = () => (
  <header className="fixed top-6 left-1/2 -translate-x-1/2 max-w-lg w-full z-30 px-4 sm:px-6 lg:px-8">
    <div className="bg-gray-900/40 backdrop-blur-xl rounded-full border border-gray-700/50 shadow-2xl">
      <div className="flex justify-between items-center h-14 px-6">
        <Link to="/" className="flex items-center">
          <img src="/bizzysitelogo.svg" alt="BizzySite Logo" className="h-8 w-auto"/>
        </Link>
        <nav className="flex gap-4 items-center">
          <Link to="/" className="px-3 py-1.5 text-sm text-gray-300 font-medium hover:text-indigo-400 transition-colors rounded-full">Home</Link>
          <Link to="/#features-section" className="px-3 py-1.5 text-sm text-gray-300 font-medium hover:text-indigo-400 transition-colors rounded-full">Features</Link>
          <Link to="/blog" className="px-3 py-1.5 text-sm text-indigo-400 font-semibold transition-colors rounded-full">Blog</Link>
        </nav>
      </div>
    </div>
  </header>
);

const CustomCursor = () => {
  const cursorRef = useRef(null);
  useEffect(() => {
    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      if (cursorRef.current) {
        let transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
        if (e.target.closest('button, a, [data-cursor-hover]')) {
          transform += ' scale(2.5)';
        }
        cursorRef.current.style.transform = transform;
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);
  return <div ref={cursorRef} className="fixed top-0 left-0 w-3 h-3 bg-indigo-400 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[1000] transition-transform duration-200 ease-out"/>;
};

const Footer = () => {
    // Simplified footer for brevity
    return (
        <footer className="relative z-10 bg-gray-900 text-white border-t border-gray-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} BizzySite. Made with ❤️ for small businesses.</p>
                </div>
            </div>
        </footer>
    );
};

//=================================================================
// Main Article Component
//=================================================================
export default function ShopifyVsBizzySitePage() {

    // Lenis smooth scrolling setup
    useEffect(() => {
        const lenis = new Lenis();
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <Helmet>
              <title>Shopify vs BizzySite 2025 | BizzySite Blog</title>
              <meta
                name="description"
                content="Compare Shopify vs BizzySite for 2025 — pricing, features, speed, and which platform is best for your online store."
              />
              <meta property="og:title" content="Shopify vs BizzySite 2025 | BizzySite Blog" />
              <meta
                property="og:description"
                content="An honest 2025 comparison between Shopify and BizzySite for small businesses and entrepreneurs."
              />
            </Helmet>
            <CustomCursor />
            <BlogHeader />

            <main className="pt-32 pb-16">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Article Header */}
                    <motion.header 
                        initial="hidden"
                        animate="visible"
                        variants={contentVariants}
                        className="text-center mb-12"
                    >
                        <p className="text-indigo-400 font-semibold mb-2">Comparison</p>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                            {/* CHANGE: Added gradient text for excitement */}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                                Shopify vs. BizzySite: Which is Right for You in 2025?
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400">
                            By Alex Johnson &bull; Oct 03, 2025
                        </p>
                    </motion.header>

                    {/* Image */}
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={contentVariants}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <img 
                            // CHANGE: Updated image path to your file named "$0.png" in the public folder
                            src="/$0.png" 
                            alt="Shopify vs BizzySite"
                            className="w-full h-auto object-cover rounded-xl border border-gray-800 shadow-2xl shadow-indigo-500/10"
                        />
                    </motion.div>

                    {/* Article Body */}
                    {/* CHANGE: Removed prose classes from here to apply them directly for more control */}
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={contentVariants}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-gray-300 space-y-6"
                    >
                        <p>
                            Choosing the right platform for your online store is one of the most critical decisions for a new entrepreneur. In one corner, we have Shopify, the undisputed heavyweight champion of e-commerce. In the other, we have BizzySite, a lean, fast, and completely free alternative designed to get small businesses selling in minutes. So, which one should you choose?
                        </p>
                        
                        {/* CHANGE: Exciting new heading */}
                        <h2 className="text-3xl sm:text-4xl font-extrabold pt-6 pb-2 text-indigo-300">
                            1. Price Showdown: The Ultimate Dealbreaker 🥊
                        </h2>
                        <p>
                            This is the most significant difference. Shopify's Basic plan starts at around <strong>$39 per month</strong>, plus transaction fees. This monthly commitment can be a major hurdle when you're just starting out and profits aren't guaranteed.
                        </p>
                        <p>
                            <strong>BizzySite is completely free.</strong> There are no monthly plans, no subscription fees, and no hidden costs. You can build, launch, and manage your store without paying a single rupee. Our model is simple: we only succeed when you do, taking a small 3% commission on sales. This means you can start your business with <strong>zero financial risk.</strong>
                        </p>

                        {/* CHANGE: Exciting new heading */}
                        <h2 className="text-3xl sm:text-4xl font-extrabold pt-6 pb-2 text-indigo-300">
                           2. Creative Freedom: Design & Customization ✨
                        </h2>
                        <p>
                            Shopify is famous for its vast theme store, offering thousands of templates. While this provides endless options, it can also lead to decision fatigue and require technical tweaks to get right. Many of the best themes also come with a hefty price tag.
                        </p>
                        <p>
                            BizzySite takes a different approach. We believe in simplicity and speed. While we don't have thousands of templates, we offer powerful and intuitive customization. You can easily change your website's <strong>colors, fonts, and layout</strong> to perfectly match your brand identity. It's about giving you a beautiful, professional-looking store without the overwhelm.
                        </p>

                        {/* CHANGE: Exciting new heading */}
                        <h2 className="text-3xl sm:text-4xl font-extrabold pt-6 pb-2 text-indigo-300">
                            3. Launch in Minutes: Speed & Simplicity 🚀
                        </h2>
                        <p>
                            Both platforms are user-friendly, but they cater to different needs. Shopify is a feature-rich powerhouse, which can sometimes mean a steeper learning curve for absolute beginners.
                        </p>
                        <p>
                            BizzySite is built for one thing: getting you online and selling, fast. Our "lightning-fast setup wizard" means you can go from sign-up to a fully functional store in just a few minutes. Add your info, upload product photos, set your price, and you're ready to launch. <strong>No technical skills are needed, period.</strong>
                        </p>

                        <h2 className="text-3xl sm:text-4xl font-extrabold pt-6 pb-2 text-indigo-300">The Verdict: Who Should Use Which?</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-2xl font-bold mb-3 text-white">✅ Choose BizzySite if...</h4>
                                <ul className="space-y-2 list-disc list-inside text-gray-400">
                                    <li>You're a new entrepreneur on a tight budget.</li>
                                    <li>You want to launch quickly with zero upfront investment.</li>
                                    <li>You value simplicity and a no-fuss platform.</li>
                                    <li>You want to test a business idea without financial risk.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold mb-3 text-white">🤔 Consider Shopify if...</h4>
                                <ul className="space-y-2 list-disc list-inside text-gray-400">
                                    <li>You're an established business with consistent revenue.</li>
                                    <li>You need highly specific, advanced app integrations.</li>
                                    <li>You have a budget for monthly fees and premium themes.</li>
                                </ul>
                            </div>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-extrabold pt-6 pb-2 text-indigo-300">Conclusion</h2>
                        <p>
                            Shopify is an incredible platform, but its power (and cost) might be overkill for someone just starting. BizzySite offers the <strong>perfect launchpad.</strong> We provide all the essential tools you need to build a beautiful, successful online store, completely free.
                        </p>
                        <p className="text-xl">
                            Ready to build your dream business without the financial burden? 
                            <Link to="/#" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-2"> 
                                Get started with BizzySite today!
                            </Link>
                        </p>
                    </motion.div>

                    <div className="text-center mt-16">
                        <Link 
                            to="/blog"
                            className="inline-block px-6 py-3 bg-gray-800 text-indigo-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            &larr; Back to Blog
                        </Link>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}