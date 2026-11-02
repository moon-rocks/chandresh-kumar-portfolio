import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyViewportTier,
  computePortraitPointClassification,
  getResponsiveAnimationProfile,
  shouldRunAmbientWebGL,
} from './responsiveAnimationLogic';

test('classifyViewportTier maps 320, 375, 390, 430, 768, 1024, and 1440 accurately', () => {
  assert.equal(classifyViewportTier(320), 'mobile-xs');
  assert.equal(classifyViewportTier(375), 'mobile');
  assert.equal(classifyViewportTier(390), 'mobile');
  assert.equal(classifyViewportTier(430), 'mobile');
  assert.equal(classifyViewportTier(768), 'tablet');
  assert.equal(classifyViewportTier(1024), 'tablet');
  assert.equal(classifyViewportTier(1280), 'laptop');
  assert.equal(classifyViewportTier(1440), 'desktop');
});

test('getResponsiveAnimationProfile scales particle counts, mesh segments, DPR, and reveal distances for mobile vs desktop', () => {
  const p320 = getResponsiveAnimationProfile(320, 3);
  assert.equal(p320.isMobile, true);
  assert.equal(p320.heroPortraitCols, 128);
  assert.equal(p320.heroMeshSegments, 64);
  assert.equal(p320.signalParticleCount, 1200);
  assert.equal(p320.maxDpr, 1.5);
  assert.equal(p320.revealDistanceY, 20);

  const p390 = getResponsiveAnimationProfile(390, 2);
  assert.equal(p390.isMobile, true);
  assert.equal(p390.heroPortraitCols, 156);
  assert.equal(p390.heroMeshSegments, 80);
  assert.equal(p390.signalParticleCount, 1200);

  const p768 = getResponsiveAnimationProfile(768, 2);
  assert.equal(p768.isTablet, true);
  assert.equal(p768.heroPortraitCols, 200);
  assert.equal(p768.heroMeshSegments, 96);
  assert.equal(p768.signalParticleCount, 1800);
  assert.equal(p768.revealDistanceY, 26);

  const p1440 = getResponsiveAnimationProfile(1440, 2);
  assert.equal(p1440.isMobile, false);
  assert.equal(p1440.heroPortraitCols, 240);
  assert.equal(p1440.heroMeshSegments, 112);
  assert.equal(p1440.signalParticleCount, 2400);
  assert.equal(p1440.maxDpr, 2);
});

test('computePortraitPointClassification protects facial clarity and emits particles on warm rim and silhouette', () => {
  const centerFace = computePortraitPointClassification(0.455, 0.485, 195, 190, 185, 0.12, 0.2);
  assert.ok(centerFace.faceMask > 0.95);
  assert.equal(centerFace.emitParticle, false);

  const warmRim = computePortraitPointClassification(0.68, 0.34, 245, 130, 35, 0.22, 0.3);
  assert.ok(warmRim.faceMask < 0.2);
  assert.ok(warmRim.rimWeight > 0.5);
  assert.equal(warmRim.emitParticle, true);
});

test('shouldRunAmbientWebGL enables WebGL on mobile and desktop unless reduced motion or toggled off', () => {
  assert.equal(
    shouldRunAmbientWebGL({
      prefersReducedMotion: false,
      motionAttribute: 'on',
      liveEffectsEnabled: true,
    }),
    true
  );

  assert.equal(
    shouldRunAmbientWebGL({
      prefersReducedMotion: true,
      motionAttribute: 'on',
      liveEffectsEnabled: true,
    }),
    false
  );

  assert.equal(
    shouldRunAmbientWebGL({
      prefersReducedMotion: false,
      motionAttribute: 'off',
      liveEffectsEnabled: true,
    }),
    false
  );

  assert.equal(
    shouldRunAmbientWebGL({
      prefersReducedMotion: false,
      motionAttribute: 'on',
      liveEffectsEnabled: false,
    }),
    false
  );
});

