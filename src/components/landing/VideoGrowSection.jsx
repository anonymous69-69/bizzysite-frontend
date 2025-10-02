import React, { useRef, useEffect } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const VideoGrowSection = () => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const titleChars = new SplitText(titleRef.current, { type: "chars" }).chars;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom bottom+=100%",
          invalidateOnRefresh: true,
          scrub: 1,
        },
      });

      tl.fromTo(
        titleChars,
        { scale: 0, rotation: () => Math.random() * 360 - 180 },
        { scale: 1, duration: 0.2, rotation: 0, ease: "expo.out", stagger: { each: 0.05, from: "random" } }
      );

      tl.fromTo(
        videoRef.current,
        { clipPath: "inset(10% 50% 10% 50%)", yPercent: 100 },
        { ease: "power3", clipPath: "inset(0% 0% 0% 0%)", duration: 1, yPercent: 0 },
        ".3"
      );

      tl.fromTo(
        videoRef.current,
        { scale: 0.5 },
        { ease: "back.inOut(0.2)", scale: 1, duration: 0.8 },
        "<"
      );
      
      tl.fromTo(
        imageRef.current,
        { scale: 2.8, yPercent: 40 },
        { scale: 1.2, duration: 0.8, delay: 0.2, yPercent: 0 },
        "<"
      );

      tl.to(videoRef.current, { scale: 0.9, ease: "linear" });
      tl.to(imageRef.current, { scale: 0.5, ease: "linear" }, "<");

    }, sectionRef);

    return () => ctx.revert(); 
  }, []);

  return (
    <section ref={sectionRef} className="relative flex flex-col items-center justify-start min-h-[400svh] py-24 bg-black text-white">
      <div className="sticky top-0 flex items-center justify-center w-full h-screen px-4">
        <div className="relative flex flex-col items-center justify-center w-full max-w-7xl gap-6">
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');`}</style>
          <div ref={titleRef} className="uppercase text-[17vw] leading-none" style={{ fontFamily: "'Anton', sans-serif" }}>
            GET STARTED NOW
          </div>
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div ref={videoRef} className="w-[70%] h-[29rem] max-w-7xl rounded-md overflow-clip pointer-events-auto">
              <div
                ref={imageRef}
                className="flex items-center justify-center w-full h-full p-8 text-center bg-white text-black"
              >
                <h2 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl" style={{ fontFamily: "'Anton', sans-serif" }}>
                    Your website<br/>
                    your business<br/>
                    your freedom
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoGrowSection;
