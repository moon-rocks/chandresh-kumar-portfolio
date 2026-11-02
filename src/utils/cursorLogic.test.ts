import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CURSOR_STATE,
  computeVelocityDeformation,
  lerpPoint,
  resolveCursorStateFromElement,
  shouldEnableCustomCursor,
} from './cursorLogic';

function createMockElement(matchedSelectors: string[], attributes: Record<string, string> = {}): Element {
  const mock = {
    matches(selector: string) {
      return selector
        .split(',')
        .map((s) => s.trim())
        .some((s) => matchedSelectors.includes(s));
    },
    closest(selector: string) {
      const parts = selector.split(',').map((s) => s.trim());
      if (parts.some((p) => matchedSelectors.includes(p))) {
        return mock as unknown as Element;
      }
      return null;
    },
    getAttribute(name: string) {
      return attributes[name] ?? null;
    },
  };
  return mock as unknown as Element;
}

test('shouldEnableCustomCursor enables only on fine pointer + hover desktop with motion active', () => {
  assert.equal(
    shouldEnableCustomCursor({
      hasFinePointer: true,
      hasHover: true,
      prefersReducedMotion: false,
      motionAttribute: 'on',
      viewportWidth: 1440,
    }),
    true
  );

  // Disabled on coarse/touch devices
  assert.equal(
    shouldEnableCustomCursor({
      hasFinePointer: false,
      hasHover: false,
      prefersReducedMotion: false,
      motionAttribute: 'on',
      viewportWidth: 390,
    }),
    false
  );

  // Disabled when prefers-reduced-motion is true
  assert.equal(
    shouldEnableCustomCursor({
      hasFinePointer: true,
      hasHover: true,
      prefersReducedMotion: true,
      motionAttribute: 'on',
      viewportWidth: 1440,
    }),
    false
  );

  // Disabled when site motion toggle is off
  assert.equal(
    shouldEnableCustomCursor({
      hasFinePointer: true,
      hasHover: true,
      prefersReducedMotion: false,
      motionAttribute: 'off',
      viewportWidth: 1440,
    }),
    false
  );

  // Disabled on mobile viewport width <= 700
  assert.equal(
    shouldEnableCustomCursor({
      hasFinePointer: true,
      hasHover: true,
      prefersReducedMotion: false,
      motionAttribute: 'on',
      viewportWidth: 700,
    }),
    false
  );
});

test('resolveCursorStateFromElement classifies default, interactive, card, media, and text targets', () => {
  assert.deepEqual(resolveCursorStateFromElement(null), DEFAULT_CURSOR_STATE);

  const buttonEl = createMockElement(['button']);
  const buttonState = resolveCursorStateFromElement(buttonEl);
  assert.equal(buttonState.mode, 'interactive');
  assert.equal(buttonState.label, '');
  assert.ok(buttonState.ringScale > 1);

  const filmCardEl = createMockElement(['.film-play', 'a']);
  const filmState = resolveCursorStateFromElement(filmCardEl);
  assert.equal(filmState.mode, 'card');
  assert.equal(filmState.label, 'OPEN');

  const caseStudyEl = createMockElement(['.project-image-link', 'a']);
  const caseState = resolveCursorStateFromElement(caseStudyEl);
  assert.equal(caseState.mode, 'card');
  assert.equal(caseState.label, 'CASE');

  const previewImgEl = createMockElement(['#showcase-memories-grid img']);
  const previewState = resolveCursorStateFromElement(previewImgEl);
  assert.equal(previewState.mode, 'media');
  assert.equal(previewState.label, 'PREVIEW');

  const inputEl = createMockElement([
    'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"])',
  ]);
  const textState = resolveCursorStateFromElement(inputEl);
  assert.equal(textState.mode, 'text');
  assert.equal(textState.dotScale, 0);
});

test('lerpPoint and computeVelocityDeformation produce bounded smooth values', () => {
  const next = lerpPoint({ x: 0, y: 0 }, { x: 100, y: 50 }, 0.2);
  assert.equal(next.x, 20);
  assert.equal(next.y, 10);

  const idle = computeVelocityDeformation(0, 0);
  assert.equal(idle.scaleX, 1);
  assert.equal(idle.scaleY, 1);

  const moving = computeVelocityDeformation(24, 0, 0.2);
  assert.ok(moving.scaleX > 1 && moving.scaleX <= 1.2);
  assert.ok(moving.scaleY < 1 && moving.scaleY >= 0.85);
  assert.equal(moving.angleDeg, 0);
});
