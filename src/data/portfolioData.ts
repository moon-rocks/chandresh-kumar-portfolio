export interface PerspectiveItem {
  name: 'Learn' | 'Practice' | 'Explore';
  subtitle: string;
  title: string;
  copy: string;
  focusItems?: string[];
  featuredProjects?: Array<{ name: string; description: string }>;
  technologies?: string;
  href: string;
  link: string;
  shape: 'structure' | 'ripples' | 'constellation';
}

export interface LearningJourneyItem {
  step: string;
  phase: string;
  period: string;
  status: string;
  heading: string;
  title: string;
  institution: string;
  qualification: string;
  achievement: string;
  paragraphs: string[];
  highlights: string[];
}

export interface ExpertiseItem {
  title: string;
  label: string;
  description: string;
  strengths: string;
  tools: string;
  note: string;
}

export interface ThinkingPathItem {
  name: string;
  stages: string[];
  link: string;
  label: string;
}

export interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  channel: string;
  role: string;
  category: 'Web & Cloud' | 'CS & AI Labs';
  url: string;
  image: string;
}

export type VideoFilter = 'All modules' | 'Web & Cloud' | 'CS & AI Labs';

export interface ProjectRecord {
  id: string;
  slug: string;
  display_order: number;
  is_featured: boolean;
  title: string;
  category: string;
  summary: string;
  key_tech: string[];
  live_url: string;
  browser_label: string;
  image_url: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EducationRecord {
  id: string;
  badge_text: string;
  title: string;
  year_or_duration: string;
  institution_or_board: string;
  location_or_qualification: string;
  score_or_completion: string;
  status: string;
  description?: string;
  display_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AchievementRecord {
  id: string;
  metric_value: string;
  metric_suffix: string;
  label: string;
  description: string;
  category: string;
  display_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ShowcaseCategory =
  | 'Certificates'
  | 'Achievements'
  | 'Hackathon Memories'
  | 'Academic Milestones';

export type ShowcaseFilter = 'All' | ShowcaseCategory;

export type CertificateCategory = ShowcaseCategory | 'Web & Cloud' | 'CS & AI Labs';

export const SHOWCASE_CATEGORIES: readonly ShowcaseCategory[] = [
  'Certificates',
  'Achievements',
  'Hackathon Memories',
  'Academic Milestones',
];

export const SHOWCASE_FILTERS: readonly ShowcaseFilter[] = ['All', ...SHOWCASE_CATEGORIES];

export interface CertificateRecord {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  role_or_domain: string;
  subtitle_or_skills: string;
  category: CertificateCategory;
  credential_url: string;
  image_url: string;
  issue_date: string;
  display_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

export const NAV_LINKS: Array<[string, string]> = [
  ['Home', 'top'],
  ['About', 'about'],
  ['Skills', 'work'],
  ['Services', 'impact'],
  ['Works', 'content'],
];

export const TECH_BADGES: string[] = [
  'React',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Supabase',
  'Figma',
  'GitHub Copilot',
  'Python',
];

export const INITIAL_PROJECTS: ProjectRecord[] = [
  {
    id: 'proj-01',
    slug: 'cinematic-portfolio',
    display_order: 1,
    is_featured: true,
    title: 'Cinematic Interactive Portfolio',
    category: '[Web & Cloud] Chandresh Kumar / Creative Web Development & CMS',
    summary:
      'Responsive, cinematic web experience with interactive project cards, micro-interactions, Core Web Vitals optimization, and Supabase CMS integration.',
    key_tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    live_url: 'https://moon-rocks.github.io/PORTFOLIO/',
    browser_label: 'moon-rocks.github.io/PORTFOLIO',
    image_url: '/images/work/cinematic-portfolio.svg',
    published: true,
  },
  {
    id: 'proj-02',
    slug: 'jal-setu',
    display_order: 2,
    is_featured: true,
    title: 'Jal_setu Platform',
    category: '[Web & Cloud] Chandresh Kumar / Infrastructure & Cloud Web App',
    summary:
      'Web application for public utility monitoring and water resource management, containerized and deployed across Render and GitHub Pages.',
    key_tech: ['Full-Stack Web', 'Render', 'Cloud Hosting', 'GitHub Actions'],
    live_url: 'https://github.com/moon-rocks/Jal_setu',
    browser_label: 'github.com/moon-rocks/Jal_setu',
    image_url: '/images/work/jal-setu.svg',
    published: true,
  },
  {
    id: 'proj-03',
    slug: 'campus-book',
    display_order: 3,
    is_featured: true,
    title: 'Campus-Book Platform',
    category: '[Web & Cloud] Chandresh Kumar / Academic Portal & Repository',
    summary:
      'Centralized academic repository and collaborative documentation hub designed to organize CS notes, study material, and technical resources.',
    key_tech: ['Static Web Architecture', 'GitHub Pages', 'Markdown', 'CSS'],
    live_url: 'https://github.com/moon-rocks/campus-book',
    browser_label: 'github.com/moon-rocks/campus-book',
    image_url: '/images/work/campus-book.svg',
    published: true,
  },
  {
    id: 'proj-04',
    slug: 'algorithmic-practice-suite',
    display_order: 4,
    is_featured: false,
    title: 'Algorithmic Practice Suite',
    category: '[CS & AI Labs] LeetCode & GeeksforGeeks / Core CS & Problem Solving',
    summary:
      'Implementations of fundamental data structures, algorithms, and complexity analysis across LeetCode and GeeksforGeeks.',
    key_tech: ['C++', 'Python', 'Data Structures & Algorithms'],
    live_url: 'https://github.com/moon-rocks',
    browser_label: 'github.com/moon-rocks',
    image_url: '/images/work/cinematic-portfolio.svg',
    published: true,
  },
  {
    id: 'proj-05',
    slug: 'ai-hardware-labs',
    display_order: 5,
    is_featured: false,
    title: 'AI & Hardware Engineering Labs',
    category: '[CS & AI Labs] Polytechnic Expert CSE / Polytechnic Academic Work',
    summary:
      'Hands-on experiments covering Artificial Intelligence algorithms and circuit foundations in Digital Electronics.',
    key_tech: ['Artificial Intelligence', 'Digital Electronics'],
    live_url: 'https://github.com/moon-rocks',
    browser_label: 'github.com/moon-rocks',
    image_url: '/images/work/jal-setu.svg',
    published: true,
  },
  {
    id: 'proj-06',
    slug: 'emerging-tech-skilling',
    display_order: 6,
    is_featured: false,
    title: 'Emerging Tech & Skilling',
    category: '[CS & AI Labs] FutureSkills Prime & Udemy / Continuous Skilling & Certifications',
    summary:
      'Continuous technical skilling and certified emerging technology specializations across FutureSkills Prime and Udemy.',
    key_tech: ['FutureSkills Prime & Udemy Technical Specializations'],
    live_url: 'https://moon-rocks.github.io/PORTFOLIO/',
    browser_label: 'moon-rocks.github.io/PORTFOLIO',
    image_url: '/images/work/campus-book.svg',
    published: true,
  },
];

export const LEARNING_JOURNEY_HEADING = 'My Learning Journey';
export const LEARNING_JOURNEY_SUBTITLE =
  'From secondary academic foundations to Computer Science & Engineering and practical full-stack web builds.';

export const LEARNING_JOURNEY_ITEMS: LearningJourneyItem[] = [
  {
    step: '01',
    phase: 'PHASE 01',
    period: '2025',
    status: 'Completed',
    heading: 'PHASE 01 — Academic Foundation (2025)',
    title: 'Academic Foundation (2025)',
    institution: 'Bihar School Examination Board (BSEB)',
    qualification: 'Class 10 · Secondary Education',
    achievement: '89.4%',
    paragraphs: [
      'Completed Class 10 under the Bihar School Examination Board (BSEB) in 2025 with an academic achievement of 89.4%, building a strong foundation in mathematics, science, and core secondary education fundamentals.',
      'Developed the analytical discipline, structured problem-solving mindset, and academic readiness required to transition into formal Computer Science & Engineering studies.',
    ],
    highlights: [
      'Class 10 Completed (2025)',
      'Academic Achievement: 89.4%',
      'Secondary Education & Core Fundamentals',
      'Bihar School Examination Board (BSEB)',
    ],
  },
  {
    step: '02',
    phase: 'PHASE 02',
    period: '2025–Present',
    status: 'Current / In Progress',
    heading: 'PHASE 02 — Diploma in Computer Science & Engineering (2025–Present)',
    title: 'Diploma in Computer Science & Engineering (2025–Present)',
    institution: 'Government Polytechnic Muzaffarpur, Bihar',
    qualification: 'Diploma in Computer Science & Engineering (2025–2028)',
    achievement: '2025–Present',
    paragraphs: [
      'Currently pursuing a Diploma in Computer Science & Engineering at Government Polytechnic Muzaffarpur, Bihar (2025–Present, expected completion 2028). Academic coursework focuses on core computer science concepts, C and Python programming fundamentals, Engineering Mathematics, Applied Chemistry, Web Development, and Communication Skills.',
      'Applying classroom foundations to full-stack web development, relational databases, and practical software projects—engineering JalSetu, Campus Book, Digital Library, and this interactive portfolio with HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Tailwind CSS, GSAP, Node.js, Express.js, PostgreSQL, Supabase, Git, and GitHub.',
    ],
    highlights: [
      'Government Polytechnic Muzaffarpur, Bihar',
      'C, Python, JavaScript & TypeScript',
      'React, Next.js, Tailwind CSS & GSAP',
      'Node.js, Express.js, PostgreSQL & Supabase',
      'Projects: JalSetu, Campus Book, Digital Library & Portfolio',
    ],
  },
];

export const INITIAL_EDUCATION: EducationRecord[] = [
  {
    id: 'edu-01',
    badge_text: 'PHASE 01 · 2025 · COMPLETED',
    title: 'PHASE 01 — Academic Foundation (2025)',
    year_or_duration: '2025',
    institution_or_board: 'Bihar School Examination Board (BSEB)',
    location_or_qualification: 'Class 10 · Secondary Education',
    score_or_completion: '89.4%',
    status: 'Completed',
    description: LEARNING_JOURNEY_ITEMS[0].paragraphs.join('\n\n'),
    display_order: 1,
    published: true,
  },
  {
    id: 'edu-02',
    badge_text: 'PHASE 02 · 2025–PRESENT · IN PROGRESS',
    title: 'PHASE 02 — Diploma in Computer Science & Engineering (2025–Present)',
    year_or_duration: '2025 - 2028',
    institution_or_board: 'Government Polytechnic Muzaffarpur, Bihar',
    location_or_qualification: 'Diploma in Computer Science & Engineering',
    score_or_completion: '2025–Present (Expected 2028)',
    status: 'Current / In Progress',
    description: LEARNING_JOURNEY_ITEMS[1].paragraphs.join('\n\n'),
    display_order: 2,
    published: true,
  },
];

export function normalizeEducationRecord(raw: EducationRecord): EducationRecord {
  const titleTrimmed = (raw.title || '').trim();
  const isPhase1 =
    raw.display_order === 1 ||
    /secondary education|class 10|phase 01|academic foundation/i.test(
      `${titleTrimmed} ${raw.location_or_qualification || ''}`
    );
  const isPhase2 =
    raw.display_order === 2 ||
    /diploma|polytechnic|phase 02/i.test(
      `${titleTrimmed} ${raw.institution_or_board || ''} ${raw.location_or_qualification || ''}`
    );

  if (isPhase1) {
    const isLegacyTitle = /^1\.\s*Secondary Education$/i.test(titleTrimmed);
    const isLegacyBadge = /^2025\s*·\s*COMPLETED$/i.test((raw.badge_text || '').trim());
    return {
      ...raw,
      badge_text: isLegacyBadge ? INITIAL_EDUCATION[0].badge_text : raw.badge_text || INITIAL_EDUCATION[0].badge_text,
      title: isLegacyTitle ? INITIAL_EDUCATION[0].title : titleTrimmed || INITIAL_EDUCATION[0].title,
      institution_or_board: raw.institution_or_board || INITIAL_EDUCATION[0].institution_or_board,
      location_or_qualification:
        raw.location_or_qualification === 'Class 10th'
          ? INITIAL_EDUCATION[0].location_or_qualification
          : raw.location_or_qualification || INITIAL_EDUCATION[0].location_or_qualification,
      score_or_completion: raw.score_or_completion || '89.4%',
      description: (raw.description || '').trim() || INITIAL_EDUCATION[0].description,
    };
  }

  if (isPhase2) {
    const isLegacyTitle = /^2\.\s*Diploma in Computer Science & Engineering$/i.test(titleTrimmed);
    const isLegacyBadge = /^2025\s*[–-]\s*PRESENT\s*·\s*CURRENT\s*\/\s*IN PROGRESS$/i.test(
      (raw.badge_text || '').trim()
    );
    return {
      ...raw,
      badge_text: isLegacyBadge ? INITIAL_EDUCATION[1].badge_text : raw.badge_text || INITIAL_EDUCATION[1].badge_text,
      title: isLegacyTitle ? INITIAL_EDUCATION[1].title : titleTrimmed || INITIAL_EDUCATION[1].title,
      institution_or_board:
        raw.institution_or_board === 'Government Polytechnic Muzaffarpur'
          ? 'Government Polytechnic Muzaffarpur, Bihar'
          : raw.institution_or_board || INITIAL_EDUCATION[1].institution_or_board,
      location_or_qualification:
        raw.location_or_qualification === 'Muzaffarpur, Bihar'
          ? INITIAL_EDUCATION[1].location_or_qualification
          : raw.location_or_qualification || INITIAL_EDUCATION[1].location_or_qualification,
      description: (raw.description || '').trim() || INITIAL_EDUCATION[1].description,
    };
  }

  return {
    ...raw,
    description: (raw.description || '').trim(),
  };
}

export function buildLearningJourneyItems(education?: EducationRecord[]): LearningJourneyItem[] {
  const published = (education || [])
    .filter((e) => e.published !== false)
    .map(normalizeEducationRecord)
    .sort((a, b) => (Number(a.display_order) || 1) - (Number(b.display_order) || 1))
    .slice(0, 2);

  if (published.length === 0) {
    return LEARNING_JOURNEY_ITEMS;
  }

  return published.map((edu, index) => {
    const fallback = LEARNING_JOURNEY_ITEMS[index] || LEARNING_JOURNEY_ITEMS[LEARNING_JOURNEY_ITEMS.length - 1];
    const step = String(index + 1).padStart(2, '0');
    const phase = `PHASE ${step}`;
    const customParagraphs = (edu.description || '')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    const rawTitle = (edu.title || fallback.heading).trim();
    const cleanTitle = rawTitle.replace(/^PHASE\s*0?\d+\s*[—–-]\s*/i, '').trim() || fallback.title;
    const heading = /^PHASE\s*0?\d+/i.test(rawTitle) ? rawTitle : `${phase} — ${cleanTitle}`;

    return {
      step,
      phase,
      period: index === 0 ? '2025' : '2025–Present',
      status: edu.status || fallback.status,
      heading,
      title: cleanTitle,
      institution: edu.institution_or_board || fallback.institution,
      qualification: edu.location_or_qualification || fallback.qualification,
      achievement: edu.score_or_completion || fallback.achievement,
      paragraphs: customParagraphs.length > 0 ? customParagraphs : fallback.paragraphs,
      highlights: fallback.highlights,
    };
  });
}

export const PROOF_STRIP_CTA_CATEGORY = 'Proof Strip CTA';

export function isProofStripCtaRecord(ach?: AchievementRecord | null): boolean {
  return Boolean(ach && ach.category === PROOF_STRIP_CTA_CATEGORY);
}

export function getPublishedProofStripCta(
  achievements: AchievementRecord[]
): { line1: string; line2: string; href: string; record: AchievementRecord } | null {
  const cta = (achievements || []).find(
    (a) => a.published && isProofStripCtaRecord(a) && a.label.trim().length > 0
  );
  if (!cta) return null;
  return {
    line1: cta.label.trim(),
    line2: (cta.description || '').trim(),
    href: (cta.metric_value || '').trim() || '#impact',
    record: cta,
  };
}

export function getPublishedAchievementMetrics(
  achievements: AchievementRecord[]
): AchievementRecord[] {
  return (achievements || []).filter(
    (a) =>
      a.published &&
      !isProofStripCtaRecord(a) &&
      a.metric_value.trim().length > 0 &&
      a.label.trim().length > 0
  );
}

export const INITIAL_ACHIEVEMENTS: AchievementRecord[] = [
  {
    id: 'ach-01',
    metric_value: '3',
    metric_suffix: '+',
    label: 'Core Web Applications Deployed across Vercel, Render & GitHub Pages',
    description:
      'Across Vercel, Render, and GitHub Pages. Interactive portfolios, public utility platforms, and academic portals.',
    category: 'Deployments',
    display_order: 1,
    published: true,
  },
  {
    id: 'ach-02',
    metric_value: '100',
    metric_suffix: '%',
    label: 'Modern Stack Focus (React, Next.js, TypeScript, Supabase, Tailwind)',
    description:
      'Engineered with React, Next.js, TypeScript, Supabase (Database, Auth, Media Storage), and Tailwind CSS.',
    category: 'Architecture',
    display_order: 2,
    published: true,
  },
  {
    id: 'ach-03',
    metric_value: 'Sem ',
    metric_suffix: '1',
    label: 'Polytechnic Expert CSE (AI & Electrical/Electronics Foundations)',
    description:
      'First-semester Computer Science Engineering student focusing on Artificial Intelligence and Fundamentals of Electrical & Electronics Engineering.',
    category: 'Academics',
    display_order: 3,
    published: true,
  },
];

export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-01',
    slug: 'cinematic-portfolio',
    title: 'Cinematic Interactive Portfolio',
    issuer: 'Chandresh Kumar',
    role_or_domain: 'Creative Web Development & CMS',
    subtitle_or_skills: 'Next.js · React · TypeScript · Tailwind CSS · Supabase',
    category: 'Web & Cloud',
    credential_url: 'https://moon-rocks.github.io/PORTFOLIO/',
    image_url: '/images/work/cinematic-portfolio.svg',
    issue_date: '2026',
    display_order: 1,
    published: true,
  },
  {
    id: 'cert-02',
    slug: 'jal-setu',
    title: 'Jal_setu Platform',
    issuer: 'Chandresh Kumar',
    role_or_domain: 'Infrastructure & Cloud Web App',
    subtitle_or_skills: 'Full-Stack Web · Render · Cloud Hosting · GitHub Actions',
    category: 'Web & Cloud',
    credential_url: 'https://github.com/moon-rocks/Jal_setu',
    image_url: '/images/work/jal-setu.svg',
    issue_date: '2026',
    display_order: 2,
    published: true,
  },
  {
    id: 'cert-03',
    slug: 'campus-book',
    title: 'Campus-Book Platform',
    issuer: 'Chandresh Kumar',
    role_or_domain: 'Academic Portal & Repository',
    subtitle_or_skills: 'Static Web Architecture · GitHub Pages · Markdown · CSS',
    category: 'Web & Cloud',
    credential_url: 'https://github.com/moon-rocks/campus-book',
    image_url: '/images/work/campus-book.svg',
    issue_date: '2026',
    display_order: 3,
    published: true,
  },
  {
    id: 'cert-04',
    slug: 'algorithmic-practice',
    title: 'Algorithmic Practice Suite',
    issuer: 'LeetCode & GeeksforGeeks',
    role_or_domain: 'Core CS & Problem Solving',
    subtitle_or_skills: 'C++ · Python · Data Structures & Algorithms',
    category: 'CS & AI Labs',
    credential_url: 'https://github.com/moon-rocks',
    image_url: '/images/work/cinematic-portfolio.svg',
    issue_date: '2025',
    display_order: 4,
    published: true,
  },
  {
    id: 'cert-05',
    slug: 'ai-hardware-labs',
    title: 'AI & Hardware Engineering Labs',
    issuer: 'Polytechnic Expert CSE',
    role_or_domain: 'Polytechnic Academic Work',
    subtitle_or_skills: 'Artificial Intelligence · Digital Electronics',
    category: 'CS & AI Labs',
    credential_url: 'https://github.com/moon-rocks',
    image_url: '/images/work/jal-setu.svg',
    issue_date: '2025',
    display_order: 5,
    published: true,
  },
  {
    id: 'cert-06',
    slug: 'futureskills-prime',
    title: 'Emerging Tech & Skilling',
    issuer: 'FutureSkills Prime & Udemy',
    role_or_domain: 'Continuous Skilling & Certifications',
    subtitle_or_skills: 'FutureSkills Prime & Udemy Technical Specializations',
    category: 'CS & AI Labs',
    credential_url: 'https://moon-rocks.github.io/PORTFOLIO/',
    image_url: '/images/work/campus-book.svg',
    issue_date: '2025',
    display_order: 6,
    published: true,
  },
];

export const ABOUT_PERSPECTIVES: PerspectiveItem[] = [
  {
    name: 'Learn',
    subtitle: 'Academic Foundation',
    title: 'Building Strong Foundations',
    copy: 'My journey as a Diploma in Computer Science & Engineering student at Government Polytechnic Muzaffarpur, developing a strong foundation in programming, mathematics, and computer science.',
    focusItems: [
      'Engineering Mathematics and Applied Chemistry.',
      'C Programming and programming fundamentals.',
      'Web Development and Communication Skills.',
      'Core Computer Science concepts.',
    ],
    href: '#education',
    link: 'Explore My Education',
    shape: 'structure',
  },
  {
    name: 'Practice',
    subtitle: 'Hands-on Learning',
    title: 'Learn by Building. Improve by Solving.',
    copy: 'I strengthen my technical understanding through programming practice, debugging, problem-solving, and applying theoretical knowledge to practical software development.',
    focusItems: [
      'C and Python programming.',
      'Problem-solving and algorithmic thinking.',
      'Web development and debugging.',
      'Learning through experimentation and personal projects.',
    ],
    href: '#journey',
    link: 'Discover My Learning Journey',
    shape: 'ripples',
  },
  {
    name: 'Explore',
    subtitle: 'Projects & Technologies',
    title: 'Turning Ideas into Working Applications.',
    copy: 'I explore modern development technologies and apply my knowledge to practical projects involving user interfaces, backend services, databases, and real-world problem-solving.',
    featuredProjects: [
      {
        name: 'JalSetu',
        description: 'Civic water-issue reporting platform.',
      },
      {
        name: 'Campus Book',
        description: 'Student-to-student book marketplace.',
      },
      {
        name: 'Digital Library',
        description: 'Academic resource platform.',
      },
      {
        name: 'Personal Portfolio',
        description: 'Interactive website showcasing my work and learning journey.',
      },
    ],
    technologies:
      'C, Python, JavaScript, HTML5, CSS3, React.js, Next.js, TypeScript, Tailwind CSS, Node.js, Express.js, FastAPI, PostgreSQL, Supabase, Git, GitHub, and GSAP.',
    href: '#content',
    link: 'Explore My Projects',
    shape: 'constellation',
  },
];

export const IMPACT_PERSPECTIVES: PerspectiveItem[] = ABOUT_PERSPECTIVES;

export const EXPERTISE_ITEMS: ExpertiseItem[] = [
  {
    title: 'Modern Full-Stack & Frontend.',
    label: '01 / FRONTEND & FRAMEWORKS',
    description:
      'I engineer responsive, high-performance interfaces that turn ideas into memorable digital experiences with clean component architecture.',
    strengths: 'React · Next.js · TypeScript · Tailwind CSS · Modern HTML5/CSS3 · Canvas API',
    tools: 'React, Next.js, TypeScript, Tailwind CSS, Modern HTML5/CSS3, Canvas API, Core Web Vitals',
    note: 'Focused on zero-CLS layouts, fluid micro-interactions, and accessible UI architecture.',
  },
  {
    title: 'Cloud Deployment & Persistence.',
    label: '02 / BACKEND & CLOUD',
    description:
      'I connect interactive frontend experiences to managed cloud databases, authentication flows, media storage, and automated deployment pipelines.',
    strengths: 'Supabase (Database, Auth, Media Storage) · Render · Vercel · GitHub Pages',
    tools: 'Supabase, Render, Vercel, GitHub Pages, GitHub Actions, Static & Full-Stack Web Hosting',
    note: 'Production deployments across Vercel, Render, and GitHub Pages.',
  },
  {
    title: 'Creative Workflow & Core CS.',
    label: '03 / TOOLING, AI & PROBLEM SOLVING',
    description:
      'I pair modern design and AI-assisted developer workflows with academic foundations in Artificial Intelligence, electronics, and algorithmic problem solving.',
    strengths: 'VS Code · GitHub Copilot · Figma (Education Plan) · Git · Claude · C++ · Python',
    tools: 'VS Code, GitHub Copilot, Figma (Education Plan), Git, Claude, LeetCode, GeeksforGeeks',
    note: 'Polytechnic Expert CSE coursework in Artificial Intelligence & Digital Electronics.',
  },
];

export const IMPACT_TECHNICAL_SKILLS: readonly string[] = [
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
];

export const THINKING_PATHS: ThinkingPathItem[] = [
  {
    name: 'Frontend & Frameworks',
    stages: ['Prototype & Architect', 'Engineer with Modern Stack', 'Deploy & Monitor'],
    link: '#content',
    label: 'Explore the engineering',
  },
  {
    name: 'Backend & Cloud',
    stages: ['Prototype & Architect', 'Engineer with Modern Stack', 'Deploy & Monitor'],
    link: '#work',
    label: 'Explore cloud architecture',
  },
  {
    name: 'Tooling, AI & Problem Solving',
    stages: ['Prototype & Architect', 'Engineer with Modern Stack', 'Deploy & Monitor'],
    link: '#education',
    label: 'Explore academic foundation',
  },
];

export const VIDEO_FILTERS: VideoFilter[] = ['All modules', 'Web & Cloud', 'CS & AI Labs'];

export function isShowcaseCategory(value: string): value is ShowcaseCategory {
  return (SHOWCASE_CATEGORIES as readonly string[]).includes(value);
}

const SHOWCASE_ROLE_PREFIX_REGEX = /^\[Showcase:(Certificates|Achievements|Hackathon Memories|Academic Milestones)\]\s*/i;

export function encodeShowcaseRoleAndCategory(
  category: CertificateCategory,
  roleOrDomain: string
): { dbCategory: 'Web & Cloud' | 'CS & AI Labs'; dbRoleOrDomain: string } {
  const cleanRole = (roleOrDomain || '').replace(SHOWCASE_ROLE_PREFIX_REGEX, '').trim();
  if (isShowcaseCategory(category)) {
    return {
      dbCategory: 'CS & AI Labs',
      dbRoleOrDomain: `[Showcase:${category}] ${cleanRole}`.trim(),
    };
  }
  return {
    dbCategory: category === 'Web & Cloud' ? 'Web & Cloud' : 'CS & AI Labs',
    dbRoleOrDomain: cleanRole,
  };
}

export function normalizeCertificateRecord(raw: CertificateRecord): CertificateRecord {
  const roleStr = raw.role_or_domain || '';
  const match = roleStr.match(SHOWCASE_ROLE_PREFIX_REGEX);
  if (match && isShowcaseCategory(match[1])) {
    return {
      ...raw,
      category: match[1],
      role_or_domain: roleStr.replace(SHOWCASE_ROLE_PREFIX_REGEX, '').trim(),
    };
  }
  return {
    ...raw,
    role_or_domain: roleStr.trim(),
  };
}

export function getPublishedShowcaseItems(records: CertificateRecord[]): CertificateRecord[] {
  return (records || [])
    .map(normalizeCertificateRecord)
    .filter(
      (item) =>
        Boolean(item.published) &&
        isShowcaseCategory(item.category) &&
        item.title.trim().length > 0 &&
        item.image_url.trim().length > 0
    )
    .sort((a, b) => (Number(a.display_order) || 1) - (Number(b.display_order) || 1));
}

export function filterShowcaseItems(
  items: CertificateRecord[],
  filter: ShowcaseFilter
): CertificateRecord[] {
  if (filter === 'All') return items;
  return items.filter((item) => item.category === filter);
}

export function validateShowcaseInput(input: {
  title: string;
  category: string;
  issuer: string;
  image_url: string;
}): { valid: boolean; error?: string } {
  if (!input.title || input.title.trim().length < 2) {
    return { valid: false, error: 'Please enter a valid title (at least 2 characters).' };
  }
  if (!isShowcaseCategory(input.category)) {
    return {
      valid: false,
      error:
        'Category must be one of Certificates, Achievements, Hackathon Memories, or Academic Milestones.',
    };
  }
  if (!input.issuer || input.issuer.trim().length < 2) {
    return {
      valid: false,
      error: 'Please enter an issuer, organization, or event name.',
    };
  }
  if (!input.image_url || input.image_url.trim().length < 5) {
    return {
      valid: false,
      error: 'Please upload an image to Supabase Storage or provide a valid image URL.',
    };
  }
  return { valid: true };
}

export function extractStorageObjectPath(
  publicUrl: string,
  bucketName = 'portfolio-media'
): string | null {
  const trimmed = (publicUrl || '').trim();
  if (!trimmed) return null;
  const marker = `/storage/v1/object/public/${bucketName}/`;
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return null;
  const pathPart = trimmed.slice(idx + marker.length).split('?')[0];
  return pathPart ? decodeURIComponent(pathPart) : null;
}

export interface ParsedProjectMetadata {
  filterCategory: 'Web & Cloud' | 'CS & AI Labs';
  channel: string;
  role: string;
  displayCategory: string;
  subtitle: string;
}

const PROJECT_CATEGORY_PREFIX_REGEX = /^\[(Web & Cloud|CS & AI Labs)\]\s*(.+?)\s*\/\s*(.+)$/i;

export function formatProjectCategory(
  filterCategory: 'Web & Cloud' | 'CS & AI Labs',
  channel: string,
  role: string
): string {
  const cleanChannel = (channel || 'Chandresh Kumar').trim();
  const cleanRole = (role || 'Web Engineering').trim();
  return `[${filterCategory}] ${cleanChannel} / ${cleanRole}`;
}

export function parseProjectMetadata(proj: ProjectRecord): ParsedProjectMetadata {
  const rawCategory = (proj.category || '').trim();
  const subtitle =
    Array.isArray(proj.key_tech) && proj.key_tech.length > 0
      ? proj.key_tech.join(' · ')
      : (proj.summary || '').trim();

  const match = rawCategory.match(PROJECT_CATEGORY_PREFIX_REGEX);
  if (match) {
    const filterCategory =
      match[1].toLowerCase() === 'cs & ai labs' ? 'CS & AI Labs' : 'Web & Cloud';
    const channel = match[2].trim();
    const role = match[3].trim();
    return {
      filterCategory,
      channel,
      role,
      displayCategory: role,
      subtitle,
    };
  }

  const isCsAi = /cs|ai|algo|hardware|lab|skilling|polytechnic|leetcode/i.test(
    `${rawCategory} ${proj.slug || ''}`
  );
  const filterCategory: 'Web & Cloud' | 'CS & AI Labs' = isCsAi ? 'CS & AI Labs' : 'Web & Cloud';

  if (rawCategory.includes('·')) {
    const parts = rawCategory.split('·').map((s) => s.trim());
    const role = parts[0] || 'Core CS & Problem Solving';
    const channel =
      parts[1] === 'Coursework Modules'
        ? 'Polytechnic Expert CSE'
        : parts[1] || 'Chandresh Kumar';
    return {
      filterCategory,
      channel,
      role,
      displayCategory: role,
      subtitle,
    };
  }

  return {
    filterCategory,
    channel: 'Chandresh Kumar',
    role: rawCategory || 'Full-Stack Web Engineering',
    displayCategory: rawCategory || 'Full-Stack Web Engineering',
    subtitle,
  };
}

export function mapProjectToVideoItem(proj: ProjectRecord): VideoItem {
  const meta = parseProjectMetadata(proj);
  return {
    id: proj.slug || proj.id,
    title: proj.title,
    subtitle: meta.subtitle,
    channel: meta.channel,
    role: meta.role,
    category: meta.filterCategory,
    url: proj.live_url,
    image: proj.image_url,
  };
}

export function mapCertificateToVideoItem(cert: CertificateRecord): VideoItem {
  return {
    id: cert.slug || cert.id,
    title: cert.title,
    subtitle: cert.subtitle_or_skills,
    channel: cert.issuer,
    role: cert.role_or_domain,
    category: cert.category === 'Web & Cloud' ? 'Web & Cloud' : 'CS & AI Labs',
    url: cert.credential_url,
    image: cert.image_url,
  };
}

export const VIDEOS: VideoItem[] = INITIAL_PROJECTS.map(mapProjectToVideoItem);

export const motionConfig = {
  ease: 'power3.out',
  revealDuration: 0.9,
  maxDpr: 1.5,
};

export const narrative = {
  progress: 0,
  hero: 0,
  pointerX: 0,
  pointerY: 0,
};

export const INITIAL_VISIBLE_PROJECTS_COUNT = 5;

export type TechIconKey =
  | 'react'
  | 'nextjs'
  | 'typescript'
  | 'javascript'
  | 'html5'
  | 'css3'
  | 'tailwindcss'
  | 'gsap'
  | 'figma'
  | 'nodejs'
  | 'express'
  | 'supabase'
  | 'postgresql'
  | 'git'
  | 'github'
  | 'c'
  | 'python'
  | 'fastapi'
  | 'code';

export type SkillCategoryId = 'frontend' | 'styling-motion' | 'backend-data' | 'workflow';

export interface TechStackItem {
  name: string;
  role: string;
  iconKey: TechIconKey;
  accentColor: string;
}

export interface TechStackCategory {
  id: SkillCategoryId;
  index: string;
  title: string;
  label: string;
  columns: 2 | 3;
  items: TechStackItem[];
}

export interface SkillRecord {
  id: string;
  slug: string;
  name: string;
  role: string;
  category_id: SkillCategoryId;
  icon_key: TechIconKey;
  accent_color: string;
  display_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export const TECH_STACK_CATEGORIES: TechStackCategory[] = [
  {
    id: 'frontend',
    index: '01',
    title: 'FRONTEND & CORE LANGUAGES',
    label: '01 / FRONTEND & CORE LANGUAGES',
    columns: 3,
    items: [
      { name: 'React', role: 'UI Architecture', iconKey: 'react', accentColor: '#61DAFB' },
      { name: 'Next.js', role: 'Full-Stack SSR', iconKey: 'nextjs', accentColor: '#FFFFFF' },
      { name: 'TypeScript', role: 'Type System', iconKey: 'typescript', accentColor: '#3178C6' },
      { name: 'JavaScript', role: 'Core Runtime', iconKey: 'javascript', accentColor: '#F7DF1E' },
      { name: 'HTML5', role: 'Semantic Web', iconKey: 'html5', accentColor: '#E34F26' },
      { name: 'CSS3', role: 'Modern Layout', iconKey: 'css3', accentColor: '#1572B6' },
    ],
  },
  {
    id: 'styling-motion',
    index: '02',
    title: 'STYLING, MOTION & INTERFACE DESIGN',
    label: '02 / STYLING, MOTION & INTERFACE DESIGN',
    columns: 3,
    items: [
      { name: 'Tailwind CSS', role: 'Design Tokens', iconKey: 'tailwindcss', accentColor: '#06B6D4' },
      { name: 'GSAP', role: 'Motion Engine', iconKey: 'gsap', accentColor: '#28d765' },
      { name: 'Figma', role: 'Interface Design', iconKey: 'figma', accentColor: '#F24E1E' },
    ],
  },
  {
    id: 'backend-data',
    index: '03',
    title: 'BACKEND, DATABASE & CLOUD',
    label: '03 / BACKEND, DATABASE & CLOUD',
    columns: 2,
    items: [
      { name: 'Node.js', role: 'Server Runtime', iconKey: 'nodejs', accentColor: '#5FA04E' },
      { name: 'Express.js', role: 'REST API Layer', iconKey: 'express', accentColor: '#E2E8F0' },
      { name: 'Supabase', role: 'Cloud Auth & DB', iconKey: 'supabase', accentColor: '#3ECF8E' },
      { name: 'PostgreSQL', role: 'Relational DB', iconKey: 'postgresql', accentColor: '#4169E1' },
    ],
  },
  {
    id: 'workflow',
    index: '04',
    title: 'VERSION CONTROL & WORKFLOW',
    label: '04 / VERSION CONTROL & WORKFLOW',
    columns: 2,
    items: [
      { name: 'Git', role: 'Source Control', iconKey: 'git', accentColor: '#F05032' },
      { name: 'GitHub', role: 'Repos & CI/CD', iconKey: 'github', accentColor: '#FFFFFF' },
    ],
  },
];

export const INITIAL_SKILLS: SkillRecord[] = TECH_STACK_CATEGORIES.flatMap((cat) =>
  cat.items.map((item, idx) => ({
    id: `skill-${cat.id}-${idx + 1}`,
    slug: item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    name: item.name,
    role: item.role,
    category_id: cat.id,
    icon_key: item.iconKey,
    accent_color: item.accentColor,
    display_order: idx + 1,
    published: true,
  }))
);

/**
 * Pure helper to group dynamic SkillRecord rows into the 4 editorial TechStackCategory groups.
 * Falls back to TECH_STACK_CATEGORIES if no published skill rows are provided.
 */
export function buildTechStackCategories(skills: SkillRecord[]): TechStackCategory[] {
  const published = (skills || []).filter((s) => s.published);
  if (published.length === 0) {
    return TECH_STACK_CATEGORIES;
  }

  return TECH_STACK_CATEGORIES.map((meta) => {
    const matching = published
      .filter((s) => s.category_id === meta.id)
      .sort((a, b) => a.display_order - b.display_order)
      .map((s) => ({
        name: s.name,
        role: s.role,
        iconKey: s.icon_key,
        accentColor: s.accent_color || '#ff8c59',
      }));

    return {
      ...meta,
      items: matching,
    };
  }).filter((cat) => cat.items.length > 0);
}

/**
 * Pure helper to filter showcase items by selected category filter
 */
export function filterVideos(videos: VideoItem[], filter: VideoFilter): VideoItem[] {
  return videos.filter((video) => {
    if (filter === 'All modules') return true;
    return video.category === filter;
  });
}

/**
 * Pure helper to slice visible project cards (5 by default, all when expanded)
 */
export function getVisibleVideos(
  videos: VideoItem[],
  expanded: boolean,
  limit: number = INITIAL_VISIBLE_PROJECTS_COUNT
): { visible: VideoItem[]; hasMore: boolean; hiddenCount: number } {
  const safeLimit = Math.max(1, limit);
  const hasMore = videos.length > safeLimit;
  const visible = expanded ? videos : videos.slice(0, safeLimit);
  const hiddenCount = Math.max(0, videos.length - safeLimit);
  return { visible, hasMore, hiddenCount };
}

/**
 * Pure helper to format the selected module count label
 */
export function formatFilmCount(count: number): string {
  return `${String(count).padStart(2, '0')} SELECTED MODULES`;
}

/**
 * Pure helper to retrieve perspective item for SignalExplorer
 */
export function getPerspectiveItem(impact: boolean, index: number): PerspectiveItem {
  const list = impact ? IMPACT_PERSPECTIVES : ABOUT_PERSPECTIVES;
  const clamped = Math.max(0, Math.min(index, list.length - 1));
  return list[clamped];
}

/**
 * Pure helper to get active thinking path for Expertise studio
 */
export function getThinkingPath(activeIndex: number | null): ThinkingPathItem {
  const idx = activeIndex ?? 0;
  const clamped = Math.max(0, Math.min(idx, THINKING_PATHS.length - 1));
  return THINKING_PATHS[clamped];
}

/**
 * Pure helper for SignalText scramble frame generation
 */
export function scrambleSignalText(text: string, progress: number, timestampMs: number): string {
  const clamped = Math.max(0, Math.min(progress, 1));
  if (clamped >= 1) return text;
  const glyphs = '01/·—';
  const tick = Math.floor(timestampMs / 50);
  return [...text]
    .map((ch, idx) => {
      if (ch === ' ' || idx < text.length * clamped) return ch;
      return glyphs[(idx + tick) % 5];
    })
    .join('');
}

/**
 * Pure helper to normalize a project or certificate slug
 */
export function normalizeProjectSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Pure helper to validate contact form submissions before inserting to Supabase
 */
export function validateContactPayload(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): { valid: boolean; error?: string } {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  if (name.length < 2 || name.length > 120) {
    return { valid: false, error: 'Please enter a valid name (2–120 characters).' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (message.length < 5 || message.length > 4000) {
    return { valid: false, error: 'Message must be between 5 and 4,000 characters.' };
  }
  return { valid: true };
}

/**
 * Authorized portfolio administrator allowlist
 */
export const AUTHORIZED_ADMIN_EMAIL = 'chandreshme01@gmail.com';
export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [AUTHORIZED_ADMIN_EMAIL];

/**
 * Pure helper to normalize VITE_SUPABASE_URL so accidental paths like /rest/v1/
 * or trailing slashes are stripped to the clean https://<project-ref>.supabase.co origin.
 */
export function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed || !trimmed.startsWith('http') || trimmed.includes('MY_SUPABASE')) {
    return '';
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/+(rest|auth|storage)\/v1\/?$/i, '').replace(/\/+$/, '');
  }
}

/**
 * Pure helper to verify if an email belongs to the authorized administrator allowlist.
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
}

/**
 * Pure helper to verify if a Supabase Auth user object is an authorized administrator.
 * Checks the verified email allowlist (chandreshme01@gmail.com) or server-controlled
 * app_metadata.role === 'admin'. Never trusts client-mutable user_metadata.
 */
export function isAuthorizedAdminUser(
  user?: {
    email?: string | null;
    app_metadata?: Record<string, unknown> | null;
    user_metadata?: Record<string, unknown> | null;
  } | null
): boolean {
  if (!user) return false;
  if (isAuthorizedAdminEmail(user.email)) return true;
  const appRole =
    user.app_metadata && typeof user.app_metadata.role === 'string'
      ? user.app_metadata.role.trim().toLowerCase()
      : '';
  return appRole === 'admin';
}

export type RouteId =
  | 'home'
  | 'about'
  | 'work'
  | 'skills'
  | 'services'
  | 'contact'
  | 'admin'
  | 'work-cinematic-portfolio'
  | 'work-jal-setu'
  | 'work-campus-book'
  | 'work-algorithmic-practice-suite'
  | 'work-ai-hardware-labs'
  | 'work-project';

/**
 * Pure route resolver for pathname
 */
export function resolveRoute(pathname: string): RouteId {
  const clean = pathname.replace(/\/+$/, '') || '/';
  switch (clean) {
    case '/45861563/admin':
      return 'admin';
    case '/about':
      return 'about';
    case '/work':
    case '/content':
      return 'work';
    case '/skills':
    case '/education':
      return 'skills';
    case '/services':
    case '/speaking':
      return 'services';
    case '/contact':
      return 'contact';
    case '/work/cinematic-portfolio':
      return 'work-cinematic-portfolio';
    case '/work/jal-setu':
      return 'work-jal-setu';
    case '/work/campus-book':
      return 'work-campus-book';
    case '/work/algorithmic-practice-suite':
      return 'work-algorithmic-practice-suite';
    case '/work/ai-hardware-labs':
      return 'work-ai-hardware-labs';
    default:
      if (clean.startsWith('/work/') && clean.length > '/work/'.length) {
        return 'work-project';
      }
      return 'home';
  }
}
