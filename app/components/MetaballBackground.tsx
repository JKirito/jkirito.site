"use client";

import { useRef, useEffect, useCallback } from "react";

// ── Quality tiers ──
type QualityTier = "high" | "medium" | "low";

function getQualityTier(): QualityTier {
  const w = window.innerWidth;
  const dpr = window.devicePixelRatio;
  if (w < 768 || dpr > 2) return "low";
  if (w < 1280) return "medium";
  return "high";
}

function getEffectiveDPR(tier: QualityTier): number {
  switch (tier) {
    case "high":
      return Math.min(window.devicePixelRatio, 2);
    case "medium":
      return 1.5;
    case "low":
      return 1;
  }
}

function getMarchSteps(tier: QualityTier): number {
  switch (tier) {
    case "high":
      return 64;
    case "medium":
      return 48;
    case "low":
      return 32;
  }
}

// ── GLSL Shaders ──
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

function buildFragmentShader(marchSteps: number): string {
  return /* glsl */ `
    precision mediump float;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uBlobPositionsA[5];
    uniform vec3 uBlobPositionsB[5];
    uniform float uBlobRadiiA[5];
    uniform float uBlobRadiiB[5];

    varying vec2 vUv;

    // ── Surface FX utilities (no mesh displacement) ──

    // Compact hash for procedural patterns
    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }

    float hash2(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    // Smooth value noise for veins and caustics
    float vnoise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float n = dot(i, vec3(1.0, 57.0, 113.0));
      return mix(
        mix(mix(hash(n), hash(n + 1.0), f.x),
            mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
        mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
            mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y),
        f.z
      );
    }

    // FBM for organic vein patterns
    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * vnoise(p);
        p *= 2.1;
        a *= 0.5;
      }
      return v;
    }

    // Iridescent spectrum: angle → rainbow color
    vec3 iridescence(float cosAngle, float shift) {
      float hue = cosAngle * 2.0 + shift;
      vec3 col;
      col.r = 0.5 + 0.5 * cos(6.28 * (hue + 0.0));
      col.g = 0.5 + 0.5 * cos(6.28 * (hue + 0.33));
      col.b = 0.5 + 0.5 * cos(6.28 * (hue + 0.67));
      return col;
    }

    // Caustic pattern — overlapping sine waves that create sharp bright spots
    float caustic(vec3 p, float time) {
      float c = 0.0;
      c += sin(p.x * 3.7 + time * 0.8) * sin(p.z * 4.3 - time * 0.6);
      c += sin(p.y * 5.1 - time * 0.7) * sin(p.x * 2.9 + time * 0.5);
      c += sin(p.z * 3.3 + time * 0.9) * sin(p.y * 4.7 - time * 0.4);
      c = c * 0.33; // normalize to roughly -1..1
      return max(0.0, c * c * c); // sharpen to bright peaks
    }

    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }

    float sdSphere(vec3 p, vec3 center, float radius) {
      return length(p - center) - radius;
    }

    // Fade-in ramp: effects build up over first 3 seconds
    float fadeIn() {
      return smoothstep(0.0, 3.0, uTime);
    }

    // ── ORGANIC DIMENSION (left) ──
    // Soft, bioluminescent, breathing shapes with wave distortion
    float sceneOrganic(vec3 p) {
      float fi = fadeIn();
      // Gentle wave distortion — the surface breathes
      vec3 op = p;
      op.x += sin(p.y * 1.5 + uTime * 0.8) * 0.12 * fi;
      op.y += cos(p.x * 1.2 + uTime * 0.6) * 0.1 * fi;
      op.z += sin(p.x * 0.8 + p.y * 0.9 + uTime * 0.5) * 0.08 * fi;

      float d = sdSphere(op, uBlobPositionsA[0], uBlobRadiiA[0]);
      for (int i = 1; i < 5; i++) {
        d = smin(d, sdSphere(op, uBlobPositionsA[i], uBlobRadiiA[i]), 1.2);
      }

      // Pulsing surface displacement
      d += sin(p.x * 3.0 + p.y * 2.5 + uTime * 1.2) * 0.03 * fi;
      d += sin(p.z * 4.0 + uTime * 0.9) * 0.015 * fi;

      return d;
    }

    vec3 colorOrganic(vec3 p) {
      // Bioluminescent palette: teal, deep sea green, soft blue
      vec3 colors[5];
      colors[0] = vec3(0.1, 0.85, 0.75);  // bright teal
      colors[1] = vec3(0.05, 0.55, 0.45);  // deep sea
      colors[2] = vec3(0.2, 0.9, 0.6);     // bioluminescent green
      colors[3] = vec3(0.1, 0.4, 0.7);     // deep blue
      colors[4] = vec3(0.15, 0.75, 0.85);  // light cyan

      vec3 col = vec3(0.0);
      float tw = 0.0;
      for (int i = 0; i < 5; i++) {
        float dist = length(p - uBlobPositionsA[i]);
        float w = 1.0 / (dist * dist + 0.05);
        col += colors[i] * w;
        tw += w;
      }
      col /= tw;

      // Pulsing glow intensity
      float pulse = 0.85 + 0.15 * sin(uTime * 1.5 + p.y * 2.0);
      return col * pulse;
    }

    // ── DIGITAL DIMENSION (right) ──
    // Clean but distinct shape character — tighter merging, different feel
    float sceneDigital(vec3 p) {
      float d = sdSphere(p, uBlobPositionsB[0], uBlobRadiiB[0]);
      for (int i = 1; i < 5; i++) {
        d = smin(d, sdSphere(p, uBlobPositionsB[i], uBlobRadiiB[i]), 0.7);
      }
      return d;
    }

    vec3 colorDigital(vec3 p) {
      // Cyberpunk palette: magenta, electric cyan, hot pink, purple
      vec3 colors[5];
      colors[0] = vec3(0.95, 0.1, 0.6);   // hot magenta
      colors[1] = vec3(0.0, 0.95, 0.9);    // electric cyan
      colors[2] = vec3(0.85, 0.15, 0.85);  // neon purple
      colors[3] = vec3(0.1, 0.6, 0.95);    // electric blue
      colors[4] = vec3(0.95, 0.3, 0.5);    // hot pink

      vec3 col = vec3(0.0);
      float tw = 0.0;
      for (int i = 0; i < 5; i++) {
        float dist = length(p - uBlobPositionsB[i]);
        float w = 1.0 / (dist * dist + 0.05);
        col += colors[i] * w;
        tw += w;
      }
      col /= tw;

      return col;
    }

    // ── Blended scene ──
    float sceneSDF(vec3 p) {
      float blend = smoothstep(-1.0, 1.0, p.x);
      float dA = sceneOrganic(p);
      float dB = sceneDigital(p);
      return mix(dA, dB, blend);
    }

    vec3 calcNormal(vec3 p) {
      vec2 e = vec2(0.01, 0.0);
      vec3 n = vec3(
        sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
        sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
        sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
      );
      float len = length(n);
      if (len < 0.0001) return vec3(0.0, 1.0, 0.0);
      return n / len;
    }

    vec3 getColor(vec3 p) {
      float blend = smoothstep(-1.0, 1.0, p.x);
      return mix(colorOrganic(p), colorDigital(p), blend);
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;

      vec3 ro = vec3(0.0, 0.0, 4.0);
      vec2 screen = (uv - 0.5) * 2.0;
      screen.x *= aspect;
      vec3 rd = normalize(vec3(screen, -1.5));

      // Raymarch
      float t = 0.0;
      float d = 0.0;
      vec3 p = ro;
      bool hit = false;

      for (int i = 0; i < ${marchSteps}; i++) {
        p = ro + rd * t;
        d = sceneSDF(p);
        if (d < 0.01) {
          hit = true;
          break;
        }
        t += d * 0.6;
        if (t > 20.0) break;
      }

      // ── Dimensional rift shimmer ──
      float riftDist = abs(screen.x);
      float riftGlow = 0.008 / (riftDist + 0.005);
      riftGlow *= smoothstep(0.6, 0.0, riftDist * 2.5);
      float riftPulse = 0.5 + 0.5 * sin(uTime * 3.0 + screen.y * 6.0);
      // Rift oscillates between organic teal and digital magenta
      vec3 riftColor = mix(
        vec3(0.1, 0.85, 0.75),
        vec3(0.95, 0.1, 0.6),
        sin(uTime * 1.2 + screen.y * 3.0) * 0.5 + 0.5
      );

      if (!hit) {
        // Atmospheric haze from both dimensions
        float blend = smoothstep(-1.0, 1.0, (ro + rd * 5.0).x);
        float glow = 0.0;
        vec3 midP = ro + rd * 5.0;

        for (int i = 0; i < 5; i++) {
          float distA = length(midP - uBlobPositionsA[i]) - uBlobRadiiA[i];
          float distB = length(midP - uBlobPositionsB[i]) - uBlobRadiiB[i];
          float gA = uBlobRadiiA[i] * 0.15 / (distA * distA + 0.3);
          float gB = uBlobRadiiB[i] * 0.15 / (distB * distB + 0.3);
          glow += mix(gA, gB, blend);
        }

        vec3 hazeCol = mix(
          colorOrganic(midP),
          colorDigital(midP),
          blend
        );

        // Rift shimmer
        hazeCol += riftColor * riftGlow * riftPulse * 0.4;
        float alpha = glow * 0.25;
        alpha = max(alpha, riftGlow * riftPulse * 0.06);

        gl_FragColor = vec4(hazeCol, alpha);
        return;
      }

      // ── Surface shading with layered FX ──
      vec3 normal = calcNormal(p);
      vec3 color = getColor(p);
      float blend = smoothstep(-1.0, 1.0, p.x);
      float fi = fadeIn();

      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
      float diffuse = max(dot(normal, lightDir), 0.0);
      float NdotV = max(dot(normal, -rd), 0.0);
      float fresnel = pow(1.0 - NdotV, 3.0);
      vec3 halfDir = normalize(lightDir - rd);
      float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);

      // ── 1. IRIDESCENCE ──
      // Organic: soft oil-slick shimmer, subtle
      vec3 iriOrg = iridescence(NdotV, uTime * 0.15 + p.y * 0.3) * fresnel * 0.3;
      // Digital: sharp holographic foil, vivid
      vec3 iriDig = iridescence(NdotV * 1.5, uTime * 0.3 + p.x * 0.5) * fresnel * 0.5;
      vec3 iri = mix(iriOrg, iriDig, blend) * fi;

      // ── 2. SUBSURFACE SCATTERING + CAUSTICS ──
      float sss = max(dot(normal, -lightDir), 0.0);
      // Organic: deep warm subsurface glow
      vec3 sssOrg = color * sss * 0.35 + color * 0.1;
      // Digital: sharp light refraction caustic pattern
      float caust = caustic(p * 2.0, uTime) * fi;
      vec3 sssDig = vec3(0.95, 0.1, 0.6) * caust * 0.4 + color * sss * 0.15;
      vec3 subsurface = mix(sssOrg, sssDig, blend);

      // ── 3. EMISSIVE VEINS / ENERGY FLOW ──
      // Organic: flowing bioluminescent veins
      float veinOrg = fbm(p * 3.0 + vec3(uTime * 0.2, uTime * 0.15, 0.0));
      veinOrg = smoothstep(0.45, 0.55, veinOrg); // isolate vein lines
      vec3 veinsOrganic = vec3(0.1, 0.95, 0.8) * veinOrg * 0.4 * fi;
      // Pulse the veins
      veinsOrganic *= 0.7 + 0.3 * sin(uTime * 2.0 + p.y * 3.0);

      // Digital: circuit-trace energy lines
      float gridX = smoothstep(0.47, 0.5, fract(p.x * 4.0 + uTime * 0.3));
      float gridY = smoothstep(0.47, 0.5, fract(p.y * 4.0 - uTime * 0.25));
      float gridZ = smoothstep(0.47, 0.5, fract(p.z * 3.0 + uTime * 0.2));
      float circuit = max(gridX, max(gridY, gridZ));
      // Energy pulse traveling along the circuits
      float pulse = 0.5 + 0.5 * sin(uTime * 4.0 + p.x * 5.0 + p.y * 3.0);
      vec3 veinsDigital = vec3(0.95, 0.1, 0.6) * circuit * pulse * 0.35 * fi;
      // Add cyan accent traces
      veinsDigital += vec3(0.0, 0.9, 0.85) * circuit * (1.0 - pulse) * 0.2 * fi;

      vec3 veins = mix(veinsOrganic, veinsDigital, blend);

      // ── Base lighting per dimension ──
      float organicAmbient = 0.3;
      vec3 organicLit = color * (organicAmbient + 0.4 * diffuse)
        + fresnel * color * 0.4
        + spec * 0.06;

      float digitalAmbient = 0.15;
      vec3 digitalLit = color * (digitalAmbient + 0.6 * diffuse)
        + fresnel * vec3(0.95, 0.1, 0.6) * 0.25
        + step(0.85, spec) * 0.35;

      vec3 litColor = mix(organicLit, digitalLit, blend);

      // ── Layer all FX ──
      litColor += subsurface;
      litColor += iri;
      litColor += veins;

      litColor = clamp(litColor, 0.0, 1.0);

      // Add rift shimmer near seam
      litColor += riftColor * riftGlow * riftPulse * 0.3;

      // Depth fade
      float depthFade = smoothstep(20.0, 2.0, t);
      float edgeSoft = smoothstep(0.0, 0.15, -d + 0.15);

      float alpha = 0.5 * depthFade * edgeSoft;
      alpha = max(alpha, riftGlow * riftPulse * 0.04);

      gl_FragColor = vec4(litColor, alpha);
    }
  `;
}

// ── Blob configurations ──
interface BlobConfig {
  baseX: number;
  baseY: number;
  baseZ: number;
  radius: number;
  driftSpeed: number;
  driftAmpX: number;
  driftAmpY: number;
  driftAmpZ: number;
  phase: number;
}

// Organic dimension — spread left
const BLOBS_A: BlobConfig[] = [
  { baseX: -2.2, baseY: 1.6, baseZ: -3.0, radius: 1.4, driftSpeed: 0.05, driftAmpX: 1.2, driftAmpY: 0.8, driftAmpZ: 0.5, phase: 0 },
  { baseX: 2.0, baseY: 0.0, baseZ: -4.0, radius: 1.2, driftSpeed: 0.04, driftAmpX: 0.9, driftAmpY: 1.0, driftAmpZ: 0.6, phase: 1.5 },
  { baseX: -0.5, baseY: -1.8, baseZ: -3.5, radius: 1.1, driftSpeed: 0.045, driftAmpX: 0.8, driftAmpY: 0.7, driftAmpZ: 0.4, phase: 3.0 },
  { baseX: -2.2, baseY: -0.5, baseZ: -2.5, radius: 1.0, driftSpeed: 0.055, driftAmpX: 0.7, driftAmpY: 0.9, driftAmpZ: 0.5, phase: 4.5 },
  { baseX: 1.2, baseY: 1.5, baseZ: -5.0, radius: 0.9, driftSpeed: 0.035, driftAmpX: 0.6, driftAmpY: 0.5, driftAmpZ: 0.3, phase: 2.0 },
];

// Digital dimension — spread right, different movement character
const BLOBS_B: BlobConfig[] = [
  { baseX: 1.8, baseY: -1.2, baseZ: -2.5, radius: 1.0, driftSpeed: 0.06, driftAmpX: 1.0, driftAmpY: 0.6, driftAmpZ: 0.7, phase: 2.0 },
  { baseX: -1.5, baseY: 0.8, baseZ: -3.5, radius: 1.5, driftSpeed: 0.035, driftAmpX: 0.7, driftAmpY: 1.1, driftAmpZ: 0.4, phase: 0.5 },
  { baseX: 1.0, baseY: 1.8, baseZ: -4.0, radius: 0.8, driftSpeed: 0.05, driftAmpX: 1.1, driftAmpY: 0.5, driftAmpZ: 0.6, phase: 4.0 },
  { baseX: 2.2, baseY: 0.2, baseZ: -3.0, radius: 1.3, driftSpeed: 0.045, driftAmpX: 0.9, driftAmpY: 0.8, driftAmpZ: 0.5, phase: 1.0 },
  { baseX: -1.0, baseY: -1.5, baseZ: -4.5, radius: 1.1, driftSpeed: 0.04, driftAmpX: 0.8, driftAmpY: 0.7, driftAmpZ: 0.4, phase: 3.5 },
];

function animateBlob(b: BlobConfig, time: number): [number, number, number] {
  const t = time * b.driftSpeed;
  return [
    b.baseX + Math.sin(t * 6.28 + b.phase) * b.driftAmpX,
    b.baseY + Math.cos(t * 6.28 * 0.7 + b.phase * 1.3) * b.driftAmpY,
    b.baseZ + Math.sin(t * 6.28 * 0.5 + b.phase * 2.0) * b.driftAmpZ,
  ];
}

// ── Component ──
export default function MetaballBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const initScene = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
    if (!gl) return;

    const THREE = await import("three");

    const tier = getQualityTier();
    const dpr = getEffectiveDPR(tier);
    const marchSteps = getMarchSteps(tier);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene = new THREE.Scene();

    const posA = BLOBS_A.map((b) => new THREE.Vector3(b.baseX, b.baseY, b.baseZ));
    const posB = BLOBS_B.map((b) => new THREE.Vector3(b.baseX, b.baseY, b.baseZ));
    const radA = BLOBS_A.map((b) => b.radius);
    const radB = BLOBS_B.map((b) => b.radius);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(
          window.innerWidth * dpr,
          window.innerHeight * dpr
        ),
      },
      uBlobPositionsA: { value: posA },
      uBlobPositionsB: { value: posB },
      uBlobRadiiA: { value: radA },
      uBlobRadiiB: { value: radB },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: buildFragmentShader(marchSteps),
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    function animate() {
      const time = clock.getElapsedTime();
      uniforms.uTime.value = time;

      for (let i = 0; i < 5; i++) {
        const [ax, ay, az] = animateBlob(BLOBS_A[i], time);
        posA[i].set(ax, ay, az);
        const [bx, by, bz] = animateBlob(BLOBS_B[i], time);
        posB[i].set(bx, by, bz);
      }

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentDpr = getEffectiveDPR(getQualityTier());
      renderer.setSize(w, h);
      renderer.setPixelRatio(currentDpr);
      uniforms.uResolution.value.set(w * currentDpr, h * currentDpr);
    }
    window.addEventListener("resize", onResize, { passive: true });

    function onVisibility() {
      if (document.hidden) {
        renderer.setAnimationLoop(null);
      } else {
        renderer.setAnimationLoop(animate);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    cleanupRef.current = () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    initScene();
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [initScene]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
