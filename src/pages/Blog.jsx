import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom"; // Use Link for navigation
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

// Import Lenis for smooth scrolling, same as the signup page
import Lenis from '@studio-freight/lenis';

//=================================================================
// MOCK DATA: Blog Posts
//=================================================================


const blogPosts = [


    {
        id: 7, // New post
        slug: "shopify-vs-bizzysite", // This will be the URL slug
        category: "Comparison",
        title: "Shopify vs. BizzySite: Which is Right for You in 2025?",
        excerpt: "Shopify's $40/mo plan vs. BizzySite's free-forever model. We break down the key differences in cost, customization, and features to help you choose.",
        imageUrl: "/$0.png ", // Replace with actual image URL
        author: "Alex Johnson",
        date: "Oct 03, 2025",
    },
  
];


//=================================================================
// SUB-COMPONENT: Blog Header
//=================================================================
const BlogHeader = () => {
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 max-w-lg w-full z-30 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-900/40 backdrop-blur-xl rounded-full border border-gray-700/50 shadow-2xl">
        <div className="flex justify-between items-center h-14 px-6">
          <Link to="/" className="flex items-center">
            <img src="/bizzysitelogo.svg" alt="BizzySite Logo" className="h-8 w-auto"/>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link to="/" className="px-3 py-1.5 text-sm text-gray-300 font-medium hover:text-indigo-400 transition-colors rounded-full">Home</Link>
            {/* Assuming your features section is on the homepage */}
            <Link to="/#features-section" className="px-3 py-1.5 text-sm text-gray-300 font-medium hover:text-indigo-400 transition-colors rounded-full">Features</Link>
            <Link to="/blog" className="px-3 py-1.5 text-sm text-indigo-400 font-semibold transition-colors rounded-full">Blog</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

//=================================================================
// SUB-COMPONENT: Blog Hero Section
//=================================================================
const BlogHero = () => {
    return (
        <div className="relative z-10 pt-40 pb-20 px-4 sm:px-6 lg:px-8 text-center">
             <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 leading-tight">
                    From the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">BizzySite</span> Blog
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-gray-400">
                    Insights, tutorials, and inspiration for entrepreneurs and small business owners.
                </p>
            </motion.div>
        </div>
    );
};


//=================================================================
// SUB-COMPONENT: Blog Post Card
//=================================================================
const BlogPostCard = ({ post, variants }) => {
    return (
        <motion.div variants={variants}>
            <Link to={`/blog/${post.slug}`} className="block group">
                <div className="overflow-hidden rounded-xl border border-gray-800">
                    <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                </div>
                <div className="p-4">
                    <p className="text-sm font-medium text-indigo-400 mb-1">{post.category}</p>
                    <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">{post.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{post.excerpt}</p>
                    <div className="text-xs text-gray-500">
                        <span>By {post.author}</span> &bull; <span>{post.date}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};


//=================================================================
// SUB-COMPONENT: Custom Cursor (Copied from your signup.jsx)
//=================================================================
const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      const target = e.target;
      
      if (cursorRef.current) {
        let transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
        if (target.closest('button, a, [data-cursor-hover]')) {
          transform += ' scale(2.5)';
        }
        cursorRef.current.style.transform = transform;
      }
    };
    
    window.addEventListener("mousemove", onMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-3 h-3 bg-indigo-400 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[1000] transition-transform duration-200 ease-out"
    />
  );
};


//=================================================================
// SUB-COMPONENT: Footer (Copied from your signup.jsx)
//=================================================================
const Footer = () => {
    const footerRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (footerRef.current) {
                const rect = footerRef.current.getBoundingClientRect();
                setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const staggerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
        })
    };

    return (
        <footer 
            ref={footerRef}
            className="relative z-10 overflow-hidden bg-gray-900 text-white border-t border-gray-800"
            style={{ '--mouse-x': `${mousePosition.x}px`, '--mouse-y': `${mousePosition.y}px` }}
        >
            <div 
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{ background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(129, 140, 248, 0.1), transparent 80%)` }}
            />
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     <motion.div custom={0} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                        <h3 className="text-xl font-bold mb-4">BizzySite</h3>
                        <p className="text-gray-400 text-sm">Empowering small businesses to succeed online.</p>
                    </motion.div>
                    <motion.div custom={1} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                         <h4 className="text-lg font-semibold mb-4">Product</h4>
                         <ul className="space-y-3 text-gray-400">
                             <li><a href="/#features-section" className="hover:text-indigo-400 transition-colors" data-cursor-hover>Features</a></li>
                             <li><Link to="/blog" className="hover:text-indigo-400 transition-colors" data-cursor-hover>Blog</Link></li>
                         </ul>
                    </motion.div>
                    <motion.div custom={2} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                        <h4 className="text-lg font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="mailto:your-store@bizzysite.shop" className="hover:text-indigo-400 transition-colors" data-cursor-hover>your-store@bizzysite.shop</a></li>
                        </ul>
                    </motion.div>
                    <motion.div custom={3} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                         <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                         <div className="flex space-x-4">
                            <a href="https://x.com/BizzySiteShop" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors" data-cursor-hover>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                            </a>
                            <a href="https://www.instagram.com/bizzysite.app/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors" data-cursor-hover>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 2a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" /></svg>
                            </a>
                         </div>
                    </motion.div>
                </div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm"
                >
                    <p>© {new Date().getFullYear()} BizzySite. Made with ❤️ for small businesses.</p>
                </motion.div>
            </div>
        </footer>
    );
};

//=================================================================
// MAIN BLOG PAGE COMPONENT
//=================================================================
export default function BlogPage() {
    

    // Lenis smooth scrolling setup
    useEffect(() => {
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
    
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
    
        requestAnimationFrame(raf);
    
        return () => {
          lenis.destroy();
        };
      }, []);

    // Animation variants for staggering the blog post cards
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.5, ease: 'easeOut' }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <Helmet>
              <title>BizzySite Blog — Insights for Entrepreneurs & Small Businesses</title>
              <meta
                name="description"
                content="Read the latest articles from the BizzySite Blog. Learn about online business, website building, marketing, and comparisons like Shopify vs BizzySite."
              />
              <meta property="og:title" content="BizzySite Blog — Insights for Entrepreneurs & Small Businesses" />
              <meta
                property="og:description"
                content="Discover tips, tutorials, and comparisons for growing your online business with BizzySite."
              />
            </Helmet>
            <CustomCursor />
            <BlogHeader />

            <main>
                <BlogHero />

                {/* Blog Posts Grid */}
                <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {blogPosts.map(post => (
                                <BlogPostCard key={post.id} post={post} variants={itemVariants} />
                            ))}
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}