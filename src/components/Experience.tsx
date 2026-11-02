import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionConfig, narrative } from '../data/portfolioData';
import {
  computePortraitPointClassification,
  getResponsiveAnimationProfile,
  shouldRunAmbientWebGL,
} from '../utils/responsiveAnimationLogic';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
});

const PORTRAIT_MESH_VERTEX_SHADER = `
attribute float aLum;
attribute float aFaceMask;
attribute float aEdgeWeight;
attribute float aRimWeight;
uniform float uTime;
uniform float uIntro;
uniform float uProgress;
uniform float uScale;
varying vec2 vUv;
varying float vLum;
varying float vFaceMask;
varying float vEdgeWeight;
varying float vRimWeight;
void main() {
  vUv = uv;
  vLum = aLum;
  vFaceMask = aFaceMask;
  vEdgeWeight = aEdgeWeight;
  vRimWeight = aRimWeight;

  float p = smoothstep(.02, .76, uProgress);
  float nonFace = 1. - aFaceMask * .78;
  float relief = aLum * .022 * uIntro * nonFace;
  float breath = sin(uTime * 1.15 + position.y * 5.5 + position.x * 4.) * .0024 * uIntro * (1. - aFaceMask);

  vec3 pos = position;
  pos.z += relief + breath - p * .1;
  pos.xy *= 1. + p * .045 * (1. - aFaceMask * .65);

  vec4 mv = modelViewMatrix * vec4(pos * uScale, 1.);
  gl_Position = projectionMatrix * mv;
}
`;

const PORTRAIT_MESH_FRAGMENT_SHADER = `
uniform sampler2D uMap;
uniform float uTime;
uniform float uIntro;
uniform float uProgress;
varying vec2 vUv;
varying float vLum;
varying float vFaceMask;
varying float vEdgeWeight;
varying float vRimWeight;
void main() {
  vec4 tex = texture2D(uMap, vUv);
  vec2 vigDelta = vec2((vUv.x - .5) / .46, (vUv.y - .56) / .48);
  float vignette = 1. - smoothstep(.42, .88, length(vigDelta));
  float lumaMask = smoothstep(.01, .048, vLum);
  float scrollFade = 1. - smoothstep(.08, .66, uProgress);
  float alpha = tex.a * vignette * lumaMask * scrollFade;
  if (alpha < .01) discard;

  vec3 crispPhoto = mix(tex.rgb, clamp(pow(tex.rgb, vec3(.95)) * 1.05, 0., 1.), vFaceMask * .42);
  float rimPulse = (.12 + .06 * sin(uTime * 1.7 + vUv.y * 5.)) * uIntro;
  vec3 orangeRim = vec3(1., .46, .16) * vRimWeight * rimPulse * (1. - vFaceMask * .72);
  float contourWave = .5 + .5 * sin(vUv.y * 38. - uTime * 1.5);
  vec3 contourSheen = vec3(1., .52, .22) * vEdgeWeight * contourWave * .075 * uIntro * (1. - vFaceMask);

  vec3 finalColor = crispPhoto + orangeRim + contourSheen;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

const WIREFRAME_VERTEX_SHADER = `
attribute float aLum;
attribute float aFaceMask;
attribute float aEdgeWeight;
attribute float aRimWeight;
uniform float uTime;
uniform float uIntro;
uniform float uProgress;
uniform float uScale;
varying float vLum;
varying float vFaceMask;
varying float vEdgeWeight;
varying float vRimWeight;
varying float vPosY;
void main() {
  vLum = aLum;
  vFaceMask = aFaceMask;
  vEdgeWeight = aEdgeWeight;
  vRimWeight = aRimWeight;
  vPosY = position.y;

  float p = smoothstep(.02, .78, uProgress);
  float wave = sin(uTime * 1.4 + position.y * 9. + position.x * 7.) * .0045 * uIntro * (1. - aFaceMask);
  vec3 pos = position;
  pos.z += aLum * .028 * uIntro * (1. - aFaceMask * .8) + .004 + wave + p * .04;
  pos.xy *= 1. + p * .08 * (1. - aFaceMask * .5);

  vec4 mv = modelViewMatrix * vec4(pos * uScale, 1.);
  gl_Position = projectionMatrix * mv;
}
`;

const WIREFRAME_FRAGMENT_SHADER = `
uniform float uTime;
uniform float uIntro;
uniform float uProgress;
varying float vLum;
varying float vFaceMask;
varying float vEdgeWeight;
varying float vRimWeight;
varying float vPosY;
void main() {
  float faceGuard = 1. - smoothstep(.12, .58, vFaceMask);
  float scan = .55 + .45 * sin(vPosY * 22. - uTime * 1.8);
  float scrollBoost = smoothstep(.02, .24, uProgress) * (1. - smoothstep(.32, .76, uProgress));
  float idleWire = (vRimWeight * .42 + vEdgeWeight * .28) * faceGuard * uIntro * scan;
  float scrollWire = (vRimWeight * .55 + vEdgeWeight * .45 + vLum * .22) * (1. - vFaceMask * .6) * scrollBoost;
  float alpha = (idleWire + scrollWire) * smoothstep(.5, .34, abs(vPosY));
  if (alpha < .012) discard;

  vec3 silverWire = vec3(.76, .72, .66);
  vec3 orangeWire = vec3(1., .47, .18);
  vec3 col = mix(silverWire, orangeWire, clamp(vRimWeight * 1.35 + scrollBoost * .4, 0., 1.));
  gl_FragColor = vec4(col, min(alpha, .38));
}
`;

const PARTICLE_VERTEX_SHADER = `
attribute vec3 aColor;
attribute float aSeed;
attribute float aFaceMask;
attribute float aRimWeight;
attribute float aScrollOnly;
uniform float uTime;
uniform float uIntro;
uniform float uProgress;
uniform float uScale;
uniform float uDpr;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float p = smoothstep(.02, .8, uProgress);
  vec3 target = vec3(
    (aSeed - .5) * 2.5,
    sin(aSeed * 25.1327) * .055 + (floor(position.x * 4. + 2.) - 2.) * .18,
    sin(aSeed * 18.) * .1
  );
  vec3 pos = mix(position, target, p);
  float nonFace = 1. - aFaceMask;
  float edge = smoothstep(.18, .48, abs(position.x)) * nonFace;
  float drift = uIntro * nonFace;
  pos.x += sin(uTime * .45 + aSeed * 40.) * .0065 * (edge * drift + p);
  pos.y += cos(uTime * .38 + aSeed * 28.) * .004 * (edge * drift + p * .5);
  pos.z += sin(aSeed * 64. + uTime * .35) * .014 * (drift + p);

  vec4 mv = modelViewMatrix * vec4(pos * uScale, 1.);
  gl_Position = projectionMatrix * mv;

  float luma = dot(aColor, vec3(.299, .587, .114));
  gl_PointSize = (1.1 + (luma * .75 + aRimWeight * .55) * (.85 + .15 * uIntro)) * uDpr;

  vec3 warmOrange = vec3(1., .45, .17);
  vColor = mix(aColor, warmOrange, clamp(aRimWeight * .55 * uIntro + p * .58, 0., 1.));

  float scrollReveal = smoothstep(.03, .26, uProgress);
  float idleMask = (1. - aScrollOnly) * (1. - aFaceMask * .96) * (.58 + aRimWeight * .42) * uIntro;
  float activeAlpha = mix(idleMask, 1. - p * .35, scrollReveal);
  vAlpha = activeAlpha * smoothstep(.5, .36, abs(position.y));
}
`;

const PARTICLE_FRAGMENT_SHADER = `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - .5);
  float alpha = smoothstep(.5, .22, d) * vAlpha;
  if (alpha < .02) discard;
  gl_FragColor = vec4(vColor * 1.22, alpha);
}
`;

interface HeroPortraitCanvasProps {
  onFailure: () => void;
  onReady: () => void;
}

function HeroPortraitCanvas({ onFailure, onReady }: HeroPortraitCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let rafId = 0;
    let timerId = 0;
    let pointsGeometry: THREE.BufferGeometry | null = null;
    let meshGeometry: THREE.PlaneGeometry | null = null;
    let wireGeometry: THREE.PlaneGeometry | null = null;
    let pointsMaterial: THREE.ShaderMaterial | null = null;
    let meshMaterial: THREE.ShaderMaterial | null = null;
    let wireMaterial: THREE.ShaderMaterial | null = null;
    let portraitTexture: THREE.Texture | null = null;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const profile = getResponsiveAnimationProfile(
        window.innerWidth || 1280,
        window.devicePixelRatio || 1
      );
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !profile.isMobile,
        powerPreference: 'high-performance',
      });
      const dpr = Math.min(profile.maxDpr, Math.max(motionConfig.maxDpr, 2));
      renderer.setPixelRatio(dpr);
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 6);

      const portraitGroup = new THREE.Group();
      scene.add(portraitGroup);

      pointsMaterial = new THREE.ShaderMaterial({
        vertexShader: PARTICLE_VERTEX_SHADER,
        fragmentShader: PARTICLE_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uProgress: { value: 0 },
          uScale: { value: 1 },
          uDpr: { value: dpr },
        },
      });

      let sceneReady = false;
      let fallbackMetrics = { height: 800, top: 60 };
      let viewportHeight = 2 * Math.tan((42 * Math.PI) / 360) * 6;
      let screenHeight = window.innerHeight || 900;

      const updateMetrics = () => {
        if (!renderer || isDisposed) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        screenHeight = h;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        viewportHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;

        const fallbackEl = document.querySelector('.artifact-fallback');
        if (fallbackEl) {
          const rect = fallbackEl.getBoundingClientRect();
          const backdropRect = fallbackEl.closest('.scene-backdrop')?.getBoundingClientRect();
          fallbackMetrics = {
            height: rect.height || (w <= 700 ? 440 : 700),
            top: rect.top - (backdropRect?.top ?? 0),
          };
        }
      };

      updateMetrics();
      window.addEventListener('resize', updateMetrics, { passive: true });
      const metricsResizeObserver = new ResizeObserver(updateMetrics);
      metricsResizeObserver.observe(container);
      const fallbackElForObserver = document.querySelector('.artifact-fallback');
      if (fallbackElForObserver) {
        metricsResizeObserver.observe(fallbackElForObserver);
      }

      let heroIntersecting = true;
      const heroEl = document.querySelector('.hero');
      const heroObserver = new IntersectionObserver((entries) => {
        heroIntersecting = entries.some((e) => e.isIntersecting);
      });
      if (heroEl) heroObserver.observe(heroEl);

      let readyFired = false;
      let readyTime = 0;
      const startTime = performance.now();
      let lastTime = startTime;

      const animate = (now: number) => {
        rafId = 0;
        if (isDisposed || !renderer || !pointsMaterial) return;

        const dt = Math.min((now - lastTime) * 0.001, 0.1);
        lastTime = now;

        if (!document.hidden && heroIntersecting && sceneReady) {
          if (!readyFired) {
            readyFired = true;
            readyTime = now;
            onReady();
          }

          const elapsed = (now - startTime) * 0.001;
          const sinceReady = Math.max(0, (now - readyTime) * 0.001);
          // Hold clean sharp photograph briefly (0.3s), then smoothly transition (1.5s) into 3D mesh/wireframe/particles
          const rawIntro = Math.max(0, Math.min(1, (sinceReady - 0.3) / 1.5));
          const introProgress = 1 - Math.pow(1 - rawIntro, 3);

          const dampedProgress = THREE.MathUtils.damp(
            pointsMaterial.uniforms.uProgress.value,
            narrative.hero,
            3,
            dt
          );
          const scaleVal = (fallbackMetrics.height * viewportHeight) / screenHeight;
          const currentDpr = renderer.getPixelRatio();

          pointsMaterial.uniforms.uTime.value = elapsed;
          pointsMaterial.uniforms.uIntro.value = introProgress;
          pointsMaterial.uniforms.uProgress.value = dampedProgress;
          pointsMaterial.uniforms.uScale.value = scaleVal;
          pointsMaterial.uniforms.uDpr.value = currentDpr;

          if (meshMaterial) {
            meshMaterial.uniforms.uTime.value = elapsed;
            meshMaterial.uniforms.uIntro.value = introProgress;
            meshMaterial.uniforms.uProgress.value = dampedProgress;
            meshMaterial.uniforms.uScale.value = scaleVal;
          }

          if (wireMaterial) {
            wireMaterial.uniforms.uTime.value = elapsed;
            wireMaterial.uniforms.uIntro.value = introProgress;
            wireMaterial.uniforms.uProgress.value = dampedProgress;
            wireMaterial.uniforms.uScale.value = scaleVal;
          }

          portraitGroup.position.y =
            viewportHeight / 2 -
            ((fallbackMetrics.top + fallbackMetrics.height / 2) * viewportHeight) /
              screenHeight;
          portraitGroup.rotation.y = THREE.MathUtils.damp(
            portraitGroup.rotation.y,
            0.016 * narrative.pointerX * introProgress,
            3,
            dt
          );
          portraitGroup.rotation.x = THREE.MathUtils.damp(
            portraitGroup.rotation.x,
            0.008 * narrative.pointerY * introProgress,
            3,
            dt
          );

          renderer.render(scene, camera);
        }

        timerId = window.setTimeout(() => {
          if (!isDisposed) {
            rafId = requestAnimationFrame(animate);
          }
        }, 36);
      };

      const buildPlaneAttributes = (
        geo: THREE.PlaneGeometry,
        cols: number,
        rows: number,
        data: Uint8ClampedArray
      ) => {
        const uvAttr = geo.attributes.uv;
        const vCount = uvAttr.count;
        const lumArr = new Float32Array(vCount);
        const faceMaskArr = new Float32Array(vCount);
        const edgeWeightArr = new Float32Array(vCount);
        const rimWeightArr = new Float32Array(vCount);

        for (let idx = 0; idx < vCount; idx++) {
          const u = uvAttr.getX(idx);
          const v = uvAttr.getY(idx);
          const nx = u;
          const ny = 0.1 + (1 - v) * 0.8;
          const x = Math.min(cols - 1, Math.max(0, Math.round(nx * (cols - 1))));
          const y = Math.min(rows - 1, Math.max(0, Math.round(ny * (rows - 1))));
          const pIdx = (y * cols + x) * 4;

          const xL = Math.max(0, x - 1);
          const xR = Math.min(cols - 1, x + 1);
          const yU = Math.max(0, y - 1);
          const yD = Math.min(rows - 1, y + 1);
          const lumL = data[(y * cols + xL) * 4] / 255;
          const lumR = data[(y * cols + xR) * 4] / 255;
          const lumU = data[(yU * cols + x) * 4] / 255;
          const lumD = data[(yD * cols + x) * 4] / 255;
          const grad = Math.min(1, Math.hypot(lumR - lumL, lumD - lumU));

          const cls = computePortraitPointClassification(
            nx,
            ny,
            data[pIdx],
            data[pIdx + 1],
            data[pIdx + 2],
            grad,
            0.5
          );
          lumArr[idx] = cls.lum;
          faceMaskArr[idx] = cls.faceMask;
          edgeWeightArr[idx] = cls.edgeWeight;
          rimWeightArr[idx] = cls.rimWeight;
        }

        geo.setAttribute('aLum', new THREE.BufferAttribute(lumArr, 1));
        geo.setAttribute('aFaceMask', new THREE.BufferAttribute(faceMaskArr, 1));
        geo.setAttribute('aEdgeWeight', new THREE.BufferAttribute(edgeWeightArr, 1));
        geo.setAttribute('aRimWeight', new THREE.BufferAttribute(rimWeightArr, 1));
      };

      const img = new Image();
      img.onload = () => {
        if (isDisposed || !pointsMaterial) return;
        try {
          const cols = profile.heroPortraitCols;
          const rows = Math.round(1.25 * cols);
          const offscreen = document.createElement('canvas');
          offscreen.width = cols;
          offscreen.height = rows;
          const ctx = offscreen.getContext('2d');
          if (!ctx) {
            onFailure();
            return;
          }
          const targetRatio = cols / rows;
          const imgRatio = img.width / img.height;
          let dx = 0;
          let dy = 0;
          let dw = cols;
          let dh = rows;
          if (imgRatio > targetRatio) {
            dh = Math.round(cols / imgRatio);
            dy = Math.round((rows - dh) * 0.5);
          } else if (imgRatio < targetRatio) {
            dw = Math.round(rows * imgRatio);
            dx = Math.round((cols - dw) * 0.5);
          }
          ctx.clearRect(0, 0, cols, rows);
          ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
          const { data } = ctx.getImageData(0, 0, cols, rows);

          // 1. High-resolution portrait relief mesh (preserves crisp facial detail)
          portraitTexture = new THREE.Texture(img);
          portraitTexture.minFilter = THREE.LinearFilter;
          portraitTexture.magFilter = THREE.LinearFilter;
          portraitTexture.generateMipmaps = false;
          portraitTexture.needsUpdate = true;

          const meshSegs = profile.heroMeshSegments;
          meshGeometry = new THREE.PlaneGeometry(0.8, 0.8, meshSegs, meshSegs);
          buildPlaneAttributes(meshGeometry, cols, rows, data);

          meshMaterial = new THREE.ShaderMaterial({
            vertexShader: PORTRAIT_MESH_VERTEX_SHADER,
            fragmentShader: PORTRAIT_MESH_FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
            uniforms: {
              uMap: { value: portraitTexture },
              uTime: { value: 0 },
              uIntro: { value: 0 },
              uProgress: { value: 0 },
              uScale: { value: 1 },
            },
          });
          const portraitMesh = new THREE.Mesh(meshGeometry, meshMaterial);
          portraitMesh.renderOrder = 1;
          portraitGroup.add(portraitMesh);

          // 2. Architectural 3D wireframe contour mesh (concentrated on hat, rim light & silhouette)
          const wireSegs = Math.max(36, Math.round(meshSegs * 0.56));
          wireGeometry = new THREE.PlaneGeometry(0.8, 0.8, wireSegs, wireSegs);
          buildPlaneAttributes(wireGeometry, cols, rows, data);

          wireMaterial = new THREE.ShaderMaterial({
            vertexShader: WIREFRAME_VERTEX_SHADER,
            fragmentShader: WIREFRAME_FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
            wireframe: true,
            blending: THREE.AdditiveBlending,
            uniforms: {
              uTime: { value: 0 },
              uIntro: { value: 0 },
              uProgress: { value: 0 },
              uScale: { value: 1 },
            },
          });
          const wireframeMesh = new THREE.Mesh(wireGeometry, wireMaterial);
          wireframeMesh.renderOrder = 2;
          portraitGroup.add(wireframeMesh);

          // 3. 3D Particle cloud (rim/silhouette active in idle, full portrait active on scroll)
          const posArr: number[] = [];
          const colArr: number[] = [];
          const seedArr: number[] = [];
          const faceMaskArr: number[] = [];
          const rimWeightArr: number[] = [];
          const scrollOnlyArr: number[] = [];

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const i = (y * cols + x) * 4;
              const xL = Math.max(0, x - 1);
              const xR = Math.min(cols - 1, x + 1);
              const yU = Math.max(0, y - 1);
              const yD = Math.min(rows - 1, y + 1);
              const lumL = data[(y * cols + xL) * 4] / 255;
              const lumR = data[(y * cols + xR) * 4] / 255;
              const lumU = data[(yU * cols + x) * 4] / 255;
              const lumD = data[(yD * cols + x) * 4] / 255;
              const grad = Math.min(1, Math.hypot(lumR - lumL, lumD - lumU));
              const hash = ((127 * x + 311 * y) % 997) / 997;

              const cls = computePortraitPointClassification(
                x / cols,
                y / rows,
                data[i],
                data[i + 1],
                data[i + 2],
                grad,
                hash
              );

              const isScrollReserve = !cls.emitParticle && cls.lum >= 0.038 && hash < 0.28;
              if (cls.emitParticle || isScrollReserve) {
                posArr.push((x / cols - 0.5) * 0.8, 0.5 - y / rows, 0.025 * cls.lum + 0.006);
                colArr.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
                seedArr.push(hash);
                faceMaskArr.push(cls.faceMask);
                rimWeightArr.push(cls.rimWeight);
                scrollOnlyArr.push(isScrollReserve ? 1 : 0);
              }
            }
          }

          pointsGeometry = new THREE.BufferGeometry();
          pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
          pointsGeometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colArr, 3));
          pointsGeometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seedArr, 1));
          pointsGeometry.setAttribute(
            'aFaceMask',
            new THREE.Float32BufferAttribute(faceMaskArr, 1)
          );
          pointsGeometry.setAttribute(
            'aRimWeight',
            new THREE.Float32BufferAttribute(rimWeightArr, 1)
          );
          pointsGeometry.setAttribute(
            'aScrollOnly',
            new THREE.Float32BufferAttribute(scrollOnlyArr, 1)
          );

          const points = new THREE.Points(pointsGeometry, pointsMaterial);
          points.renderOrder = 3;
          portraitGroup.add(points);

          sceneReady = true;
          updateMetrics();
          rafId = requestAnimationFrame(animate);
        } catch {
          onFailure();
        }
      };
      img.onerror = onFailure;
      img.src = '/assets/aistudio/icon_d3d95310.png';

      const handleContextLost = () => onFailure();
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost, {
        once: true,
      });

      return () => {
        isDisposed = true;
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
        img.onload = null;
        img.onerror = null;
        heroObserver.disconnect();
        metricsResizeObserver.disconnect();
        window.removeEventListener('resize', updateMetrics);
        renderer?.domElement.removeEventListener('webglcontextlost', handleContextLost);
        pointsGeometry?.dispose();
        meshGeometry?.dispose();
        wireGeometry?.dispose();
        pointsMaterial?.dispose();
        meshMaterial?.dispose();
        wireMaterial?.dispose();
        portraitTexture?.dispose();
        renderer?.dispose();
        renderer?.domElement.remove();
      };
    } catch {
      onFailure();
      return;
    }
  }, [onFailure, onReady]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

interface ExperienceProps {
  pathname: string;
  isHome?: boolean;
}

export function Experience({ pathname, isHome = true }: ExperienceProps) {
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [webglSupported, setWebglSupported] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [liveEffectsEnabled, setLiveEffectsEnabled] = useState(true);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const handleFailure = useCallback(() => {
    setWebglSupported(false);
    setWebglReady(false);
  }, []);

  const handleReady = useCallback(() => {
    setWebglReady(true);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      let stored: string | null = null;
      try {
        stored = sessionStorage.getItem('motion');
      } catch {
        stored = null;
      }
      setMotionEnabled(!reducedMotion.matches && stored !== 'off');
    };
    syncMotion();
    reducedMotion.addEventListener('change', syncMotion);

    const mobileMedia = window.matchMedia('(max-width: 700px)');
    const syncMobile = () => {
      setIsMobile(mobileMedia.matches);
    };
    syncMobile();
    mobileMedia.addEventListener('change', syncMobile);
    setMounted(true);

    return () => {
      reducedMotion.removeEventListener('change', syncMotion);
      mobileMedia.removeEventListener('change', syncMobile);
    };
  }, []);

  useEffect(() => {
    setWebglReady(false);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (
      shouldRunAmbientWebGL({
        prefersReducedMotion: reducedMotion.matches,
        motionAttribute: motionEnabled ? 'on' : 'off',
        liveEffectsEnabled,
      })
    ) {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        setWebglSupported(Boolean(gl));
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        setWebglSupported(false);
      }
    } else {
      setWebglSupported(false);
    }
  }, [motionEnabled, liveEffectsEnabled]);

  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off';
    narrative.hero = 0;

    let refreshTimer = 0;
    const profile = getResponsiveAnimationProfile(
      window.innerWidth || 1280,
      window.devicePixelRatio || 1
    );

    const ctx = gsap.context(() => {
      const heroEl = document.querySelector('.hero');
      if (heroEl) {
        ScrollTrigger.create({
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => {
            narrative.hero = self.progress;
          },
        });
      }

      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          narrative.progress = self.progress;
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      const revealSelector = '[data-reveal], [data-editorial-reveal]';

      if (motionEnabled) {
        if (heroEl) {
          gsap.fromTo(
            '.hero .reveal-line',
            { yPercent: 100, filter: profile.isMobile ? 'blur(2px)' : 'blur(5px)' },
            {
              yPercent: 0,
              filter: 'blur(0px)',
              duration: profile.isMobile ? 0.95 : 1.2,
              stagger: 0.1,
              ease: 'power4.out',
              clearProps: 'transform,filter',
            }
          );
          gsap.fromTo(
            '.hero-description > p',
            { filter: 'blur(2px)', y: 8, opacity: 0.2 },
            {
              filter: 'blur(0px)',
              y: 0,
              opacity: 1,
              duration: 0.7,
              delay: 0.12,
              ease: 'power2.out',
              clearProps: 'filter,transform,opacity',
            }
          );
          gsap.to('.hero-content', {
            y: profile.isMobile ? -32 : -65,
            opacity: profile.isMobile ? 0.48 : 0.35,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero',
              start: '25% top',
              end: 'bottom top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        const revealElements = gsap.utils.toArray<HTMLElement>(revealSelector);
        revealElements.forEach((el) => {
          gsap.fromTo(
            el,
            { y: profile.revealDistanceY, opacity: 0.01 },
            {
              y: 0,
              opacity: 1,
              duration: profile.revealDuration,
              ease: motionConfig.ease,
              scrollTrigger: {
                trigger: el,
                start: 'top 93%',
                toggleActions: 'play none none none',
                once: true,
              },
              clearProps: 'transform,opacity',
            }
          );
        });
      } else {
        gsap.set(revealSelector, { clearProps: 'all' });
        gsap.set('.hero .reveal-line, .hero-description > p, .hero-content', {
          clearProps: 'all',
        });
      }
    });

    refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);

    let resizeDebounce = 0;
    const onResize = () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    };

    const onPointerMove = (e: PointerEvent) => {
      narrative.pointerX = e.clientX / Math.max(window.innerWidth, 1) - 0.5;
      narrative.pointerY = e.clientY / Math.max(window.innerHeight, 1) - 0.5;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      narrative.pointerX = touch.clientX / Math.max(window.innerWidth, 1) - 0.5;
      narrative.pointerY = touch.clientY / Math.max(window.innerHeight, 1) - 0.5;
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      clearTimeout(refreshTimer);
      clearTimeout(resizeDebounce);
      ctx.revert();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [motionEnabled, pathname]);

  return (
    <>
      <div className="scroll-progress" ref={progressRef} />
      {isHome && (
        <div className="scene-backdrop" aria-hidden="true">
          <div
            className={`artifact-fallback ${
              motionEnabled && liveEffectsEnabled && webglSupported && webglReady
                ? 'webgl-active'
                : ''
            }`}
          >
            <img
              src="/assets/aistudio/icon_d3d95310.png"
              alt="Chandresh Kumar"
              width={1000}
              height={1250}
              sizes="(max-width:700px) 90vw, 650px"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          {mounted && motionEnabled && liveEffectsEnabled && webglSupported && (
            <HeroPortraitCanvas onFailure={handleFailure} onReady={handleReady} />
          )}
        </div>
      )}
      {isHome && mounted && isMobile && (
        <button
          className="quality-toggle"
          onClick={() => {
            setLiveEffectsEnabled((prev) => {
              const next = !prev;
              if (next) setMotionEnabled(true);
              return next;
            });
          }}
          aria-pressed={liveEffectsEnabled}
        >
          {liveEffectsEnabled ? 'Disable live effects' : 'Enable live effects'}
        </button>
      )}
      <button
        className="motion-toggle"
        onClick={() => {
          setMotionEnabled((prev) => {
            const next = !prev;
            try {
              sessionStorage.setItem('motion', next ? 'on' : 'off');
            } catch {
              // ignore storage errors
            }
            return next;
          });
        }}
        aria-label={
          motionEnabled ? 'Motion on — pause animations' : 'Motion off — enable animations'
        }
        aria-pressed={motionEnabled}
      >
        {motionEnabled ? <Pause size={11} /> : <Play size={11} />}
        <span>MOTION {motionEnabled ? 'ON' : 'OFF'}</span>
      </button>
    </>
  );
}
