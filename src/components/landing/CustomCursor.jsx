import { useRef, useEffect } from "react";

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

export default CustomCursor;