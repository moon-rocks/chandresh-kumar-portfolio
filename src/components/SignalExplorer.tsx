import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import * as THREE from 'three';
import {
  ABOUT_PERSPECTIVES,
  IMPACT_PERSPECTIVES,
  getPerspectiveItem,
} from '../data/portfolioData';
import {
  getResponsiveAnimationProfile,
  shouldRunAmbientWebGL,
} from '../utils/responsiveAnimationLogic';
import { SignalText } from './SignalText';

interface SignalExplorerProps {
  impact?: boolean;
}

export function SignalExplorer({ impact = false }: SignalExplorerProps) {
  const initialIndex = 0;
  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  const selectedRef = useRef<number>(initialIndex);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<number>(0);

  useEffect(() => {
    let cleanupThree: (() => void) | undefined;
    let triggerLoop: (() => void) | undefined;
    const container = visualRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isIntersecting = false;
    let isInitializing = false;
    let hasFailed = false;
    let generation = 0;

    const syncScene = () => {
      const canRun = shouldRunAmbientWebGL({
        prefersReducedMotion: reducedMotion.matches,
        motionAttribute: document.documentElement.dataset.motion,
        liveEffectsEnabled: true,
      });
      if (!canRun) {
        generation++;
        cleanupThree?.();
        cleanupThree = undefined;
        triggerLoop = undefined;
        isInitializing = false;
        return;
      }
      if (!isIntersecting || isInitializing || cleanupThree || hasFailed) {
        triggerLoop?.();
        return;
      }

      isInitializing = true;
      const currentGen = ++generation;
      try {
        if (generation !== currentGen) return;
        const profile = getResponsiveAnimationProfile(
          window.innerWidth || 1280,
          window.devicePixelRatio || 1
        );
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(profile.maxDpr, 1.25));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
        camera.position.z = impact ? 6 : profile.isMobile ? 5.35 : 5.1;

        const particleCount = profile.signalParticleCount;
        const cols = profile.isMobile ? 40 : 60;
        const rows = Math.max(1, Math.floor(particleCount / cols));

        const geometry = new THREE.BufferGeometry();
        const posBuild = new Float32Array(particleCount * 3);
        const posTeach = new Float32Array(particleCount * 3);
        const posConnect = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
          const u = (i % cols) / Math.max(cols - 1, 1);
          const v = Math.floor(i / cols) / Math.max(rows - 1, 1);
          posBuild.set([(u - 0.5) * 3, (v - 0.5) * 2.8, 0.12 * Math.sin(18 * u)], 3 * i);

          const angle = u * Math.PI * 2;
          const radius = 0.2 + 1.5 * v;
          posTeach.set(
            [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.2 * Math.sin(8 * radius)],
            3 * i
          );

          const y = 1 - (2 * i) / Math.max(particleCount - 1, 1);
          const theta = 2.399963 * i;
          const r = Math.sqrt(Math.max(0, 1 - y * y));
          posConnect.set(
            [Math.cos(theta) * r * 1.6, 1.6 * y, Math.sin(theta) * r * 1.6],
            3 * i
          );
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posBuild, 3));
        geometry.setAttribute('aTeach', new THREE.BufferAttribute(posTeach, 3));
        geometry.setAttribute('aConnect', new THREE.BufferAttribute(posConnect, 3));

        const uniforms = {
          uTime: { value: 0 },
          uWeights: {
            value: new THREE.Vector3(
              +(selectedRef.current === 0),
              +(selectedRef.current === 1),
              +(selectedRef.current === 2)
            ),
          },
          uPointer: { value: new THREE.Vector2(4, 4) },
          uPulse: { value: 0 },
        };

        const material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms,
          vertexShader: `
            attribute vec3 aTeach;
            attribute vec3 aConnect;
            uniform vec3 uWeights;
            uniform float uTime;
            uniform float uPulse;
            uniform vec2 uPointer;
            varying float vGlow;
            void main() {
              vec3 p = position * uWeights.x + aTeach * uWeights.y + aConnect * uWeights.z;
              float d = distance(p.xy, uPointer);
              float wave = sin(length(p.xy) * 9. - uTime * 2.5);
              p.z += wave * (.06 + .2 * uWeights.y);
              p.xy += normalize(p.xy + vec2(.001)) * sin(d * 7. - uTime * 4.) * exp(-d * 1.5) * .16;
              p *= 1. + uPulse * .08;
              vGlow = .45 + .4 * exp(-d * 2.) + .15 * wave;
              vec4 mv = modelViewMatrix * vec4(p, 1.);
              gl_Position = projectionMatrix * mv;
              gl_PointSize = clamp(13. / -mv.z, 1., 4.);
            }
          `,
          fragmentShader: `
            varying float vGlow;
            void main() {
              float d = length(gl_PointCoord - .5);
              if (d > .5) discard;
              vec3 col = mix(vec3(.68, .65, .59), vec3(1., .48, .22), smoothstep(.45, .9, vGlow));
              gl_FragColor = vec4(col, (1. - smoothstep(.1, .5, d)) * .85);
            }
          `,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        container.appendChild(renderer.domElement);
        container.dataset.live = 'true';

        const targetWeights = new THREE.Vector3();
        let timerId = 0;
        let rafId = 0;
        let isDisposed = false;

        const updateSize = () => {
          const w = container.clientWidth || 300;
          const h = container.clientHeight || 300;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);
        updateSize();

        const renderStep = (now: number) => {
          rafId = 0;
          if (!isIntersecting || document.hidden || isDisposed) return;

          uniforms.uTime.value = 0.001 * now;
          uniforms.uWeights.value.lerp(
            targetWeights.set(
              +(selectedRef.current === 0),
              +(selectedRef.current === 1),
              +(selectedRef.current === 2)
            ),
            0.065
          );
          uniforms.uPulse.value += (pulseRef.current - uniforms.uPulse.value) * 0.13;
          pulseRef.current *= 0.93;
          points.rotation.y = 0.18 * Math.sin(0.00015 * now);
          renderer.render(scene, camera);

          timerId = window.setTimeout(() => {
            if (isIntersecting && !document.hidden && !isDisposed) {
              rafId = requestAnimationFrame(renderStep);
            }
          }, 48);
        };

        triggerLoop = () => {
          if (!isIntersecting || document.hidden) {
            cancelAnimationFrame(rafId);
            clearTimeout(timerId);
            rafId = 0;
            timerId = 0;
          } else if (!rafId && !timerId && !isDisposed) {
            rafId = requestAnimationFrame(renderStep);
          }
        };

        const updatePointerFromClient = (clientX: number, clientY: number) => {
          const rect = container.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          uniforms.uPointer.value.set(
            ((clientX - rect.left) / rect.width) * 4 - 2,
            2 - ((clientY - rect.top) / rect.height) * 4
          );
        };

        const onPointerMove = (e: PointerEvent) => {
          updatePointerFromClient(e.clientX, e.clientY);
        };
        const onPointerDown = (e: PointerEvent) => {
          updatePointerFromClient(e.clientX, e.clientY);
          pulseRef.current = 0.85;
        };
        const onPointerLeave = () => uniforms.uPointer.value.set(4, 4);
        const onContextLost = () => {
          isDisposed = true;
          hasFailed = true;
          cancelAnimationFrame(rafId);
          clearTimeout(timerId);
          renderer.domElement.style.visibility = 'hidden';
          delete container.dataset.live;
        };

        renderer.debug.onShaderError = onContextLost;
        renderer.domElement.addEventListener('webglcontextlost', onContextLost);
        container.addEventListener('pointermove', onPointerMove, { passive: true });
        container.addEventListener('pointerdown', onPointerDown, { passive: true });
        container.addEventListener('pointerleave', onPointerLeave, { passive: true });
        container.addEventListener('pointercancel', onPointerLeave, { passive: true });

        const onVisibilityChange = () => triggerLoop?.();
        document.addEventListener('visibilitychange', onVisibilityChange);

        cleanupThree = () => {
          isDisposed = true;
          cancelAnimationFrame(rafId);
          clearTimeout(timerId);
          resizeObserver.disconnect();
          container.removeEventListener('pointermove', onPointerMove);
          container.removeEventListener('pointerdown', onPointerDown);
          container.removeEventListener('pointerleave', onPointerLeave);
          container.removeEventListener('pointercancel', onPointerLeave);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
          delete container.dataset.live;
        };

        isInitializing = false;
        triggerLoop();
      } catch {
        hasFailed = true;
        isInitializing = false;
        cleanupThree?.();
        cleanupThree = undefined;
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = Boolean(entry?.isIntersecting);
      syncScene();
    });
    intersectionObserver.observe(container);

    const mutationObserver = new MutationObserver(() => syncScene());
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion'],
    });

    reducedMotion.addEventListener('change', syncScene);

    return () => {
      generation++;
      cleanupThree?.();
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      reducedMotion.removeEventListener('change', syncScene);
    };
  }, [impact]);

  const items = impact ? IMPACT_PERSPECTIVES : ABOUT_PERSPECTIVES;
  const activeItem = getPerspectiveItem(impact, selectedIndex);

  return (
    <div className={`signal-explorer ${impact ? 'signal-impact' : 'signal-about'}`}>
      <div className="signal-topline">
        <span className="eyebrow">
          {impact ? 'HOW THE IMPACT TRAVELS' : 'THREE DISCIPLINES. ONE PERSPECTIVE.'}
        </span>
        <span aria-hidden="true">0{selectedIndex + 1} / 03</span>
      </div>
      <div className="signal-visual" ref={visualRef} aria-hidden="true">
        <div className={`signal-fallback shape-${activeItem.shape}`}>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="signal-center-label">
          <SignalText>{activeItem.shape.toUpperCase()}</SignalText>
        </span>
      </div>
      <div
        className="signal-options"
        role="group"
        aria-label={impact ? 'Explore how impact travels' : 'Explore my disciplines'}
      >
        {items.map((item, idx) => (
          <button
            key={item.name}
            type="button"
            aria-pressed={selectedIndex === idx}
            onClick={() => {
              selectedRef.current = idx;
              pulseRef.current = 1;
              setSelectedIndex(idx);
            }}
          >
            {item.name}
            <span aria-hidden="true">
              <ArrowUpRight size={13} />
            </span>
          </button>
        ))}
      </div>
      <div className="signal-story" aria-live="polite">
        <h3>{activeItem.title}</h3>
        <p>{activeItem.copy}</p>
        {activeItem.focusItems && activeItem.focusItems.length > 0 && (
          <ul className="signal-focus-list">
            {activeItem.focusItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {activeItem.featuredProjects && activeItem.featuredProjects.length > 0 && (
          <ul className="signal-focus-list">
            {activeItem.featuredProjects.map((project) => (
              <li key={project.name}>
                <strong>{project.name}:</strong> {project.description}
              </li>
            ))}
          </ul>
        )}
        {activeItem.technologies && (
          <p className="signal-tech-summary">
            <strong>Technologies:</strong> {activeItem.technologies}
          </p>
        )}
        <a
          className="text-link"
          href={activeItem.href}
          onClick={(e) => {
            if (activeItem.href.startsWith('#')) {
              const target = document.getElementById(activeItem.href.slice(1));
              if (target) {
                e.preventDefault();
                window.history.pushState({}, '', activeItem.href);
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
        >
          {activeItem.link} <ArrowUpRight size={14} />
        </a>
      </div>
      <p className="signal-hint">Choose a perspective.</p>
    </div>
  );
}
