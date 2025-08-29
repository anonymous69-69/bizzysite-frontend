import { useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import Orb from "./Orb";
import BlurText from "./BlurText";

export default function WaitlistPage() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setIsSubmittingWaitlist(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Here you would typically send the email to your backend
      console.log("Waitlist email:", waitlistEmail);
      setWaitlistSuccess(true);
      setTimeout(() => {
        setShowWaitlistModal(false);
        setWaitlistSuccess(false);
        setWaitlistEmail("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting to waitlist:", error);
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Orb */}
      <div className="absolute top-0 left-0 w-full min-h-screen z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[70vmin] aspect-square">
            <Orb
              hue={2}
              hoverIntensity={0.6}
              rotateOnHover={true}
              forceHoverState={false}
            />
          </div>
        </div>
      </div>

      {/* Header - Dark Theme */}
      <header className="fixed w-full bg-gray-900/80 backdrop-blur-md shadow-sm z-30 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-2xl font-bold text-white">BizzySite</h1>
          </div>
          {/* Removed login/signup buttons from header */}
        </div>
      </header>

      {/* Hero Section - Dark Theme */}
      <div className="min-h-screen flex flex-col justify-center items-center pt-24 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight text-center"
          >
            <BlurText
              text="Build Your Online Store"
              animateBy="words"
              direction="top"
              className="leading-tight"
              delay={600}
              stepDuration={1}
            />
            <BlurText
              text="For Free"
              animateBy="words"
              direction="top"
              className="leading-tight"
              delay={600}
              stepDuration={1}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="min-h-[72px] sm:min-h-[60px] flex justify-center items-center">
              <TypeAnimation
                sequence={[
                  "Create beautiful ecommerce sites in minutes",
                  2000,
                  "Powerful tools for small businesses",
                  2000,
                  "Easy customization, no technical skills needed",
                  2000,
                ]}
                wrapper="p"
                repeat={Infinity}
                className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto text-center"
              />
            </div>
          </motion.div>

          <div className="flex justify-center items-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWaitlistModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/20"
            >
              Join Waitlist
            </motion.button>
          </div>
        </div>
      </div>

      {/* Features Section - Dark Theme */}
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed Online
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Powerful features designed to help your business grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Lightning Fast Setup",
                desc: "Launch your store in minutes with our intuitive setup wizard",
                animation: (
                  <div className="h-16 flex items-center justify-center mb-6 relative">
                    {/* Rocket */}
                    <motion.div
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: -40, opacity: 0 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 0,
                        ease: "easeOut",
                      }}
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <div className="text-4xl">🚀</div>
                    </motion.div>
                  </div>
                ),
              },
              {
                title: "Everything for free",
                desc: "Absolutely free for all the users with no hidden charges",
                animation: (
                  <div className="h-16 flex items-center justify-center mb-6">
                    <div
                      style={{
                        position: "relative",
                        width: 80,
                        height: 40,
                        filter:
                          "drop-shadow(0 4px 6px rgba(99, 102, 241, 0.3))",
                      }}
                    >
                      {/* Payment Terminal Base */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 60,
                          height: 30,
                          backgroundColor: "#4b5563",
                          borderRadius: 4,
                          boxShadow:
                            "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      ></div>

                      {/* Credit Card */}
                      <motion.div
                        initial={{ x: 30, y: 0, rotate: 0 }}
                        animate={{ x: -30, rotate: -10 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "50%",
                          width: 40,
                          height: 25,
                          backgroundColor: "#1f2937",
                          borderRadius: 3,
                          boxShadow: `
                            0 2px 8px rgba(0,0,0,0.2),
                            0 4px 12px rgba(79, 70, 229, 0.3),
                            inset 0 0 0 1px rgba(255,255,255,0.05)
                          `,
                          zIndex: 10,
                        }}
                      >
                        {/* Card Details */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            right: 4,
                            height: 4,
                            backgroundColor: "#374151",
                            borderRadius: 2,
                          }}
                        ></div>
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 4,
                            width: 12,
                            height: 8,
                            backgroundColor: "#6366f1",
                            borderRadius: 2,
                          }}
                        ></div>
                      </motion.div>

                      {/* Subtle glow effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          top: -5,
                          left: "50%",
                          width: 50,
                          height: 30,
                          backgroundColor: "#6366f1",
                          borderRadius: "50%",
                          filter: "blur(8px)",
                          transform: "translateX(-50%)",
                          zIndex: 1,
                        }}
                      />
                    </div>
                  </div>
                ),
              },
              {
                title: "Mobile Optimized",
                desc: "Beautiful storefront that works perfectly on all devices",
                animation: (
                  <div className="h-16 flex items-center justify-center mb-6">
                    <div
                      style={{
                        position: "relative",
                        width: 40,
                        height: 60,
                        backgroundColor: "black",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "2px solid #333",
                        boxShadow: "0 0 10px rgba(99, 102, 241, 0.3)",
                      }}
                    >
                      <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: -60 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }}
                      >
                        <div
                          style={{
                            height: 60,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#1f2937",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "center",
                            }}
                          >
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                style={{
                                  width: 12,
                                  height: 12,
                                  backgroundColor:
                                    i % 2 === 0 ? "#6366f1" : "#8b5cf6",
                                  margin: 3,
                                  borderRadius: 3,
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div
                          style={{
                            height: 60,
                            backgroundColor: "#6366f1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: "white",
                              borderRadius: 10,
                            }}
                          ></div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ),
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700"
              >
                {feature.animation}
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Trusted by Thousands of Businesses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
            {[
              {
                text: "BizzySite helped us launch our online store in just few minutes. The setup was incredibly simple!",
                author: "candy crochet ",
                role: "Crochet store",
              },
              {
                text: "Our sales increased by 40% after switching to BizzySite. The beautiful storefront really makes a difference.",
                author: "siya",
                role: "SiyaCakes",
              },
              {
                text: "As a small business owner with no tech skills, BizzySite has been a game-changer for us.",
                author: "Ron",
                role: "Criss Soaps",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <div className="text-3xl mb-4">“</div>
                <p className="mb-6">{testimonial.text}</p>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-indigo-200">{testimonial.role}</div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWaitlistModal(true)}
            className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-lg shadow-xl hover:bg-gray-100 transition-all"
          >
            Join Waitlist
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                BizzySite
              </h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Empowering small businesses to succeed online with simple,
                powerful tools.
              </p>
            </div>
            <div></div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Contact
              </h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li>Email: your-store@bizzysite.shop</li>
              </ul>
            </div>
          </div>
          <div
            className={`border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-500`}
          >
            <p>© 2025 BizzySite. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowWaitlistModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full mx-auto border border-gray-700 p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <h2 className="text-2xl font-bold mb-2 text-white text-center">
              Join Our Waitlist
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Be the first to know when we launch!
            </p>
            
            {waitlistSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
                <p className="text-gray-400">You've been added to our waitlist.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmittingWaitlist}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 flex items-center justify-center"
                >
                  {isSubmittingWaitlist ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </button>
              </form>
            )}
            
            <button
              onClick={() => setShowWaitlistModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}