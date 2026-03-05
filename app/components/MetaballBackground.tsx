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
    uniform vec3 uBlobPositions[5];
    uniform vec3 uBlobColors[5];
    uniform float uBlobRadii[5];

    varying vec2 vUv;

    // Smooth minimum for organic merging
    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }

    float sdSphere(vec3 p, vec3 center, float radius) {
      return length(p - center) - radius;
    }

    float sceneSDF(vec3 p) {
      float d = sdSphere(p, uBlobPositions[0], uBlobRadii[0]);
      for (int i = 1; i < 5; i++) {
        float s = sdSphere(p, uBlobPositions[i], uBlobRadii[i]);
        d = smin(d, s, 0.9);
      }
      return d;
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

    vec3 blobColor(vec3 p) {
      vec3 col = vec3(0.0);
      float totalWeight = 0.0;
      for (int i = 0; i < 5; i++) {
        float dist = length(p - uBlobPositions[i]);
        float weight = 1.0 / (dist * dist + 0.05);
        col += uBlobColors[i] * weight;
        totalWeight += weight;
      }
      return col / totalWeight;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;

      // Ray setup
      vec3 ro = vec3(0.0, 0.0, 4.0); // camera position
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
        t += d * 0.6; // conservative step to avoid overshooting into surface
        if (t > 20.0) break;
      }

      if (!hit) {
        // Soft glow even on miss — atmospheric haze from nearby blobs
        float glow = 0.0;
        for (int i = 0; i < 5; i++) {
          vec3 midP = ro + rd * 5.0;
          float dist = length(midP - uBlobPositions[i]) - uBlobRadii[i];
          glow += uBlobRadii[i] * 0.15 / (dist * dist + 0.3);
        }
        vec3 glowCol = vec3(0.0);
        float totalW = 0.0;
        vec3 sampleP = ro + rd * 5.0;
        for (int i = 0; i < 5; i++) {
          float dist = length(sampleP - uBlobPositions[i]);
          float w = 1.0 / (dist * dist + 0.1);
          glowCol += uBlobColors[i] * w;
          totalW += w;
        }
        glowCol /= totalW;
        gl_FragColor = vec4(glowCol * glow, glow * 0.25);
        return;
      }

      // Surface shading
      vec3 normal = calcNormal(p);
      vec3 color = blobColor(p);

      // Lighting
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
      float diffuse = max(dot(normal, lightDir), 0.0);
      float ambient = 0.25;

      // Fresnel rim
      float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);

      // Specular
      vec3 halfDir = normalize(lightDir - rd);
      float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);

      // Combine
      vec3 litColor = clamp(color * (ambient + 0.55 * diffuse) + fresnel * color * 0.35 + spec * 0.15, 0.0, 1.0);

      // Depth fade
      float depthFade = smoothstep(20.0, 2.0, t);

      // Edge softness
      float edgeSoft = smoothstep(0.0, 0.15, -d + 0.15);

      float alpha = 0.5 * depthFade * edgeSoft;

      gl_FragColor = vec4(litColor, alpha);
    }
  `;
}

// ── Blob configuration ──
interface BlobConfig {
  baseX: number;
  baseY: number;
  baseZ: number;
  radius: number;
  color: [number, number, number];
  driftSpeed: number;
  driftAmpX: number;
  driftAmpY: number;
  driftAmpZ: number;
  phase: number;
}

const BLOBS: BlobConfig[] = [
  {
    // Violet — top left
    baseX: -2.2,
    baseY: 1.6,
    baseZ: -3.0,
    radius: 1.4,
    color: [0.643, 0.471, 0.941],
    driftSpeed: 0.05,
    driftAmpX: 1.2,
    driftAmpY: 0.8,
    driftAmpZ: 0.5,
    phase: 0,
  },
  {
    // Warm — right
    baseX: 2.5,
    baseY: 0.0,
    baseZ: -4.0,
    radius: 1.2,
    color: [0.957, 0.631, 0.259],
    driftSpeed: 0.04,
    driftAmpX: 0.9,
    driftAmpY: 1.0,
    driftAmpZ: 0.6,
    phase: 1.5,
  },
  {
    // Cyan — bottom center
    baseX: -0.5,
    baseY: -1.8,
    baseZ: -3.5,
    radius: 1.1,
    color: [0.22, 0.831, 0.784],
    driftSpeed: 0.045,
    driftAmpX: 0.8,
    driftAmpY: 0.7,
    driftAmpZ: 0.4,
    phase: 3.0,
  },
  {
    // Rose — mid left
    baseX: -2.2,
    baseY: -0.5,
    baseZ: -2.5,
    radius: 1.0,
    color: [0.91, 0.337, 0.478],
    driftSpeed: 0.055,
    driftAmpX: 0.7,
    driftAmpY: 0.9,
    driftAmpZ: 0.5,
    phase: 4.5,
  },
  {
    // Violet secondary — top right (deeper)
    baseX: 1.5,
    baseY: 1.5,
    baseZ: -5.0,
    radius: 0.9,
    color: [0.643, 0.471, 0.941],
    driftSpeed: 0.035,
    driftAmpX: 0.6,
    driftAmpY: 0.5,
    driftAmpZ: 0.3,
    phase: 2.0,
  },
];

// ── Component ──
export default function MetaballBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const initScene = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
    if (!gl) return;

    const THREE = await import("three");

    const tier = getQualityTier();
    const dpr = getEffectiveDPR(tier);
    const marchSteps = getMarchSteps(tier);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Camera (orthographic for fullscreen quad)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Scene
    const scene = new THREE.Scene();

    // Uniforms
    const blobPositions = BLOBS.map(
      (b) => new THREE.Vector3(b.baseX, b.baseY, b.baseZ)
    );
    const blobColors = BLOBS.map(
      (b) => new THREE.Color(b.color[0], b.color[1], b.color[2])
    );
    const blobRadii = BLOBS.map((b) => b.radius);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(
          window.innerWidth * dpr,
          window.innerHeight * dpr
        ),
      },
      uBlobPositions: { value: blobPositions },
      uBlobColors: { value: blobColors },
      uBlobRadii: { value: blobRadii },
    };

    // Material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: buildFragmentShader(marchSteps),
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    // Fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation
    const clock = new THREE.Clock();

    function animate() {
      const time = clock.getElapsedTime();
      uniforms.uTime.value = time;

      // Update blob positions
      for (let i = 0; i < BLOBS.length; i++) {
        const b = BLOBS[i];
        const t = time * b.driftSpeed;
        blobPositions[i].set(
          b.baseX + Math.sin(t * 6.28 + b.phase) * b.driftAmpX,
          b.baseY +
            Math.cos(t * 6.28 * 0.7 + b.phase * 1.3) * b.driftAmpY,
          b.baseZ +
            Math.sin(t * 6.28 * 0.5 + b.phase * 2.0) * b.driftAmpZ
        );
      }

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    // Resize
    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentDpr = getEffectiveDPR(getQualityTier());
      renderer.setSize(w, h);
      renderer.setPixelRatio(currentDpr);
      uniforms.uResolution.value.set(w * currentDpr, h * currentDpr);
    }
    window.addEventListener("resize", onResize, { passive: true });

    // Visibility API — pause when hidden
    function onVisibility() {
      if (document.hidden) {
        renderer.setAnimationLoop(null);
      } else {
        renderer.setAnimationLoop(animate);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    // Cleanup
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
