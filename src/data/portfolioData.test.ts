import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHORIZED_ADMIN_EMAIL,
  CertificateRecord,
  IMPACT_TECHNICAL_SKILLS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_PROJECTS,
  INITIAL_SKILLS,
  INITIAL_VISIBLE_PROJECTS_COUNT,
  LEARNING_JOURNEY_HEADING,
  LEARNING_JOURNEY_ITEMS,
  LEARNING_JOURNEY_SUBTITLE,
  NAV_LINKS,
  PROOF_STRIP_CTA_CATEGORY,
  SHOWCASE_CATEGORIES,
  SHOWCASE_FILTERS,
  TECH_STACK_CATEGORIES,
  VIDEOS,
  TECH_BADGES,
  INITIAL_EDUCATION,
  buildTechStackCategories,
  encodeShowcaseRoleAndCategory,
  extractStorageObjectPath,
  filterShowcaseItems,
  filterVideos,
  formatFilmCount,
  formatProjectCategory,
  getPublishedAchievementMetrics,
  getPublishedProofStripCta,
  getPublishedShowcaseItems,
  getVisibleVideos,
  getPerspectiveItem,
  getThinkingPath,
  mapProjectToVideoItem,
  normalizeCertificateRecord,
  parseProjectMetadata,
  scrambleSignalText,
  resolveRoute,
  normalizeProjectSlug,
  normalizeSupabaseUrl,
  isAuthorizedAdminEmail,
  isAuthorizedAdminUser,
  validateContactPayload,
  validateShowcaseInput,
} from './portfolioData.ts';

test('filterVideos and getVisibleVideos display 5 projects by default and expand/collapse accurately', () => {
  const all = filterVideos(VIDEOS, 'All modules');
  assert.equal(all.length, 6);
  assert.equal(formatFilmCount(all.length), '06 SELECTED MODULES');

  const collapsed = getVisibleVideos(all, false, INITIAL_VISIBLE_PROJECTS_COUNT);
  assert.equal(collapsed.visible.length, 5);
  assert.equal(collapsed.hasMore, true);
  assert.equal(collapsed.hiddenCount, 1);

  const expanded = getVisibleVideos(all, true, INITIAL_VISIBLE_PROJECTS_COUNT);
  assert.equal(expanded.visible.length, 6);
  assert.equal(expanded.hasMore, true);

  const webCloud = filterVideos(VIDEOS, 'Web & Cloud');
  assert.equal(webCloud.length, 3);
  assert.ok(webCloud.every((v) => v.category === 'Web & Cloud'));
  const filteredCollapsed = getVisibleVideos(webCloud, false, INITIAL_VISIBLE_PROJECTS_COUNT);
  assert.equal(filteredCollapsed.visible.length, 3);
  assert.equal(filteredCollapsed.hasMore, false);

  const csAiLabs = filterVideos(VIDEOS, 'CS & AI Labs');
  assert.equal(csAiLabs.length, 3);
  assert.ok(csAiLabs.every((v) => v.category === 'CS & AI Labs'));
});

test('TECH_STACK_CATEGORIES organizes verified technologies with official icon keys and roles', () => {
  assert.equal(TECH_STACK_CATEGORIES.length, 4);
  for (const cat of TECH_STACK_CATEGORIES) {
    assert.ok(cat.index.length === 2, `Category ${cat.id} missing 2-digit index`);
    assert.ok(cat.title.length > 0, `Category ${cat.id} missing title`);
    assert.ok(cat.columns === 2 || cat.columns === 3, `Category ${cat.id} invalid column count`);
    for (const item of cat.items) {
      assert.ok(item.role.length > 0, `Item ${item.name} missing role descriptor`);
    }
  }
  const allTechNames = TECH_STACK_CATEGORIES.flatMap((c) => c.items.map((i) => i.name));
  for (const required of [
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'HTML5',
    'CSS3',
    'Tailwind CSS',
    'GSAP',
    'Figma',
    'Node.js',
    'Express.js',
    'Supabase',
    'PostgreSQL',
    'Git',
    'GitHub',
  ]) {
    assert.ok(allTechNames.includes(required), `Missing required tech: ${required}`);
  }
});

test('getPerspectiveItem returns Learn, Practice, and Explore with verified content and destinations', () => {
  const learn = getPerspectiveItem(false, 0);
  assert.equal(learn.name, 'Learn');
  assert.equal(learn.title, 'Building Strong Foundations');
  assert.equal(learn.link, 'Explore My Education');
  assert.equal(learn.href, '#education');
  assert.equal(learn.shape, 'structure');
  assert.equal(learn.focusItems?.length, 4);

  const practice = getPerspectiveItem(false, 1);
  assert.equal(practice.name, 'Practice');
  assert.equal(practice.title, 'Learn by Building. Improve by Solving.');
  assert.equal(practice.link, 'Discover My Learning Journey');
  assert.equal(practice.href, '#journey');
  assert.equal(practice.shape, 'ripples');
  assert.equal(practice.focusItems?.length, 4);

  const explore = getPerspectiveItem(false, 2);
  assert.equal(explore.name, 'Explore');
  assert.equal(explore.title, 'Turning Ideas into Working Applications.');
  assert.equal(explore.link, 'Explore My Projects');
  assert.equal(explore.href, '#content');
  assert.equal(explore.shape, 'constellation');
  assert.equal(explore.featuredProjects?.length, 4);
  assert.ok(explore.technologies?.includes('PostgreSQL'));
  assert.ok(explore.technologies?.includes('FastAPI'));

  const impactThird = getPerspectiveItem(true, 99);
  assert.equal(impactThird.name, 'Explore');
  assert.equal(impactThird.shape, 'constellation');

  assert.equal(LEARNING_JOURNEY_HEADING, 'My Learning Journey');
  assert.equal(
    LEARNING_JOURNEY_SUBTITLE,
    'From secondary academic foundations to Computer Science & Engineering and practical full-stack web builds.'
  );
  assert.equal(LEARNING_JOURNEY_ITEMS.length, 2);
  assert.equal(LEARNING_JOURNEY_ITEMS[0].heading, 'PHASE 01 — Academic Foundation (2025)');
  assert.equal(
    LEARNING_JOURNEY_ITEMS[1].heading,
    'PHASE 02 — Diploma in Computer Science & Engineering (2025–Present)'
  );
});

test('getThinkingPath resolves active discipline, process steps, and synchronized section links', () => {
  const defaultPath = getThinkingPath(null);
  assert.equal(defaultPath.name, 'Frontend & Frameworks');
  assert.equal(defaultPath.link, '#content');
  assert.deepEqual(defaultPath.stages, [
    'Prototype & Architect',
    'Engineer with Modern Stack',
    'Deploy & Monitor',
  ]);
  assert.equal(getThinkingPath(1).link, '#work');
  assert.equal(getThinkingPath(2).link, '#education');
});

test('TECH_BADGES contains exact 8 required technologies and INITIAL_EDUCATION has verified records', () => {
  assert.deepEqual(TECH_BADGES, [
    'React',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Supabase',
    'Figma',
    'GitHub Copilot',
    'Python',
  ]);
  assert.equal(INITIAL_EDUCATION.length, 2);
  assert.equal(INITIAL_EDUCATION[0].score_or_completion, '89.4%');
  assert.equal(INITIAL_EDUCATION[1].year_or_duration, '2025 - 2028');
});

test('scrambleSignalText preserves spaces and reveals text proportionally', () => {
  const full = scrambleSignalText('CHANDRESH KUMAR', 1, 100);
  assert.equal(full, 'CHANDRESH KUMAR');

  const partial = scrambleSignalText('CHANDRESH KUMAR', 0.5, 150);
  assert.equal(partial.length, 'CHANDRESH KUMAR'.length);
  assert.equal(partial[9], ' ');
  assert.ok(partial.startsWith('CHANDRES'));
});

test('resolveRoute maps all Chandresh Kumar portfolio paths and /45861563/admin to their RouteId', () => {
  assert.equal(resolveRoute('/'), 'home');
  assert.equal(resolveRoute('/45861563/admin'), 'admin');
  assert.equal(resolveRoute('/45861563/admin/'), 'admin');
  assert.equal(resolveRoute('/about/'), 'about');
  assert.equal(resolveRoute('/work'), 'work');
  assert.equal(resolveRoute('/content'), 'work');
  assert.equal(resolveRoute('/skills'), 'skills');
  assert.equal(resolveRoute('/services'), 'services');
  assert.equal(resolveRoute('/contact'), 'contact');
  assert.equal(resolveRoute('/work/cinematic-portfolio'), 'work-cinematic-portfolio');
  assert.equal(resolveRoute('/work/jal-setu'), 'work-jal-setu');
  assert.equal(resolveRoute('/work/campus-book'), 'work-campus-book');
  assert.equal(resolveRoute('/work/algorithmic-practice-suite'), 'work-algorithmic-practice-suite');
  assert.equal(resolveRoute('/work/ai-hardware-labs'), 'work-ai-hardware-labs');
  assert.equal(resolveRoute('/work/emerging-tech-skilling'), 'work-project');
  assert.equal(resolveRoute('/unknown-path'), 'home');
});

test('normalizeProjectSlug and validateContactPayload validate inputs accurately', () => {
  assert.equal(normalizeProjectSlug('  Jal_setu Platform! '), 'jal_setu-platform');
  assert.deepEqual(
    validateContactPayload({
      name: 'Chandresh Kumar',
      email: 'chandreshme01@gmail.com',
      message: 'Let us collaborate on a Next.js + Supabase project.',
    }),
    { valid: true }
  );
  assert.equal(
    validateContactPayload({ name: 'A', email: 'bad', message: 'hi' }).valid,
    false
  );
});

test('normalizeSupabaseUrl strips /rest/v1/ path suffixes and trailing slashes to clean origin', () => {
  assert.equal(
    normalizeSupabaseUrl('https://ixfhbgwlgjvrumiicjka.supabase.co/rest/v1/'),
    'https://ixfhbgwlgjvrumiicjka.supabase.co'
  );
  assert.equal(
    normalizeSupabaseUrl('  https://ixfhbgwlgjvrumiicjka.supabase.co/  '),
    'https://ixfhbgwlgjvrumiicjka.supabase.co'
  );
  assert.equal(normalizeSupabaseUrl('MY_SUPABASE_URL'), '');
  assert.equal(normalizeSupabaseUrl(''), '');
});

test('isAuthorizedAdminEmail and isAuthorizedAdminUser strictly authorize chandreshme01@gmail.com and block unauthorized accounts', () => {
  assert.equal(AUTHORIZED_ADMIN_EMAIL, 'chandreshme01@gmail.com');
  assert.equal(isAuthorizedAdminEmail('chandreshme01@gmail.com'), true);
  assert.equal(isAuthorizedAdminEmail('  ChandreshMe01@Gmail.com '), true);
  assert.equal(isAuthorizedAdminEmail('intruder@example.com'), false);
  assert.equal(isAuthorizedAdminEmail('sarthak@gmail.com'), false);
  assert.equal(isAuthorizedAdminEmail(''), false);
  assert.equal(isAuthorizedAdminEmail(null), false);

  assert.equal(isAuthorizedAdminUser({ email: 'chandreshme01@gmail.com' }), true);
  assert.equal(
    isAuthorizedAdminUser({
      email: 'delegated@domain.com',
      app_metadata: { role: 'admin' },
    }),
    true
  );
  // Must NOT trust client-mutable user_metadata.role
  assert.equal(
    isAuthorizedAdminUser({
      email: 'attacker@example.com',
      user_metadata: { role: 'admin' },
    }),
    false
  );
  assert.equal(isAuthorizedAdminUser({ email: 'visitor@example.com' }), false);
  assert.equal(isAuthorizedAdminUser(null), false);
});

test('INITIAL_SKILLS and buildTechStackCategories synchronize dynamic skills into the 4 editorial categories and resolve dynamic project slugs', () => {
  assert.equal(INITIAL_SKILLS.length, 15);
  const grouped = buildTechStackCategories(INITIAL_SKILLS);
  assert.equal(grouped.length, 4);
  assert.equal(grouped[0].id, 'frontend');
  assert.equal(grouped[0].items.length, 6);

  // Fallback when empty or all unpublished
  assert.deepEqual(buildTechStackCategories([]), TECH_STACK_CATEGORIES);

  // Dynamic project route resolution for admin-created projects
  assert.equal(resolveRoute('/work/digital-library'), 'work-project');
  assert.equal(resolveRoute('/work/custom-cloud-app/'), 'work-project');

  assert.deepEqual(NAV_LINKS, [
    ['Home', 'top'],
    ['About', 'about'],
    ['Skills', 'work'],
    ['Services', 'impact'],
    ['Works', 'content'],
  ]);

  // Proof Strip CTA block is hidden by default when no published CTA record exists
  assert.equal(getPublishedProofStripCta(INITIAL_ACHIEVEMENTS), null);
  assert.equal(getPublishedAchievementMetrics(INITIAL_ACHIEVEMENTS).length, 3);

  // Appears automatically when admin adds and publishes valid CTA content
  const withPublishedCta = [
    ...INITIAL_ACHIEVEMENTS,
    {
      id: 'cta-1',
      metric_value: '#impact',
      metric_suffix: '',
      label: 'THE ARCHITECTURE.',
      description: 'THE REAL-WORLD DEPLOYMENTS.',
      category: PROOF_STRIP_CTA_CATEGORY,
      display_order: 4,
      published: true,
    },
  ];
  const cta = getPublishedProofStripCta(withPublishedCta);
  assert.ok(cta);
  assert.equal(cta.line1, 'THE ARCHITECTURE.');
  assert.equal(cta.line2, 'THE REAL-WORLD DEPLOYMENTS.');
  assert.equal(cta.href, '#impact');

  assert.deepEqual(IMPACT_TECHNICAL_SKILLS, [
    'C',
    'Python',
    'JavaScript',
    'HTML5',
    'CSS3',
    'React.js',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Node.js',
    'Express.js',
    'FastAPI',
    'PostgreSQL',
    'Supabase',
    'Git',
    'GitHub',
    'GSAP',
  ]);
  assert.equal(getThinkingPath(null).name, 'Frontend & Frameworks');
});

test('Achievements, Certificates & Memories showcase helpers enforce published-only records, category filtering, and storage path extraction', () => {
  assert.deepEqual(SHOWCASE_CATEGORIES, [
    'Certificates',
    'Achievements',
    'Hackathon Memories',
    'Academic Milestones',
  ]);
  assert.deepEqual(SHOWCASE_FILTERS, [
    'All',
    'Certificates',
    'Achievements',
    'Hackathon Memories',
    'Academic Milestones',
  ]);

  // Legacy INITIAL_CERTIFICATES ('Web & Cloud' / 'CS & AI Labs') must never leak into the showcase as demo data
  assert.equal(getPublishedShowcaseItems(INITIAL_CERTIFICATES).length, 0);

  const sampleRecords: CertificateRecord[] = [
    {
      id: 'rec-1',
      slug: 'python-cert',
      title: 'Python Programming Certificate',
      issuer: 'FutureSkills Prime',
      role_or_domain: 'Verified Credential',
      subtitle_or_skills: 'Python programming and problem-solving foundations.',
      category: 'Certificates',
      credential_url: 'https://example.com/cert-1',
      image_url: 'https://proj.supabase.co/storage/v1/object/public/portfolio-media/certificates/1.png',
      issue_date: '2025',
      display_order: 2,
      published: true,
    },
    {
      id: 'rec-2',
      slug: 'hackathon-sprint',
      title: 'JalSetu Civic Build Sprint',
      issuer: 'Polytechnic Hackathon',
      role_or_domain: '[Showcase:Hackathon Memories] Team Lead',
      subtitle_or_skills: 'Built civic water reporting prototype.',
      category: 'CS & AI Labs',
      credential_url: '',
      image_url: 'https://proj.supabase.co/storage/v1/object/public/portfolio-media/certificates/2.png',
      issue_date: '2026',
      display_order: 1,
      published: true,
    },
    {
      id: 'rec-3',
      slug: 'draft-milestone',
      title: 'Unpublished Draft Milestone',
      issuer: 'GP Muzaffarpur',
      role_or_domain: 'Semester 1',
      subtitle_or_skills: 'Draft entry',
      category: 'Academic Milestones',
      credential_url: '',
      image_url: 'https://proj.supabase.co/storage/v1/object/public/portfolio-media/certificates/3.png',
      issue_date: '2025',
      display_order: 3,
      published: false,
    },
  ];

  const published = getPublishedShowcaseItems(sampleRecords);
  assert.equal(published.length, 2);
  // Sorted by display_order (rec-2 first, rec-1 second) and normalized from fallback prefix
  assert.equal(published[0].id, 'rec-2');
  assert.equal(published[0].category, 'Hackathon Memories');
  assert.equal(published[0].role_or_domain, 'Team Lead');
  assert.equal(published[1].id, 'rec-1');
  assert.equal(published[1].category, 'Certificates');

  assert.equal(filterShowcaseItems(published, 'All').length, 2);
  assert.equal(filterShowcaseItems(published, 'Hackathon Memories').length, 1);
  assert.equal(filterShowcaseItems(published, 'Certificates').length, 1);
  assert.equal(filterShowcaseItems(published, 'Academic Milestones').length, 0);

  const encoded = encodeShowcaseRoleAndCategory('Academic Milestones', '89.4% Class 10 BSEB');
  assert.equal(encoded.dbCategory, 'CS & AI Labs');
  assert.equal(encoded.dbRoleOrDomain, '[Showcase:Academic Milestones] 89.4% Class 10 BSEB');
  const decoded = normalizeCertificateRecord({
    ...sampleRecords[0],
    category: encoded.dbCategory,
    role_or_domain: encoded.dbRoleOrDomain,
  });
  assert.equal(decoded.category, 'Academic Milestones');
  assert.equal(decoded.role_or_domain, '89.4% Class 10 BSEB');

  assert.equal(
    validateShowcaseInput({
      title: 'Diploma Admission Milestone',
      category: 'Academic Milestones',
      issuer: 'Government Polytechnic Muzaffarpur',
      image_url: 'https://proj.supabase.co/storage/v1/object/public/portfolio-media/certificates/m.jpg',
    }).valid,
    true
  );
  assert.equal(
    validateShowcaseInput({
      title: 'A',
      category: 'Certificates',
      issuer: 'Org',
      image_url: 'https://example.com/a.png',
    }).valid,
    false
  );

  assert.equal(
    extractStorageObjectPath(
      'https://ixfhbgwlgjvrumiicjka.supabase.co/storage/v1/object/public/portfolio-media/certificates/171000-cert.png'
    ),
    'certificates/171000-cert.png'
  );
  assert.equal(extractStorageObjectPath('/images/work/campus-book.svg'), null);
});

test('INITIAL_PROJECTS, formatProjectCategory, parseProjectMetadata, and mapProjectToVideoItem synchronize section#content and Admin Projects', () => {
  assert.equal(INITIAL_PROJECTS.length, 6);
  assert.equal(VIDEOS.length, 6);

  const formatted = formatProjectCategory(
    'Web & Cloud',
    'Chandresh Kumar',
    'Infrastructure & Cloud Web App'
  );
  assert.equal(formatted, '[Web & Cloud] Chandresh Kumar / Infrastructure & Cloud Web App');

  const meta = parseProjectMetadata(INITIAL_PROJECTS[1]);
  assert.equal(meta.filterCategory, 'Web & Cloud');
  assert.equal(meta.channel, 'Chandresh Kumar');
  assert.equal(meta.role, 'Infrastructure & Cloud Web App');
  assert.equal(meta.displayCategory, 'Infrastructure & Cloud Web App');
  assert.equal(meta.subtitle, 'Full-Stack Web · Render · Cloud Hosting · GitHub Actions');

  // Legacy category format fallback
  const legacyMeta = parseProjectMetadata({
    ...INITIAL_PROJECTS[3],
    category: 'Core CS & Problem Solving · LeetCode & GeeksforGeeks',
  });
  assert.equal(legacyMeta.filterCategory, 'CS & AI Labs');
  assert.equal(legacyMeta.channel, 'LeetCode & GeeksforGeeks');
  assert.equal(legacyMeta.role, 'Core CS & Problem Solving');

  const mapped = mapProjectToVideoItem(INITIAL_PROJECTS[5]);
  assert.equal(mapped.id, 'emerging-tech-skilling');
  assert.equal(mapped.title, 'Emerging Tech & Skilling');
  assert.equal(mapped.category, 'CS & AI Labs');
  assert.equal(mapped.channel, 'FutureSkills Prime & Udemy');
});
