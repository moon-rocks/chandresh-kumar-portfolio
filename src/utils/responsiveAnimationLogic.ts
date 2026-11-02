export type ViewportTier = 'mobile-xs' | 'mobile' | 'tablet' | 'laptop' | 'desktop';

export interface ResponsiveAnimationProfile {
  tier: ViewportTier;
  isMobile: boolean;
  isTablet: boolean;
  revealDistanceY: number;
  revealDuration: number;
  revealStagger: number;
  heroPortraitCols: number;
  heroMeshSegments: number;
  signalParticleCount: number;
  maxDpr: number;
}

export interface PortraitPointClassification {
  lum: number;
  warmth: number;
  faceDist: number;
  faceMask: number;
  edgeWeight: number;
  rimWeight: number;
  emitParticle: boolean;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Computes facial protection mask, warm rim-light weight, and silhouette particle eligibility
 * for normalized portrait image coordinates (nx, ny in [0, 1], top-left origin).
 * Ensures the face remains clean, sharp, and free of particle noise while concentrating
 * artistic particles and wireframe effects around the hat, rim light, and silhouette edges.
 */
export function computePortraitPointClassification(
  nx: number,
  ny: number,
  r255: number,
  g255: number,
  b255: number,
  gradNormalized: number,
  deterministicHash: number
): PortraitPointClassification {
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const warmth = Math.max(0, r - b);

  // Core facial region (forehead, eyes, nose, cheeks, lips, chin, ear)
  const faceCx = 0.455;
  const faceCy = 0.485;
  const faceRx = 0.215;
  const faceRy = 0.235;
  const faceDist = Math.hypot((nx - faceCx) / faceRx, (ny - faceCy) / faceRy);

  // 1.0 inside core face -> 0.0 on hat brim, rim light, and outer silhouette
  const faceMask = 1 - smoothstep(0.72, 1.16, faceDist);

  const rimWeight = Math.min(1, warmth * 2.4 + gradNormalized * 1.35);
  const edgeWeight = Math.min(1, (1 - faceMask) * (gradNormalized * 2.2 + warmth * 1.8));

  // Never spawn stipple particles over the core face; spawn along silhouette, hat contour, and orange rim
  let emitParticle = false;
  if (lum >= 0.028 && faceDist >= 0.96) {
    if (warmth >= 0.075 || gradNormalized >= 0.048) {
      emitParticle = deterministicHash < 0.72;
    } else if (faceDist >= 1.12 && ny <= 0.88) {
      emitParticle = deterministicHash < 0.16;
    }
  }

  return {
    lum,
    warmth,
    faceDist,
    faceMask,
    edgeWeight,
    rimWeight,
    emitParticle,
  };
}

export interface PortraitContainUvResult {
  u: number;
  v: number;
  inside: boolean;
}

export interface PortraitMotionTransform {
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
}

/**
 * Maps normalized container box coordinates (boxUvX, boxUvY in [0, 1], top-left origin)
 * to normalized image coordinates (u, v in [0, 1], top-left origin) using `object-fit: contain`
 * math so a 1:1 portrait inside a 4:5 container is never stretched or squashed.
 */
export function computePortraitContainUv(
  boxUvX: number,
  boxUvY: number,
  boxAspect: number,
  imageAspect: number
): PortraitContainUvResult {
  const safeBoxAspect = boxAspect > 0 ? boxAspect : 0.8;
  const safeImageAspect = imageAspect > 0 ? imageAspect : 1.0;

  let u = boxUvX;
  let v = boxUvY;

  if (safeImageAspect > safeBoxAspect) {
    const relativeHeight = safeBoxAspect / safeImageAspect;
    v = (boxUvY - 0.5) / relativeHeight + 0.5;
  } else if (safeImageAspect < safeBoxAspect) {
    const relativeWidth = safeImageAspect / safeBoxAspect;
    u = (boxUvX - 0.5) / relativeWidth + 0.5;
  }

  const inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;
  return { u, v, inside };
}

/**
 * Computes the vertical editorial fade mask matching `.artifact-fallback`:
 * 1.0 from 0% to 50%, 0.52 at 74%, 0.0 at 93% of container height.
 */
export function computePortraitMaskAlpha(boxUvY: number): number {
  const topFade = smoothstep(0.0, 0.03, boxUvY);
  let bottomFade = 1.0;
  if (boxUvY > 0.5) {
    const seg1 = 1.0 - smoothstep(0.5, 0.74, boxUvY) * 0.48;
    const seg2 = 1.0 - smoothstep(0.74, 0.93, boxUvY);
    bottomFade = seg1 * seg2;
  }
  return topFade * bottomFade;
}

/**
 * Computes smooth, natural 3D rigid-plane transform (breathing float, pointer parallax,
 * subtle 3D perspective tilt, and scroll elevation) without stretching or warping the portrait.
 */
export function computePortraitMotionTransform(params: {
  baseCenterX: number;
  baseCenterY: number;
  baseWorldW: number;
  baseWorldH: number;
  elapsedSeconds: number;
  pointerX: number;
  pointerY: number;
  scrollProgress: number;
}): PortraitMotionTransform {
  const {
    baseCenterX,
    baseCenterY,
    baseWorldW,
    baseWorldH,
    elapsedSeconds,
    pointerX,
    pointerY,
    scrollProgress,
  } = params;

  const p = smoothstep(0.0, 0.85, Math.max(0, Math.min(1, scrollProgress)));
  const clampedPtrX = Math.max(-0.5, Math.min(0.5, pointerX));
  const clampedPtrY = Math.max(-0.5, Math.min(0.5, pointerY));

  const breathScale = 1 + Math.sin(elapsedSeconds * 1.15) * 0.0075 - p * 0.03;
  const floatY = Math.sin(elapsedSeconds * 1.15) * 0.011 * baseWorldH;
  const floatX = Math.cos(elapsedSeconds * 0.75) * 0.005 * baseWorldW;

  const parallaxX = clampedPtrX * 0.036 * baseWorldW;
  const parallaxY = -clampedPtrY * 0.024 * baseWorldH;
  const scrollOffsetY = p * 0.11 * baseWorldH;

  const rotationY = clampedPtrX * 0.075 + Math.sin(elapsedSeconds * 0.65) * 0.014;
  const rotationX = -clampedPtrY * 0.05 + Math.cos(elapsedSeconds * 0.55) * 0.01;

  return {
    positionX: baseCenterX + floatX + parallaxX,
    positionY: baseCenterY + floatY + parallaxY + scrollOffsetY,
    positionZ: -p * 0.22,
    rotationX,
    rotationY,
    scaleX: baseWorldW * breathScale,
    scaleY: baseWorldH * breathScale,
  };
}

export function classifyViewportTier(width: number): ViewportTier {
  if (width <= 360) return 'mobile-xs';
  if (width <= 700) return 'mobile';
  if (width <= 1024) return 'tablet';
  if (width <= 1366) return 'laptop';
  return 'desktop';
}

export function getResponsiveAnimationProfile(
  width: number,
  devicePixelRatio = 1
): ResponsiveAnimationProfile {
  const tier = classifyViewportTier(width);
  const isMobile = tier === 'mobile-xs' || tier === 'mobile';
  const isTablet = tier === 'tablet';

  if (isMobile) {
    return {
      tier,
      isMobile: true,
      isTablet: false,
      revealDistanceY: 20,
      revealDuration: 0.72,
      revealStagger: 0.06,
      heroPortraitCols: width <= 360 ? 120 : 150,
      heroMeshSegments: width <= 360 ? 64 : 80,
      signalParticleCount: 1200,
      maxDpr: Math.min(Math.max(devicePixelRatio, 1), 1.25),
    };
  }

  if (isTablet) {
    return {
      tier,
      isMobile: false,
      isTablet: true,
      revealDistanceY: 26,
      revealDuration: 0.82,
      revealStagger: 0.08,
      heroPortraitCols: 200,
      heroMeshSegments: 96,
      signalParticleCount: 1800,
      maxDpr: Math.min(Math.max(devicePixelRatio, 1), 1.5),
    };
  }

  return {
    tier,
    isMobile: false,
    isTablet: false,
    revealDistanceY: 34,
    revealDuration: 0.9,
    revealStagger: 0.1,
    heroPortraitCols: 300,
    heroMeshSegments: 112,
    signalParticleCount: 2400,
    maxDpr: Math.min(Math.max(devicePixelRatio, 1), 1.5),
  };
}

export function shouldRunAmbientWebGL(options: {
  prefersReducedMotion: boolean;
  motionAttribute?: string | null;
  liveEffectsEnabled: boolean;
}): boolean {
  if (options.prefersReducedMotion) return false;
  if (options.motionAttribute === 'off') return false;
  if (!options.liveEffectsEnabled) return false;
  return true;
}


