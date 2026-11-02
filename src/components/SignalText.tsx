import { useEffect, useRef } from 'react';
import { scrambleSignalText } from '../data/portfolioData';

interface SignalTextProps {
  children: string;
}

export function SignalText({ children }: SignalTextProps) {
  const liveRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = liveRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let rafId = 0;
    let startTime = 0;
    let lastTick = 0;
    let lastTrigger = -Infinity;

    const restore = () => {
      cancelAnimationFrame(rafId);
      el.textContent = children;
    };

    const isMotionEnabled = () =>
      !reducedMotion.matches && document.documentElement.dataset.motion !== 'off';

    const step = (now: number) => {
      if (!isMotionEnabled() || document.hidden) {
        restore();
        return;
      }
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / 520, 1);
      if (now - lastTick > 32) {
        el.textContent = scrambleSignalText(children, progress, now);
        lastTick = now;
      }
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        restore();
      }
    };

    const trigger = () => {
      if (!isMotionEnabled() || performance.now() - lastTrigger < 750) return;
      restore();
      startTime = 0;
      lastTick = 0;
      lastTrigger = performance.now();
      rafId = requestAnimationFrame(step);
    };

    const onPointerDown: EventListener = (e) => {
      if ((e as PointerEvent).pointerType === 'touch') {
        trigger();
      }
    };

    const interactiveTarget = el.closest('button, a') ?? el.parentElement;
    interactiveTarget?.addEventListener('pointerenter', trigger, { passive: true });
    interactiveTarget?.addEventListener('pointerdown', onPointerDown, { passive: true });
    interactiveTarget?.addEventListener('focusin', trigger);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trigger();
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);

    const handleMotionChange = () => {
      if (!isMotionEnabled()) restore();
    };

    const mutationObserver = new MutationObserver(handleMotionChange);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion'],
    });

    reducedMotion.addEventListener('change', handleMotionChange);
    document.addEventListener('visibilitychange', restore);

    return () => {
      restore();
      interactiveTarget?.removeEventListener('pointerenter', trigger);
      interactiveTarget?.removeEventListener('pointerdown', onPointerDown);
      interactiveTarget?.removeEventListener('focusin', trigger);
      observer.disconnect();
      mutationObserver.disconnect();
      reducedMotion.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', restore);
    };
  }, [children]);

  return (
    <span className="signal-text">
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="signal-text-size">
        {children}
      </span>
      <span aria-hidden="true" className="signal-text-live" ref={liveRef}>
        {children}
      </span>
    </span>
  );
}
