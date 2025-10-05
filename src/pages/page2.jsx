import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import { Helmet } from "react-helmet-async";

//=================================================================
// Reusable Components (Copied from page1.jsx for consistency)
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
    // Simplified footer structure to match the usage in page1.jsx
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
// MAIN ARTICLE COMPONENT (SmallBusinessGrowthBlog)
//=================================================================

export default function SmallBusinessGrowthBlog() {

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

    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: 'easeOut' }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <Helmet>
              <title>Small Business Growth Guide | BizzySite Blog</title>
              <meta
                name="description"
                content="The ultimate guide for creative entrepreneurs: strategies for crochet, soap, baking, and boutique stores using low-cost tools like BizzySite."
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
                        <p className="text-indigo-400 font-semibold mb-2">Marketing & Strategy</p>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                                From Social Media to Success: A Complete Growth Guide
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400">
                            Transform your passion into profit with proven strategies for makers, bakers, and boutique owners.
                        </p>
                        <div className="text-sm text-gray-500 mt-2">
                             &bull; Sep 28, 2025
                        </div>
                    </motion.header>

                    {/* Article Body */}
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={sectionVariants}
                        className="text-lg text-gray-300 space-y-6"
                    >
                        <h2 className="text-3xl font-extrabold pt-6 pb-2 text-indigo-300">
                            The Social Commerce Revolution 
                        </h2>
                        <p>
                            In 2025, social media platforms have fully evolved into the ultimate marketplace for creative entrepreneurs. Whether you're crafting organic soaps, baking custom cakes, or curating unique fashion, platforms like Instagram and TikTok offer unprecedented opportunities to turn your hobby into a thriving business.
                        </p>
                        <p>
                            With over 51% of global consumers discovering new brands through social media, the potential for growth is immense. This guide breaks down the specific strategies you need to scale your handmade business from a passionate side-hustle to a profitable enterprise.
                        </p>

                        <h2 className="text-3xl font-extrabold pt-6 pb-2 text-indigo-300">
                            Industry-Specific Growth Strategies
                        </h2>
                        
                        {/* Crochet Business */}
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                            <h3 className="text-xl font-semibold text-pink-400 mb-4">🧶 Crochet Sellers: Investment & Tactics</h3>
                            <p className="text-sm text-gray-400"><strong>Startup Investment:</strong> $300 - $800</p>
                            <ul className="list-disc list-inside ml-4 space-y-2 text-sm text-gray-300 mt-3">
                                <li>Create engaging "process videos" (Reels/TikTok) to show your work.</li>
                                <li>Generate passive income by offering **digital patterns** alongside finished products.</li>
                            </ul>
                        </div>

                        {/* Soap Business */}
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                            <h3 className="text-xl font-semibold text-green-400 mb-4">🧼 Soap Makers: Investment & Tactics</h3>
                            <p className="text-sm text-gray-400"><strong>Startup Investment:</strong> $500 - $1,200</p>
                            <ul className="list-disc list-inside ml-4 space-y-2 text-sm text-gray-300 mt-3">
                                <li>Increase order value by creating matching **crocheted soap saver bags**.</li>
                                <li>Focus on ingredient sourcing stories and use Instagram for behind-the-scenes content.</li>
                            </ul>
                        </div>

                        {/* Cake Business */}
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                            <h3 className="text-xl font-semibold text-yellow-400 mb-4">🎂 Cake Bakers: Investment & Tactics</h3>
                            <p className="text-sm text-gray-400"><strong>Startup Investment:</strong> $800 - $1,500</p>
                            <ul className="list-disc list-inside ml-4 space-y-2 text-sm text-gray-300 mt-3">
                                <li>Showcase dramatic before/after cake transformations on Instagram.</li>
                                <li>Offer decorating classes and workshops to build local community and revenue.</li>
                            </ul>
                        </div>
                        
                        {/* The rest of the content will continue below in similar styled blocks... */}
                    </motion.div>

                    {/* Website Benefits Section (New motion block for content flow) */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={sectionVariants}
                        className="mt-16 bg-gray-900/70 rounded-xl p-8 border border-gray-700 space-y-6"
                    >
                        <h2 className="text-3xl font-extrabold pb-2 text-white">
                            Why You Need a Professional Website (Beyond Social Media)
                        </h2>
                        <p className="text-gray-300">
                            Social media is for discovery, but a website is for ownership. A professional website offers 
                            **complete brand control, enhanced credibility**, and crucial customer analytics that are essential 
                            for long-term scaling.
                        </p>

                        {/* BizzySite Section - Themed to match page1.jsx CTAs */}
                        <div className="bg-gray-900 rounded-lg p-6 border-l-4 border-indigo-500 shadow-xl">
                            <h3 className="text-2xl font-semibold text-white mb-4">💡 Launch Risk-Free with BizzySite</h3>
                            <p className="text-gray-300 mb-4">
                                BizzySite is built specifically for new entrepreneurs. We eliminate the single biggest barrier to entry: **monthly fees.**
                            </p>
                            
                            <div className="bg-gray-800 rounded-lg p-4">
                                <ul className="space-y-2 text-gray-300 text-sm">
                                    <li>• **The BizzySite Difference:** You pay absolutely $0 per month.</li>
                                    <li>• **Growth-Aligned Costs:** We only earn a **5% transaction fee** when you make a sale.</li>
                                    <li>• **Unlimited Potential:** Launch instantly with full customization and unlimited product listings.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Action Plan Section (New motion block) */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={sectionVariants}
                        className="mt-16 space-y-6 text-gray-300"
                    >
                        <h2 className="text-3xl font-extrabold pb-2 text-indigo-300">
                            Your 30-Day Growth Action Plan
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-800 rounded-xl border border-gray-700/50">
                                <h4 className="font-semibold text-white">Week 1: Foundation</h4>
                                <p className="text-gray-400 text-sm">Optimize all social profiles and create your content calendar.</p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-xl border border-gray-700/50">
                                <h4 className="font-semibold text-white">Week 2: Content</h4>
                                <p className="text-gray-400 text-sm">Shoot product photos and engaging process videos.</p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-xl border border-gray-700/50">
                                <h4 className="font-semibold text-white">Week 3: Launch</h4>
                                <p className="text-gray-400 text-sm">Set up your free BizzySite, list products, and integrate social links.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Conclusion (New motion block) */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={sectionVariants}
                        className="text-center mt-16 p-10 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl shadow-2xl"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-white">Take The Next Step Today</h2>
                        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-6">
                            Your journey from maker to thriving entrepreneur starts now. Combine these proven strategies with a risk-free platform like BizzySite.
                        </p>
                        <Link 
                            to="/" // Link back to the sign-up page (root /)
                            className="inline-block px-8 py-4 bg-white text-indigo-700 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                        > 
                            Start Your Free BizzySite Store &rarr;
                        </Link>
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