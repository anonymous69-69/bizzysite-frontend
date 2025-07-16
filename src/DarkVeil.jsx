import { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const vertex = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  precision mediump float;
  uniform float uTime;

  void main() {
    // Animate blue tone over time
    float pulse = 0.5 + 0.5 * sin(uTime);
    gl_FragColor = vec4(0.1, 0.2, pulse, 1.0);
  }
`;

export default function DarkVeil() {
  const ref = useRef(null);

  useEffect(() => {
    console.log("✅ DarkVeil mounted");

    const canvas = ref.current;
    const parent = canvas?.parentElement || document.body;

    // Force WebGL1 to avoid context issues
    let renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        canvas,
        webgl: 1,
      });
    } catch (err) {
      console.error("❌ Failed to initialize WebGL renderer:", err);
      return;
    }

    const gl = renderer.gl;
    if (!gl) {
      console.error("❌ WebGL context not available.");
      return;
    }

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h);
      gl.viewport(0, 0, w, h);
    };

    window.addEventListener("resize", resize);
    resize();

    let start = performance.now();
    let frame;

    const loop = () => {
      const time = (performance.now() - start) / 1000;
      program.uniforms.uTime.value = time;
      console.log("🎨 Rendering frame at time:", program.uniforms.uTime.value);

      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="w-full h-full block" />;
}
