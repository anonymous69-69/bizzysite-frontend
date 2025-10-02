import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Footer = ({ onSignUpClick }) => {
    const footerRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (footerRef.current) {
                const rect = footerRef.current.getBoundingClientRect();
                setMousePosition({ 
                    x: e.clientX - rect.left, 
                    y: e.clientY - rect.top 
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const staggerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <footer 
            ref={footerRef}
            className="relative z-10 overflow-hidden bg-gray-900 text-white border-t border-gray-800"
            style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`,
            }}
        >
            <div 
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(129, 140, 248, 0.1), transparent 80%)`,
                }}
            />

            <div className="relative border-b border-gray-800 py-20 px-4 sm:px-6 lg:px-8 text-center">
                 <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400"
                >
                    Ready to Start Selling?
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="max-w-2xl mx-auto text-lg text-gray-400 mb-8"
                >
                    Join thousands of entrepreneurs and build your dream business today. It’s free, and always will be.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 150 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                     <button 
                        onClick={onSignUpClick}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/20"
                     >
                        Create Your Store for Free
                    </button>
                </motion.div>
            </div>
            
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <motion.div custom={0} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                        <h3 className="text-xl font-bold mb-4">BizzySite</h3>
                        <p className="text-gray-400 text-sm">Empowering small businesses to succeed online.</p>
                    </motion.div>

                    <motion.div custom={1} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                         <h4 className="text-lg font-semibold mb-4">Product</h4>
                         <ul className="space-y-3 text-gray-400">
                             <li><a href="#features-section" className="hover:text-indigo-400 transition-colors" data-cursor-hover>Features</a></li>
                             <li><a href="#" className="hover:text-indigo-400 transition-colors" data-cursor-hover>Blog</a></li>
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
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/bizzysite.app/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors" data-cursor-hover>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 2a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                                </svg>
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

export default Footer;
