export type CursorMode = 'default' | 'interactive' | 'card' | 'media' | 'text';

export interface CursorState {
  mode: CursorMode;
  label: string;
  ringScale: number;
  dotScale: number;
  trailScale: number;
}

export interface CursorEnvironment {
  hasFinePointer: boolean;
  hasHover: boolean;
  prefersReducedMotion: boolean;
  motionAttribute?: string | null;
  viewportWidth: number;
}

export const DEFAULT_CURSOR_STATE: CursorState = {
  mode: 'default',
  label: '',
  ringScale: 1,
  dotScale: 1,
  trailScale: 1,
};

export function shouldEnableCustomCursor(env: CursorEnvironment): boolean {
  if (!env.hasFinePointer || !env.hasHover) {
    return false;
  }
  if (env.prefersReducedMotion) {
    return false;
  }
  if (env.motionAttribute === 'off') {
    return false;
  }
  if (env.viewportWidth <= 700) {
    return false;
  }
  return true;
}

const TEXT_INPUT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, select, [contenteditable="true"]';

const CARD_TARGET_SELECTOR =
  '[data-cursor-card], .film-play, .project-image-link, .work-index > a, .social-feature, .media-channel-link';

const MEDIA_TARGET_SELECTOR =
  '[data-cursor-media], #showcase-memories-grid img, .portrait-wrap, .stage-image, .editorial-photo, .film-preview';

const INTERACTIVE_TARGET_SELECTOR =
  'a, button, summary, [role="button"], .pill-link, .text-link, .tech-stack-tile, .impact-skills-tags li, input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], label';

export function resolveCursorStateFromElement(target: Element | null): CursorState {
  if (!target || typeof target.closest !== 'function') {
    return DEFAULT_CURSOR_STATE;
  }

  const textInput = target.closest(TEXT_INPUT_SELECTOR);
  if (textInput) {
    return {
      mode: 'text',
      label: '',
      ringScale: 0.35,
      dotScale: 0,
      trailScale: 0.25,
    };
  }

  const explicitLabelEl = target.closest('[data-cursor-label]');
  const explicitLabel = explicitLabelEl?.getAttribute('data-cursor-label')?.trim() || '';

  const cardTarget = target.closest(CARD_TARGET_SELECTOR);
  if (cardTarget) {
    let label = explicitLabel || 'OPEN';
    if (!explicitLabel) {
      if (cardTarget.matches('.project-image-link, .work-index > a')) {
        label = 'CASE';
      } else if (cardTarget.matches('.social-feature, .media-channel-link')) {
        label = 'EXPLORE';
      } else if (cardTarget.matches('.film-play')) {
        label = 'OPEN';
      }
    }
    return {
      mode: 'card',
      label,
      ringScale: 2.35,
      dotScale: 0.35,
      trailScale: 1.65,
    };
  }

  const mediaTarget = target.closest(MEDIA_TARGET_SELECTOR);
  if (mediaTarget) {
    let label = explicitLabel || 'INSPECT';
    if (!explicitLabel && mediaTarget.matches('#showcase-memories-grid img')) {
      label = 'PREVIEW';
    }
    return {
      mode: 'media',
      label,
      ringScale: 2.05,
      dotScale: 0.45,
      trailScale: 1.45,
    };
  }

  const interactiveTarget = target.closest(INTERACTIVE_TARGET_SELECTOR);
  if (interactiveTarget) {
    return {
      mode: 'interactive',
      label: explicitLabel,
      ringScale: 1.6,
      dotScale: 0.55,
      trailScale: 1.3,
    };
  }

  return DEFAULT_CURSOR_STATE;
}

export function lerpPoint(
  current: { x: number; y: number },
  target: { x: number; y: number },
  factor: number
): { x: number; y: number } {
  const clampedFactor = Math.max(0, Math.min(1, factor));
  return {
    x: current.x + (target.x - current.x) * clampedFactor,
    y: current.y + (target.y - current.y) * clampedFactor,
  };
}

export function computeVelocityDeformation(
  vx: number,
  vy: number,
  maxStretch = 0.22
): { angleDeg: number; scaleX: number; scaleY: number } {
  const speed = Math.hypot(vx, vy);
  if (speed < 0.5) {
    return { angleDeg: 0, scaleX: 1, scaleY: 1 };
  }
  const normalized = Math.min(speed / 48, 1);
  const stretch = normalized * maxStretch;
  const angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
  return {
    angleDeg,
    scaleX: Number((1 + stretch).toFixed(4)),
    scaleY: Number((1 - stretch * 0.55).toFixed(4)),
  };
}
