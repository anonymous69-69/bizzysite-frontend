import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

export default function Orb({
  hue = 0,
  hoverIntensity = 0.4,  // Increased default intensity
  rotateOnHover = true,
  forceHoverState = false,
}) {
  const ctnDom = useRef(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }
    
    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }
    
    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    // Lavender and nearby hues
    const vec3 baseColor1 = vec3(0.811765, 0.462745, 1.0);
    const vec3 baseColor2 = vec3(0.498039, 0.860784, 1.0);
    const vec3 baseColor3 = vec3(0.262745, 0.278431, 1.0);
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }
    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);
      
      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;
      
      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      vec2 uvShifted = uv + vec2(sin(iTime * 0.3), cos(iTime * 0.3)) * 0.1;
      float d0 = distance(uvShifted, (r0 * invLen) * uvShifted);
      float v0 = light1(1.5, 8.0, d0);
      v0 *= smoothstep(r0 * 1.05, r0, len);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
      
      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(2.0, 4.0, d);
      v1 *= light1(1.0, 50.0, d0);
      
      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
      
      vec3 col = mix(color1, color2, cl);
      col = mix(color3, col, v0);
      col = (col + v1) * v2 * v3;
      col = clamp(col, 0.0, 1.0);
      
      return extractAlpha(col);
    }

    void main() {
      vec2 fragCoord = (vUv - 0.5) * 2.0;
      vec4 col = draw(fragCoord);
      float len = length(fragCoord);
      float fade = smoothstep(1.2, 0.2, len) * (1.0 - pow(len, 2.0));
      gl_FragColor = vec4(col.rgb * 0.8 * fade, col.a * fade);
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    console.log("Orb canvas mounted:", container);
    if (!container) return;

    const renderer = new Renderer({ 
      alpha: true, 
      premultipliedAlpha: false,
      antialias: true
    });
    const gl = renderer.gl;
    const dpr = window.devicePixelRatio || 1;
    gl.clearColor(0, 0, 0, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    container.appendChild(gl.canvas);
    gl.canvas.width = container.offsetWidth * dpr;
    gl.canvas.height = container.offsetHeight * dpr;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';

    const vertex = vert;
    const fragment = frag;

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(gl.canvas.width, gl.canvas.height, 1) },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const bounds = container.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      gl.canvas.style.width = width + 'px';
      gl.canvas.style.height = height + 'px';
      gl.canvas.width = width * dpr;
      gl.canvas.height = height * dpr;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      renderer.setSize(width, height, dpr);
      program.uniforms.iResolution.value.set(
        gl.canvas.width,
        gl.canvas.height,
        1
      );
    }

    window.addEventListener("resize", resize, false);
    resize();

    let startTime = performance.now();
    let rot = 0;
    let hover = 0;

    function update(t) {
      const elapsed = (t - startTime) / 1000;

      program.uniforms.iTime.value = elapsed;
      program.uniforms.hue.value = hue;
      program.uniforms.hoverIntensity.value = hoverIntensity;
      program.uniforms.rot.value = rot;
      program.uniforms.hover.value = forceHoverState ? 1 : hover;

      renderer.render({ scene: mesh });
      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", resize);
      if (gl.canvas && gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
    };
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return (
    <div
      ref={ctnDom}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{
        backgroundColor: "#000"
      }}
    />
  );
}