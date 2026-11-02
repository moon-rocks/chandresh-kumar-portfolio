import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  CursorState,
  DEFAULT_CURSOR_STATE,
  computeVelocityDeformation,
  lerpPoint,
  resolveCursorStateFromElement,
  shouldEnableCustomCursor,
} from '../utils/cursorLogic';

interface CustomCursorProps {
  pathname: string;
}

export function CustomCursor({ pathname }: CustomCursorProps) {
  const [enabled, setEnabled] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>(DEFAULT_CURSOR_STATE);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);

  const pointerPosRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const trailPosRef = useRef({ x: -100, y: -100 });
  const hasMovedRef = useRef(false);
  const modeRef = useRef<CursorState['mode']>('default');

  useEffect(() => {
    modeRef.current = cursorState.mode;
  }, [cursorState.mode]);

  // Evaluate environment capabilities (desktop fine pointer + hover, reduced motion, site motion toggle)
  useEffect(() => {
    const finePointerMq = window.matchMedia('(pointer: fine)');
    const hoverMq = window.matchMedia('(hover: hover)');
    const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluateCapability = () => {
      const motionAttr = document.documentElement.getAttribute('data-motion');
      const nextEnabled = shouldEnableCustomCursor({
        hasFinePointer: finePointerMq.matches,
        hasHover: hoverMq.matches,
        prefersReducedMotion: reducedMotionMq.matches,
        motionAttribute: motionAttr,
        viewportWidth: window.innerWidth,
      });
      setEnabled(nextEnabled);
    };

    evaluateCapability();

    finePointerMq.addEventListener('change', evaluateCapability);
    hoverMq.addEventListener('change', evaluateCapability);
    reducedMotionMq.addEventListener('change', evaluateCapability);
    window.addEventListener('resize', evaluateCapability, { passive: true });

    const htmlObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-motion') {
          evaluateCapability();
        }
      }
    });
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion'],
    });

    return () => {
      finePointerMq.removeEventListener('change', evaluateCapability);
      hoverMq.removeEventListener('change', evaluateCapability);
      reducedMotionMq.removeEventListener('change', evaluateCapability);
      window.removeEventListener('resize', evaluateCapability);
      htmlObserver.disconnect();
    };
  }, []);

  // Toggle html.has-custom-cursor class only when custom cursor is enabled
  useEffect(() => {
    const htmlEl = document.documentElement;
    if (enabled) {
      htmlEl.classList.add('has-custom-cursor');
    } else {
      htmlEl.classList.remove('has-custom-cursor');
      setIsVisible(false);
      setIsPressed(false);
      setCursorState(DEFAULT_CURSOR_STATE);
      hasMovedRef.current = false;
    }
    return () => {
      htmlEl.classList.remove('has-custom-cursor');
    };
  }, [enabled]);

  // Reset hover state on route changes and re-probe element under pointer if already moved
  useEffect(() => {
    if (!enabled) return;
    setIsPressed(false);
    if (hasMovedRef.current && pointerPosRef.current.x >= 0 && pointerPosRef.current.y >= 0) {
      const raf = requestAnimationFrame(() => {
        const el = document.elementFromPoint(pointerPosRef.current.x, pointerPosRef.current.y);
        setCursorState(resolveCursorStateFromElement(el));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setCursorState(DEFAULT_CURSOR_STATE);
    }
  }, [pathname, enabled]);

  // GSAP ticker & pointer tracking loop
  useEffect(() => {
    if (!enabled) return;

    const dotEl = dotRef.current;
    const ringEl = ringRef.current;
    const trailEl = trailRef.current;
    if (!dotEl || !ringEl || !trailEl) return;

    const setDotX = gsap.quickSetter(dotEl, 'x', 'px');
    const setDotY = gsap.quickSetter(dotEl, 'y', 'px');
    const setRingX = gsap.quickSetter(ringEl, 'x', 'px');
    const setRingY = gsap.quickSetter(ringEl, 'y', 'px');
    const setTrailX = gsap.quickSetter(trailEl, 'x', 'px');
    const setTrailY = gsap.quickSetter(trailEl, 'y', 'px');
    const setTrailRotate = gsap.quickSetter(trailEl, 'rotation', 'deg');

    const updateTargetFromPoint = (clientX: number, clientY: number, eventTarget?: EventTarget | null) => {
      const el =
        eventTarget instanceof Element
          ? eventTarget
          : document.elementFromPoint(clientX, clientY);
      const nextState = resolveCursorStateFromElement(el);
      setCursorState((prev) =>
        prev.mode === nextState.mode && prev.label === nextState.label ? prev : nextState
      );
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;

      const { clientX, clientY } = e;
      pointerPosRef.current.x = clientX;
      pointerPosRef.current.y = clientY;

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        ringPosRef.current.x = clientX;
        ringPosRef.current.y = clientY;
        trailPosRef.current.x = clientX;
        trailPosRef.current.y = clientY;
        setDotX(clientX);
        setDotY(clientY);
        setRingX(clientX);
        setRingY(clientY);
        setTrailX(clientX);
        setTrailY(clientY);
      }

      setIsVisible(true);
      updateTargetFromPoint(clientX, clientY, e.target);
    };

    const handlePointerOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      updateTargetFromPoint(e.clientX, e.clientY, e.target);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      setIsPressed(true);
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeaveDocument = () => {
      setIsVisible(false);
      setIsPressed(false);
    };

    const handleMouseEnterDocument = () => {
      if (hasMovedRef.current) {
        setIsVisible(true);
      }
    };

    const handleScroll = () => {
      if (!hasMovedRef.current) return;
      const { x, y } = pointerPosRef.current;
      if (x >= 0 && y >= 0) {
        const el = document.elementFromPoint(x, y);
        const nextState = resolveCursorStateFromElement(el);
        setCursorState((prev) =>
          prev.mode === nextState.mode && prev.label === nextState.label ? prev : nextState
        );
      }
    };

    const onTick = () => {
      if (!hasMovedRef.current) return;

      const target = pointerPosRef.current;
      const dtRatio = Math.min(gsap.ticker.deltaRatio(60), 2.5);

      // Immediate precision dot
      setDotX(target.x);
      setDotY(target.y);

      // Smooth outer ring interpolation
      const ringFactor = 1 - Math.pow(1 - 0.24, dtRatio);
      const nextRing = lerpPoint(ringPosRef.current, target, ringFactor);
      ringPosRef.current = nextRing;
      setRingX(nextRing.x);
      setRingY(nextRing.y);

      // Subtle trailing aura interpolation + velocity orientation
      const trailFactor = 1 - Math.pow(1 - 0.12, dtRatio);
      const vx = target.x - trailPosRef.current.x;
      const vy = target.y - trailPosRef.current.y;
      const nextTrail = lerpPoint(trailPosRef.current, target, trailFactor);
      trailPosRef.current = nextTrail;
      setTrailX(nextTrail.x);
      setTrailY(nextTrail.y);

      if (modeRef.current === 'default') {
        const deform = computeVelocityDeformation(vx * 0.25, vy * 0.25, 0.18);
        setTrailRotate(deform.angleDeg);
      } else {
        setTrailRotate(0);
      }
    };

    gsap.ticker.add(onTick);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('blur', handleMouseLeaveDocument);
    document.documentElement.addEventListener('mouseleave', handleMouseLeaveDocument);
    document.documentElement.addEventListener('mouseenter', handleMouseEnterDocument);

    return () => {
      gsap.ticker.remove(onTick);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('blur', handleMouseLeaveDocument);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeaveDocument);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnterDocument);
    };
  }, [enabled]);

  // Animate scale & visual states smoothly with GSAP when mode or press state changes
  useEffect(() => {
    if (!enabled) return;
    const dotEl = dotRef.current;
    const ringEl = ringRef.current;
    const trailEl = trailRef.current;
    if (!dotEl || !ringEl || !trailEl) return;

    const pressMultiplier = isPressed ? 0.84 : 1;
    const dotPressMultiplier = isPressed ? 1.35 : 1;

    gsap.to(dotEl, {
      scale: cursorState.dotScale * dotPressMultiplier,
      duration: 0.22,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    gsap.to(ringEl, {
      scale: cursorState.ringScale * pressMultiplier,
      duration: 0.34,
      ease: 'expo.out',
      overwrite: 'auto',
    });

    gsap.to(trailEl, {
      scale: cursorState.trailScale * pressMultiplier,
      duration: 0.48,
      ease: 'expo.out',
      overwrite: 'auto',
    });
  }, [enabled, cursorState, isPressed]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={`custom-cursor-root ${isVisible ? 'is-visible' : ''} ${
        isPressed ? 'is-pressed' : ''
      }`}
      data-cursor-mode={cursorState.mode}
      data-testid="custom-cursor"
      aria-hidden="true"
    >
      <div ref={trailRef} className="custom-cursor-trail" />
      <div ref={ringRef} className="custom-cursor-ring">
        <span className="custom-cursor-ring-tick custom-cursor-ring-tick--n" />
        <span className="custom-cursor-ring-tick custom-cursor-ring-tick--e" />
        <span className="custom-cursor-ring-tick custom-cursor-ring-tick--s" />
        <span className="custom-cursor-ring-tick custom-cursor-ring-tick--w" />
        {cursorState.label && (
          <span className="custom-cursor-label">{cursorState.label}</span>
        )}
      </div>
      <div ref={dotRef} className="custom-cursor-dot" />
    </div>
  );
}
