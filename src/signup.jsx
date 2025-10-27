import { useState, useRef, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "./firebase";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Orb from "./Orb";
import BlurText from "./BlurText";
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import PinnedTestimonialsSection from './components/landing/PinnedTestimonialsSection';
import VideoGrowSection from './components/landing/VideoGrowSection';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Link } from "react-router-dom";
import Lenis from '@studio-freight/lenis'
import FAQ from './components/landing/FAQ';
import { Helmet } from "react-helmet-async";

// IMPORT MODAL COMPONENTS (They are now standalone and should be imported)
// NOTE: Assuming AuthModal and ForgotPasswordModal are imported from separate files 
// as they were defined in your first two file uploads.
import AuthModal from './components/modals/AuthModal'; 
import ForgotPasswordModal from './components/modals/ForgotPasswordModal';// Assuming ForgotPasswordModal.jsx is in the same directory or adjust path


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);


//=================================================================
// SUB-COMPONENT: Header
//=================================================================
const Header = ({ onLoginClick, onSignUpClick }) => {
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 max-w-lg w-full z-30 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-900/40 backdrop-blur-xl rounded-full border border-gray-700/50 shadow-2xl">
        <div className="flex justify-between items-center h-14 px-6">
          <div>
            <img src="/bizzysitelogo.svg" alt="BizzySite Logo" className="h-8 w-auto"/>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={onLoginClick} className="px-3 py-1.5 text-sm text-gray-300 font-medium hover:text-indigo-400 transition-colors rounded-full">Login</button>
            <button onClick={onSignUpClick} className="px-4 py-1.5 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-full hover:opacity-90 transition-all shadow-md">Sign Up</button>
          </div>
        </div>
      </div>
    </header>
  );
};

//=================================================================
// SUB-COMPONENT: Hero Section
//=================================================================
const HeroSection = ({ onGetStartedClick }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center pt-24 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight text-center font-story">
            Build Your Online Store
            <br />
            For Free
          </h1>
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

//=================================================================
// SECTION 1: FEATURES SECTION
//=================================================================
//=================================================================
// SECTION 1: FEATURES SECTION
//=================================================================
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
    <section ref={sectionRef} id="features-section" className="relative py-24 sm:py-32">
      <motion.div 
        style={{ backgroundColor }} 
        className="absolute inset-0 -z-10" 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* MODIFIED: Changed h2 to motion.h2 and added scroll animation props */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} // Start invisible and 20px down
          whileInView={{ opacity: 1, y: 0 }} // Animate to visible and original position
          transition={{ duration: 0.6, ease: "easeOut" }} 
          viewport={{ once: true, amount: 0.5 }} // Trigger when 50% in view, only once
          className="text-3xl sm:text-4xl font-bold text-white mb-4"
        >
          Everything You Need to Succeed Online
        </motion.h2>
        
        {/* MODIFIED: Changed p to motion.p and added scroll animation props */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }} // Start invisible and 20px down
          whileInView={{ opacity: 1, y: 0 }} // Animate to visible and original position
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }} // Slight delay after the h2
          viewport={{ once: true, amount: 0.5 }} 
          className="text-xl text-gray-400"
        >
          Powerful features designed to help your business grow
        </motion.p>

        <div className="mt-16 flex flex-col md:flex-row items-start justify-center gap-8">
          {features.map((feature, index) => (
            <motion.div // <--- Changed to motion.div for staggered animation
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }} // Staggered delay for each card
              viewport={{ once: true, amount: 0.3 }}
              className="w-full md:w-1/3 bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
out vec4 fragColor;
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
struct ColorStop { vec3 color; float position; };
#define COLOR_RAMP(colors, factor, finalColor) { \
  int index = 0; \
  for (int i = 0; i < 2; i++) { \
    ColorStop currentColor = colors[i]; \
    bool isInBetween = currentColor.position <= factor; \
    index = int(mix(float(index), float(i), float(isInBetween))); \
  } \
  ColorStop currentColor = colors[index]; \
  ColorStop nextColor = colors[index + 1]; \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  vec3 auroraColor = intensity * rampColor;
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

const Aurora = (props) => {
  const { colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5, speed = 1.0 } = props;
  const propsRef = useRef(props);
  propsRef.current = props;

  const ctnDom = useRef(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = 'transparent';

    let program;

    function resize() {
      if (!ctn) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      renderer.setSize(width, height);
      if (program) {
        program.uniforms.uResolution.value = [width, height];
      }
    }
    window.addEventListener('resize', resize);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const colorStopsArray = colorStops.map(hex => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    let animateId = 0;
    const update = t => {
      animateId = requestAnimationFrame(update);
      const { time = t * 0.01, speed = 1.0 } = propsRef.current;
      program.uniforms.uTime.value = time * speed * 0.1;
      program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0;
      program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
      const stops = propsRef.current.colorStops ?? colorStops;
      program.uniforms.uColorStops.value = stops.map(hex => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });
      renderer.render({ scene: mesh });
    };
    animateId = requestAnimationFrame(update);

    resize();

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [amplitude, blend, colorStops]);

  return <div ref={ctnDom} className="w-full h-full" />;
}
   
const HowItWorksSection = () => {
  const steps = [ // Extracted steps into an array for easier mapping/animation
    { title: "Add Your Info", desc: "Provide your name, email, and phone number to create your free account." },
    { title: "Upload Products", desc: "Add product photos, set your price, and define shipping costs for each item." },
    { title: "Customize & Launch", desc: "Choose your website's colors and fonts. Now you're ready to go!" },
  ];

  return (
    <section className="relative items-center justify-center overflow-hidden bg-black py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-10 right-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/20 blur-2xl"></div>
      <div className="absolute bottom-20 left-20 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/20 blur-2xl"></div>
      <div className="z-10 mx-auto max-w-4xl text-center">
        
        {/* MODIFIED: Changed h2 to motion.h2 and added scroll animation props */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-20"
        >
          How To Get Started
        </motion.h2>

        {/* MODIFIED: Changed div to motion.div to wrap the three steps for animation */}
        <div className="grid md:grid-cols-3 gap-8 mb-24 text-left">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }} // Staggered entry
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
            >
              <div className="text-3xl font-bold text-indigo-400 mb-3">{index + 1}.</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* The revenue model explanation can also be animated, let's add animations here too */}
        <div className="max-w-2xl mx-auto">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }} // Delay to happen after the cards
             viewport={{ once: true, amount: 0.5 }}
          >
            <h3 className="text-2xl font-semibold text-indigo-400 mb-2">A Truly Free Platform</h3>
            <p className="text-lg text-gray-300 mb-8">
              Yes. You can build, launch, and manage your online store without any monthly fees or hidden costs. We believe in empowering businesses to start and grow without financial barriers.
            </p>
          </motion.div>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }} // Slightly more delay
             viewport={{ once: true, amount: 0.5 }}
          >
            <h3 className="text-2xl font-semibold text-indigo-400 mb-2">We Only Succeed When You Do</h3>
            <p className="text-lg text-gray-300">
              Our business model is designed to be a partnership. Instead of monthly fees, we earn a small 3% commission per transaction. This ensures we're always motivated to provide you with the best tools to help your business thrive.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

//=================================================================
// SUB-COMPONENT: Footer
//=================================================================
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

//=================================================================
// SUB-COMPONENT: Custom Cursor
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
// MAIN PAGE COMPONENT
//=================================================================
export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.scrollTo(0, { immediate: true }); 
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
    
    // Rellax setup has been removed
    
    return () => {
      gsap.ticker.remove(lenis.raf);
      lenis.destroy();
    };
  }, []);

  const openLoginModal = () => { setIsLogin(true); setShowModal(true); };
  const openSignUpModal = () => { setIsLogin(false); setShowModal(true); };
  const handleAuthSuccess = () => {
    setShowModal(false);
    setShowForgotPasswordModal(false);
    navigate("/storefront", { state: { fromLogin: true } });
  };
  
  // NEW: Handler to go from Forgot Password back to Login
  const handleBackToLogin = () => {
    setShowForgotPasswordModal(false);
    openLoginModal();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>BizzySite — Build Your Online Store for Free</title>
        <meta
          name="description"
          content="Create your online store for free with BizzySite. No coding, no monthly fees. Launch your ecommerce website in minutes and start selling globally."
        />
        <meta property="og:title" content="BizzySite — Build Your Online Store for Free" />
        <meta
          property="og:description"
          content="Start your free online store with BizzySite. The fastest and easiest way to launch your ecommerce business — no coding or upfront costs."
        />
      </Helmet>
      <CustomCursor /> 

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-50" style={{ scaleX: scrollYProgress, willChange: 'transform' }} />
      <motion.div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden pointer-events-none flex items-center justify-center" style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "55%"]) }}>
        <div className="absolute inset-0 flex items-center justify-center"><motion.div className="relative w-[70vmin] aspect-square" style={{ scale: useTransform(scrollYProgress, [0, 0.5], [1, 1.3]) }}><Orb hue={2} hoverIntensity={0.6} rotateOnHover={true} forceHoverState={false} /></motion.div></div>
      </motion.div>
      <Header onLoginClick={openLoginModal} onSignUpClick={openSignUpModal} />
      <main>
        <HeroSection onGetStartedClick={openSignUpModal} />
        <PinnedFeaturesSection />
        <PinnedTestimonialsSection />
        <HowItWorksSection />
        <VideoGrowSection />
        <FAQ />
      </main>
      <Footer onSignUpClick={openSignUpModal} />
      <AnimatePresence>
        {showModal && (
          <AuthModal 
            isLogin={isLogin} 
            setIsLogin={setIsLogin} 
            onClose={() => setShowModal(false)} 
            onSuccess={handleAuthSuccess} 
            // Handler to switch from AuthModal to ForgotPasswordModal
            onForgotPasswordClick={() => {
                setShowModal(false);
                setShowForgotPasswordModal(true);
            }} 
          />
        )}
        {showForgotPasswordModal && (
          <ForgotPasswordModal 
            onClose={() => setShowForgotPasswordModal(false)} 
            // Pass the handler to switch from ForgotPasswordModal back to Login
            onBackToLogin={handleBackToLogin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// NOTE: Removed duplicate AuthModal and ForgotPasswordModal definitions here 
// to rely on the imports at the top of the file.