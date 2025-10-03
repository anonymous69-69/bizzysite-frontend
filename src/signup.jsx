import { useState, useRef, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Orb from "./Orb";
import BlurText from "./BlurText";
import Rellax from "rellax";
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import PinnedTestimonialsSection from './components/landing/PinnedTestimonialsSection';
import VideoGrowSection from './components/landing/VideoGrowSection';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Link } from "react-router-dom";
import Lenis from '@studio-freight/lenis'
import FAQ from './components/landing/FAQ';
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
          {/* MODIFIED PART STARTS HERE */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight text-center font-story">
            Build Your Online Store
            <br />
            For Free
          </h1>
          {/* MODIFIED PART ENDS HERE */}
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

//=================================================================
// SUB-COMPONENT: TestimonialCard
//=================================================================


//=================================================================
// SUB-COMPONENT: Aurora Background
//=================================================================
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

//====================================================   

//=================================================================
// How It Works Section
//=================================================================
const RellaxDemoSection = () => {
  return (
    <section className="relative min-h-screen items-center justify-center overflow-hidden bg-black py-24 px-4 sm:px-6 lg:px-8">
      <div className="rellax absolute top-10 right-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/20 blur-2xl" data-rellax-speed="6"></div>
      <div className="rellax absolute bottom-20 left-20 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/20 blur-2xl" data-rellax-speed="-4"></div>
      <div className="z-10 mx-auto max-w-4xl text-center">
        <h2 className="rellax text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-20" data-rellax-speed="1">
          How To Get Started
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mb-24 text-left">
          <div className="rellax rounded-xl border border-gray-800 bg-gray-900/50 p-6" data-rellax-speed="1">
            <div className="text-3xl font-bold text-indigo-400 mb-3">1.</div>
            <h3 className="text-xl font-semibold mb-2">Add Your Info</h3>
            <p className="text-gray-400">Provide your name, email, and phone number to create your free account.</p>
          </div>
          <div className="rellax rounded-xl border border-gray-800 bg-gray-900/50 p-6" data-rellax-speed="3">
            <div className="text-3xl font-bold text-indigo-400 mb-3">2.</div>
            <h3 className="text-xl font-semibold mb-2">Upload Products</h3>
            <p className="text-gray-400">Add product photos, set your price, and define shipping costs for each item.</p>
          </div>
          <div className="rellax rounded-xl border border-gray-800 bg-gray-900/50 p-6" data-rellax-speed="5">
            <div className="text-3xl font-bold text-indigo-400 mb-3">3.</div>
            <h3 className="text-xl font-semibold mb-2">Customize & Launch</h3>
            <p className="text-gray-400">Choose your website's colors and fonts. Now you're ready to go!</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="rellax" data-rellax-speed="1">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-2">A Truly Free Platform</h3>
            <p className="text-lg text-gray-300 mb-8">
              Yes. You can build, launch, and manage your online store without any monthly fees or hidden costs. We believe in empowering businesses to start and grow without financial barriers.
            </p>
          </div>
          <div className="rellax" data-rellax-speed="2">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-2">We Only Succeed When You Do</h3>
            <p className="text-lg text-gray-300">
              Our business model is designed to be a partnership. Instead of monthly fees, we earn a small 3% commission per transaction. This ensures we're always motivated to provide you with the best tools to help your business thrive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
// SUB-COMPONENT: Footer (ENHANCED VERSION)
//=================================================================
const Footer = ({ onSignUpClick }) => { // <-- MODIFICATION: Added onSignUpClick prop
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
            {/* Spotlight Effect */}
            <div 
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(129, 140, 248, 0.1), transparent 80%)`,
                }}
            />

            {/* Pre-footer CTA */}
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
                    {/* MODIFICATION: Added onClick handler to the button */}
                     <button 
                        onClick={onSignUpClick}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/20"
                     >
                        Create Your Store for Free
                    </button>
                </motion.div>
            </div>
            
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Column 1: Brand */}
                    <motion.div custom={0} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                        <h3 className="text-xl font-bold mb-4">BizzySite</h3>
                        <p className="text-gray-400 text-sm">Empowering small businesses to succeed online.</p>
                    </motion.div>

                    {/* Column 2: Links */}
                    <motion.div custom={1} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                         <h4 className="text-lg font-semibold mb-4">Product</h4>
                         <ul className="space-y-3 text-gray-400">
                             {/* MODIFICATION: Updated links */}
                             <li><a href="#features-section" className="hover:text-indigo-400 transition-colors" data-cursor-hover>Features</a></li>
                             <li><Link to="/blog" className="hover:text-indigo-400 transition-colors" data-cursor-hover>Blog</Link></li>                         </ul>
                    </motion.div>

                    {/* Column 3: Contact */}
                    <motion.div custom={2} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                        <h4 className="text-lg font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="mailto:your-store@bizzysite.shop" className="hover:text-indigo-400 transition-colors" data-cursor-hover>your-store@bizzysite.shop</a></li>
                        </ul>
                    </motion.div>

                     {/* Column 4: Social */}
                    <motion.div custom={3} initial="hidden" whileInView="visible" variants={staggerVariants} viewport={{ once: true, amount: 0.5 }}>
                         <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                         <div className="flex space-x-4">
                            {/* MODIFICATION: Replaced text with SVG icons and correct links */}
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


// NEW: Add the CustomCursor component here
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
        // Base transform
        let transform = `translate3d(${clientX}px, ${clientY}px, 0)`;

        // Add scale effect on hover
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
    // NEW: Lenis setup for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2, // speed
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easing function
    });

    // NEW: Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    // NEW: Rellax setup
    const rellax = new Rellax('.rellax', {
      center: true,
    });
    
    return () => {
      rellax.destroy();
      // NEW: Clean up Lenis and GSAP ticker
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NEW: Add the custom cursor component */}
      <CustomCursor /> 

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-50" style={{ scaleX: scrollYProgress, willChange: 'transform' }} />
      <motion.div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden pointer-events-none flex items-center justify-center" style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "55%"]) }}>
        <div className="absolute inset-0 flex items-center justify-center"><motion.div className="relative w-[70vmin] aspect-square" style={{ scale: useTransform(scrollYProgress, [0, 0.5], [1, 1.3]) }}><Orb hue={2} hoverIntensity={0.6} rotateOnHover={true} forceHoverState={false} /></motion.div></div>
      </motion.div>
      <Header onLoginClick={openLoginModal} onSignUpClick={openSignUpModal} />
      <main>
    <HeroSection onGetStartedClick={openSignUpModal} />
    <PinnedFeaturesSection />
    <PinnedTestimonialsSection />  {/* <-- This uses the imported component */}
    <RellaxDemoSection />
    <VideoGrowSection />
    <FAQ />
</main>
      {/* MODIFICATION: Passed the openSignUpModal function to the Footer */}
      <Footer onSignUpClick={openSignUpModal} />
      <AnimatePresence>
        {showModal && (
          <AuthModal isLogin={isLogin} setIsLogin={setIsLogin} onClose={() => setShowModal(false)} onSuccess={handleAuthSuccess} onForgotPasswordClick={() => setShowForgotPasswordModal(true)} />
        )}
        {showForgotPasswordModal && (
          <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

//=================================================================
// MODAL COMPONENT: Authentication
//=================================================================
const AuthModal = ({ isLogin, setIsLogin, onClose, onSuccess, onForgotPasswordClick }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && (!name || !email || !password)) { return; }
        if (!isLogin && password.length < 6) { return; }
        
        setIsLoading(true);
        const payload = { email, password, ...(isLogin ? {} : { name }) };
        try {
            const url = `https://bizzysite.onrender.com/api/${isLogin ? "login" : "signup"}`;
            const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || "Request failed"); }
            
            const userId = String(data.userId || data._id || "").trim();
            if (!userId) { throw new Error("Invalid user ID received."); }

            localStorage.setItem("userId", userId);
            localStorage.setItem("token", userId);
            localStorage.setItem("userEmail", data.email || "");
            localStorage.setItem("userName", data.name || "");
            localStorage.setItem("userPhone", data.phone || "");
            localStorage.setItem("userRole", data.role || "vendor");

            if (data.adminToken) {
              localStorage.setItem("adminToken", data.adminToken);
            }

            if (!isLogin) {
              try {
                  await fetch("https://bizzysite.onrender.com/api/send-welcome-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, name }),
                  });
              } catch (error) {
                  console.error("Post-signup welcome email failed:", error);
              }
          }
            onSuccess();
        } catch (error) {
            console.error("Auth error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const res = await fetch("https://bizzysite.onrender.com/api/google-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, name: user.displayName, email: user.email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Google login failed");

            localStorage.setItem("userId", data.userId);
            localStorage.setItem("token", data.userId || "");
            localStorage.setItem("userEmail", data.email || "");
            localStorage.setItem("userName", data.name || "");
            localStorage.setItem("userPhone", data.phone || "");
            localStorage.setItem("userRole", "vendor");
            
            onSuccess();
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={onClose}>
            <motion.div
                initial={{ y: "5%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "5%", opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full mx-auto border border-gray-700 p-8"
                style={{ boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)" }}
                onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
            >
                <h2 className="text-2xl font-bold mb-6 text-white text-center">{isLogin ? "Welcome Back" : "Create Your Account"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    {isLogin && (<div className="text-right"><button type="button" onClick={onForgotPasswordClick} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</button></div>)}
                    <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-lg disabled:bg-indigo-400">{isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}</button>
                    <div className="relative my-4"><hr className="border-gray-700" /><span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-2 bg-gray-900 text-sm text-gray-400">or</span></div>
                    <button type="button" onClick={handleGoogleSignIn} className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 border border-gray-700 rounded-md bg-gray-800/70 hover:bg-gray-800 transition">
                        <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                            <path d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.1c-6.3 34.1-25.1 62.9-53.5 82.1v68.2h86.4c50.7-46.7 81.5-115.5 81.5-195.1z" fill="#4285F4" />
                            <path d="M272 544.3c72.9 0 134-24.2 178.6-65.8l-86.4-68.2c-24 16-54.5 25.4-92.2 25.4-70.9 0-131-47.9-152.5-112.1H30.8v70.4C74.7 474.7 166.4 544.3 272 544.3z" fill="#34A853" />
                            <path d="M119.5 323.6c-10.2-30.1-10.2-62.6 0-92.7v-70.4H30.8c-42.5 84.6-42.5 183.3 0 267.9l88.7-70.4z" fill="#FBBC05" />
                            <path d="M272 107.1c39.7-.6 77.5 14.6 106.6 41.6l79.4-79.4C406 24.8 345.8 0 272 0 166.4 0 74.7 69.6 30.8 173.3l88.7 70.4C141 155 201.1 107.1 272 107.1z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm font-medium text-white">Continue with Google</span>
                    </button>
                    <div className="mt-6 text-center"><button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}</button></div>
                </form>
            </motion.div>
        </div>
    );
};

//=================================================================
// MODAL COMPONENT: Forgot Password
//=================================================================
const ForgotPasswordModal = ({ onClose }) => {
    const [resetEmail, setResetEmail] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [message, setMessage] = useState("");

    const handleResetRequest = async () => { /* Reset logic is unchanged */ };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full mx-auto border border-gray-700 p-8"
                onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
            >
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Reset Your Password</h2>
                {message ? (
                    <div className="text-center">
                        <p className="text-green-400">{message}</p>
                        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">Close</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-center text-gray-400 text-sm">Enter your email and we'll send a link to reset your password.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                            <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="your@email.com" />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition-colors" disabled={isSendingReset}>Cancel</button>
                            <button type="button" onClick={handleResetRequest} className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSendingReset}>{isSendingReset ? "Sending..." : "Send Reset Link"}</button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};