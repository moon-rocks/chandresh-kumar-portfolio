import { ArrowLeft, ArrowRight, ArrowUpRight, Code2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  LEARNING_JOURNEY_HEADING,
  LEARNING_JOURNEY_SUBTITLE,
  parseProjectMetadata,
  RouteId,
} from '../data/portfolioData';
import { ContactForm } from './ContactForm';
import { MediaShowcase } from './MediaShowcase';

function EditorialFooter() {
  return (
    <footer className="editorial-footer">
      <a href="/">Chandresh Kumar</a>
      <div>
        <a
          href="https://github.com/moon-rocks"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
        <a
          href="https://moon-rocks.github.io/PORTFOLIO/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Portfolio ↗
        </a>
        <a
          href="https://github.com/moon-rocks/Jal_setu"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jal_setu ↗
        </a>
        <a
          href="https://github.com/moon-rocks/campus-book"
          target="_blank"
          rel="noopener noreferrer"
        >
          Campus-Book ↗
        </a>
      </div>
      <span>India · Thinking Beyond</span>
    </footer>
  );
}

export function SubPage({
  route,
  pathname = '',
}: {
  route: Exclude<RouteId, 'home' | 'admin'>;
  pathname?: string;
}) {
  const { projects, techStackCategories, learningJourneyItems } = usePortfolio();
  if (route === 'about') {
    return (
      <main id="main" className="editorial-page">
        <div className="editorial-intro">
          <span className="eyebrow">THE PERSON / THE PERSPECTIVE</span>
          <h1>Ideas into interfaces.</h1>
          <p>
            Diploma in Computer Science &amp; Engineering student at Government Polytechnic
            Muzaffarpur (2025–2028) and aspiring software engineer building practical full-stack web
            applications.
          </p>
        </div>
        <div className="editorial-layout">
          <aside>
            <span className="eyebrow">IN THIS CHAPTER</span>
            <nav aria-label="On this page">
              <a href="#section-0">My story</a>
              <a href="#section-1">Education &amp; Current Studies</a>
              <a href="#section-2">Projects &amp; Practical Builds</a>
              <a href="#section-3">Engineering Interests</a>
              <a href="#section-4">My Learning Journey</a>
              <a href="#capabilities">Technical Skills &amp; Stack</a>
            </nav>
            <a className="text-link" href="/contact">
              Start a project <ArrowUpRight size={14} />
            </a>
          </aside>
          <div>
            <section className="editorial-section" id="section-0">
              <span className="eyebrow">01</span>
              <h2>My story</h2>
              <p>
                I’m Chandresh Kumar, a Computer Science &amp; Engineering diploma student at
                Government Polytechnic Muzaffarpur and an aspiring software engineer. My journey in
                technology started with a curiosity about how everyday digital tools work under the
                hood and grew into a habit of learning by building real software from scratch.
              </p>
              <p>
                Rather than waiting until graduation to write production-style code, I use every
                semester to turn classroom concepts into working web applications. From programming
                fundamentals in C, Python, and JavaScript to modern full-stack development with
                React, Next.js, TypeScript, Tailwind CSS, Node.js, Express.js, FastAPI, PostgreSQL,
                and Supabase, I focus on writing clean, maintainable code.
              </p>
              <p>
                My goal is simple: grow into a well-rounded software engineer by solving real-world
                student and community problems through thoughtful interfaces, reliable backend
                systems, and continuous hands-on practice.
              </p>
            </section>
            <section className="editorial-section" id="section-1">
              <span className="eyebrow">02</span>
              <h2>Education &amp; Current Studies</h2>
              <p>
                I am currently pursuing my <b>Diploma in Computer Science &amp; Engineering</b> at{' '}
                <b>Government Polytechnic Muzaffarpur</b> (2025–Present), with expected completion
                in <b>2028</b>. My academic studies include Engineering Mathematics, Applied
                Chemistry, C Programming, Web Development, and Communication Skills.
              </p>
              <p>
                Before beginning my diploma, I completed my <b>Class 10</b> under the{' '}
                <b>Bihar School Examination Board (BSEB)</b> in <b>2025</b>, achieving{' '}
                <b>89.4%</b>. That academic foundation gave me the discipline to pursue Computer
                Science &amp; Engineering and develop my interest in programming and technology.
              </p>
            </section>
            <section className="editorial-section" id="section-2">
              <span className="eyebrow">03</span>
              <h2>Projects &amp; Practical Builds</h2>
              <p>
                I learn best by shipping projects that address practical needs. My work includes{' '}
                <b>JalSetu</b>, a civic water-issue reporting platform designed to help communities
                report and track local water utility problems, and <b>Campus Book</b>, a student
                book marketplace and academic resource hub built for exchanging textbooks and study
                materials.
              </p>
              <p>
                I have also built a <b>Digital Library</b> web application for organized access to
                learning resources, along with my <b>personal portfolio</b> crafted with React,
                Next.js, TypeScript, Tailwind CSS, GSAP, and Supabase to showcase my ongoing builds
                and technical growth.
              </p>
              <a
                className="text-link"
                href="https://moon-rocks.github.io/PORTFOLIO/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore the live portfolio
                <ArrowUpRight size={16} />
              </a>
            </section>
            <section className="editorial-section" id="section-3">
              <span className="eyebrow">04</span>
              <h2>Engineering Interests</h2>
              <p>
                My primary interests center on <b>full-stack development</b> and{' '}
                <b>backend engineering</b>—architecting responsive frontends alongside structured
                APIs, authentication workflows, and relational databases with Node.js, Express.js,
                FastAPI, PostgreSQL, and Supabase.
              </p>
              <p>
                Beyond web architecture, I am actively exploring <b>AI/ML</b> fundamentals and{' '}
                <b>cloud technologies</b>, always looking for ways to apply software engineering to
                solve real-world problems with clarity and reliability.
              </p>
            </section>
            <section className="editorial-section" id="section-4">
              <span className="eyebrow">05</span>
              <h2>{LEARNING_JOURNEY_HEADING}</h2>
              <p>
                <em>{LEARNING_JOURNEY_SUBTITLE}</em>
              </p>
              <div className="timeline">
                {learningJourneyItems.map((item) => (
                  <article key={item.step} className="timeline-phase">
                    <div className="timeline-meta">
                      <span className="timeline-step">
                        {item.phase} · {item.period}
                      </span>
                      <span className="timeline-status">{item.status}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p className="timeline-institution">
                      <strong>{item.institution}</strong>
                      <span>·</span>
                      <span>{item.qualification}</span>
                      <span>·</span>
                      <span>{item.achievement}</span>
                    </p>
                    <div className="timeline-copy">
                      {item.paragraphs.map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                    {item.highlights.length > 0 && (
                      <ul className="timeline-highlights" aria-label={`${item.title} highlights`}>
                        {item.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
            <section className="editorial-section" id="capabilities">
              <h2>Technical Skills &amp; Stack.</h2>
              <details className="competency" open>
                <summary>
                  Programming &amp; Core Web<span>+</span>
                </summary>
                <p>
                  C, Python, JavaScript, TypeScript, HTML, CSS.
                </p>
              </details>
              <details className="competency">
                <summary>
                  Frontend &amp; Motion<span>+</span>
                </summary>
                <p>
                  React, Next.js, TypeScript, Tailwind CSS, GSAP, HTML, CSS.
                </p>
              </details>
              <details className="competency">
                <summary>
                  Backend, APIs &amp; Databases<span>+</span>
                </summary>
                <p>
                  Node.js, Express.js, FastAPI, PostgreSQL, Supabase.
                </p>
              </details>
              <details className="competency">
                <summary>
                  Version Control &amp; Applied Projects<span>+</span>
                </summary>
                <p>
                  Git, GitHub — used to build and maintain JalSetu (civic water-issue reporting
                  platform), Campus Book (student book marketplace), Digital Library, and my
                  personal portfolio.
                </p>
              </details>
              <details className="competency">
                <summary>
                  Education &amp; Focus Areas<span>+</span>
                </summary>
                <p>
                  Diploma in Computer Science &amp; Engineering at Government Polytechnic
                  Muzaffarpur (2025–Present, expected 2028) · Class 10th, Bihar School Examination
                  Board (89.4%, 2025) · Full-Stack Development, Backend Engineering, AI/ML, and
                  Cloud Technologies.
                </p>
              </details>
            </section>
          </div>
        </div>
        <EditorialFooter />
      </main>
    );
  }

  const publishedProjects = [...projects]
    .filter((p) => p.published)
    .sort((a, b) => (Number(a.display_order) || 1) - (Number(b.display_order) || 1));

  if (route === 'work') {
    return (
      <main id="main" className="editorial-page">
        <div className="editorial-intro">
          <span className="eyebrow">WORK / IDEAS INTO INTERFACES</span>
          <h1>Creative Architecture.</h1>
          <p>
            Full-stack applications, cloud deployments, academic portals, and core computer science
            engineering labs.
          </p>
        </div>
        <MediaShowcase standalone={true} />
        <div className="work-index">
          {publishedProjects.map((proj, idx) => {
            const meta = parseProjectMetadata(proj);
            return (
              <a key={proj.id} href={`/work/${proj.slug}`}>
                <span className="eyebrow">
                  0{proj.display_order || idx + 1} / {meta.displayCategory}
                </span>
                <h2>
                  {proj.title}
                  <span>↗</span>
                </h2>
                <p>{proj.summary}</p>
              </a>
            );
          })}
        </div>
        <div className="editorial-section">
          <h2>Open source &amp; cloud deployments.</h2>
          <p>
            3+ core web applications deployed across Vercel, Render, and GitHub Pages with 100%
            modern stack execution (React, Next.js, TypeScript, Supabase, Tailwind CSS).
          </p>
          <a
            className="text-link"
            href="https://github.com/moon-rocks"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore GitHub (@moon-rocks) ↗
          </a>
        </div>
        <a className="text-link" href="/#contact">
          Have a project in mind? Let’s talk ↗
        </a>
        <EditorialFooter />
      </main>
    );
  }

  if (route === 'skills') {
    return (
      <main id="main" className="editorial-page">
        <div className="editorial-intro">
          <span className="eyebrow">SKILLS / METHODOLOGY &amp; TECHNICAL STACK</span>
          <h1>Prototype. Engineer. Deploy.</h1>
          <p>
            100% modern stack focus combining React, Next.js, TypeScript, Tailwind CSS, and Supabase
            with Polytechnic CSE foundations in AI and Electronics.
          </p>
        </div>
        <div className="editorial-layout">
          <aside>
            <span className="eyebrow">IN THIS CHAPTER</span>
            <nav aria-label="On this page">
              <a href="#section-0">01 / Prototype &amp; Architect</a>
              <a href="#section-1">02 / Engineer with Modern Stack</a>
              <a href="#section-2">03 / Deploy &amp; Monitor</a>
              <a href="#section-3">04 / Academic &amp; Continuous Skilling</a>
              <a href="#section-4">05 / Verified Technical Stack</a>
            </nav>
            <a className="text-link" href="/#content">
              Explore Selected Projects <ArrowUpRight size={14} />
            </a>
            <a className="text-link" href="/#contact">
              Start a project <ArrowUpRight size={14} />
            </a>
          </aside>
          <div>
            <section className="editorial-section" id="section-0">
              <span className="eyebrow">01</span>
              <h2>Prototype &amp; Architect</h2>
              <p>
                Every project begins with structured interface architecture in Figma (Education
                Plan), clear component hierarchy, and database schema planning for Supabase.
              </p>
            </section>
            <section className="editorial-section" id="section-1">
              <span className="eyebrow">02</span>
              <h2>Engineer with Modern Stack</h2>
              <p>
                Frontend &amp; Frameworks: React, Next.js, TypeScript, Tailwind CSS, Modern
                HTML5/CSS3, and Canvas API. Developer workflow accelerated with VS Code, GitHub
                Copilot, Git, and Claude.
              </p>
            </section>
            <section className="editorial-section" id="section-2">
              <span className="eyebrow">03</span>
              <h2>Deploy &amp; Monitor</h2>
              <p>
                Backend &amp; Cloud: Supabase (Database, Auth, Media Storage), Render, Vercel,
                GitHub Pages, and GitHub Actions with Core Web Vitals optimization.
              </p>
            </section>
            <section className="editorial-section" id="section-3">
              <span className="eyebrow">04</span>
              <h2>Academic &amp; Continuous Skilling</h2>
              <p>
                Polytechnic Expert CSE — Artificial Intelligence &amp; Electrical/Electronics
                Engineering, FutureSkills Prime certified coursework, Udemy Technical
                Specializations, and LeetCode &amp; GeeksforGeeks algorithmic practice.
              </p>
            </section>
            <section className="editorial-section" id="section-4">
              <span className="eyebrow">05</span>
              <h2>Verified Technical Stack</h2>
              <div className="capabilities-list">
                {techStackCategories.map((cat) => (
                  <div key={cat.id}>
                    <span>{cat.title}</span>
                    <p>{cat.items.map((item) => `${item.name} (${item.role})`).join(' · ')}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        <EditorialFooter />
      </main>
    );
  }

  if (route === 'services') {
    return (
      <main id="main" className="editorial-page">
        <div className="editorial-intro">
          <span className="eyebrow">SERVICES / CREATIVE WEB ENGINEERING</span>
          <h1>Ideas into memorable digital experiences.</h1>
          <p>
            Creative web design, full-stack Next.js &amp; Supabase applications, interactive UI/UX
            prototyping, and cloud deployment.
          </p>
        </div>
        <div className="editorial-photo">
          <img
            alt="Chandresh Kumar creative web architecture showcase"
            loading="lazy"
            width={1600}
            height={1200}
            decoding="async"
            src="/images/work/services-stage.svg"
          />
          <p className="eyebrow">DESIGNED IN FIGMA · ENGINEERED WITH NEXT.JS &amp; SUPABASE</p>
        </div>
        <div className="editorial-layout">
          <aside>
            <span className="eyebrow">IN THIS CHAPTER</span>
            <nav aria-label="On this page">
              <a href="#section-0">Creative Web Development</a>
              <a href="#section-1">Full-Stack &amp; Cloud Platforms</a>
              <a href="#section-2">UI/UX &amp; Interactive Prototyping</a>
              <a href="#section-3">Start a Collaboration</a>
            </nav>
            <a className="text-link" href="/contact">
              Start a project <ArrowUpRight size={14} />
            </a>
          </aside>
          <div>
            <section className="editorial-section" id="section-0">
              <span className="eyebrow">01</span>
              <h2>Creative Web Development</h2>
              <p>
                Responsive, cinematic websites and portfolios built with React, Next.js, TypeScript,
                Tailwind CSS, and Canvas API micro-interactions.
              </p>
            </section>
            <section className="editorial-section" id="section-1">
              <span className="eyebrow">02</span>
              <h2>Full-Stack &amp; Cloud Platforms</h2>
              <p>
                End-to-end web applications integrated with Supabase (Database, Auth, Media Storage)
                and deployed across Vercel, Render, and GitHub Pages.
              </p>
            </section>
            <section className="editorial-section" id="section-2">
              <span className="eyebrow">03</span>
              <h2>UI/UX &amp; Interactive Prototyping</h2>
              <p>
                Translating concepts into clean design systems and interactive prototypes using
                Figma (Education Plan) and modern CSS architecture.
              </p>
            </section>
            <section className="editorial-section" id="section-3">
              <span className="eyebrow">04</span>
              <h2>Start a Collaboration</h2>
              <p>
                Open to web development projects, technical internships, full-stack prototypes, and
                open-source collaborations.
              </p>
              <a
                className="text-link"
                href="https://github.com/moon-rocks"
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on GitHub (@moon-rocks)
                <ArrowUpRight size={16} />
              </a>
            </section>
          </div>
        </div>
        <EditorialFooter />
      </main>
    );
  }

  if (route === 'contact') {
    return (
      <main id="main" className="editorial-page">
        <div className="editorial-intro">
          <span className="eyebrow">CONTACT / THE NEXT CHAPTER</span>
          <h1>Something great starts with a hello.</h1>
          <p>
            Web development, interactive UI/UX, full-stack prototypes, and open-source
            collaborations.
          </p>
        </div>
        <div className="editorial-layout">
          <aside>
            <span className="eyebrow">IN THIS CHAPTER</span>
            <nav aria-label="On this page">
              <a href="#section-0">Creative Web &amp; Frontend</a>
              <a href="#section-1">Full-Stack &amp; Cloud</a>
              <a href="#section-2">Internships &amp; Open Source</a>
              <a href="#section-3">Connect Online</a>
            </nav>
            <a
              className="text-link"
              href="https://github.com/moon-rocks"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub (@moon-rocks) <ArrowUpRight size={14} />
            </a>
          </aside>
          <div>
            <section className="editorial-section" id="section-0">
              <span className="eyebrow">01</span>
              <h2>Creative Web &amp; Frontend</h2>
              <p>
                Collaborate on responsive web interfaces, interactive portfolios, and high-craft
                frontend experiences powered by React, Next.js, TypeScript, and Tailwind CSS.
              </p>
            </section>
            <section className="editorial-section" id="section-1">
              <span className="eyebrow">02</span>
              <h2>Full-Stack &amp; Cloud</h2>
              <p>
                Build and deploy cloud-hosted web applications using Supabase, Render, Vercel, and
                GitHub Pages.
              </p>
            </section>
            <section className="editorial-section" id="section-2">
              <span className="eyebrow">03</span>
              <h2>Internships &amp; Open Source</h2>
              <p>
                Open to software engineering internships, collaborative student portals, AI
                explorations, and open-source contributions.
              </p>
            </section>
            <section className="editorial-section" id="section-3">
              <span className="eyebrow">04</span>
              <h2>Connect Online</h2>
              <p>
                Send a message directly to my Supabase inbox below, or explore my repositories and
                live deployments on GitHub.
              </p>
              <ContactForm />
            </section>
          </div>
        </div>
        <EditorialFooter />
      </main>
    );
  }

  if (route === 'work-cinematic-portfolio') {
    const proj = projects.find((p) => p.slug === 'cinematic-portfolio');
    const meta = proj ? parseProjectMetadata(proj) : null;
    return (
      <main id="main" className="case-page">
        <a className="text-link" href="/#content">
          <ArrowLeft size={16} /> Back to projects showcase
        </a>
        <div className="case-intro">
          <span className="eyebrow">
            SELECTED WORK / 0{proj?.display_order || 1} /{' '}
            {meta?.displayCategory || 'Creative Web Development & CMS'}
          </span>
          <h1>
            {proj?.title || 'Cinematic Interactive Portfolio'}
            <span>.</span>
          </h1>
          <p>
            {proj?.summary ||
              'Responsive, cinematic web experience with interactive project cards, micro-interactions, Core Web Vitals optimization, and Supabase CMS integration.'}
          </p>
          <div className="case-role">
            <span>KEY TECH</span>
            <p>
              {proj?.key_tech?.length
                ? proj.key_tech.join(' · ')
                : 'Next.js · React · TypeScript · Tailwind CSS · Supabase'}
            </p>
          </div>
        </div>
        <div className="project-visual real-work-visual platform-art">
          <div className="work-browser-bar">
            <span>
              <i />
              <i />
              <i />
            </span>
            <span>{proj?.browser_label || 'moon-rocks.github.io/PORTFOLIO'}</span>
            <span>↗</span>
          </div>
          <img
            alt={proj?.title || 'Cinematic Interactive Portfolio by Chandresh Kumar'}
            loading="eager"
            width={1440}
            height={660}
            decoding="async"
            src={proj?.image_url || '/images/work/cinematic-portfolio.svg'}
          />
          <div className="work-artifact-label">
            <span>{(meta?.displayCategory || 'CREATIVE WEB DEVELOPMENT & CMS').toUpperCase()}</span>
            <span>CANONICAL PORTFOLIO DEPLOYMENT</span>
          </div>
        </div>
        <div className="case-body">
          <section>
            <span className="eyebrow">01 / ARCHITECTURE</span>
            <h2>Ideas into interfaces.</h2>
            <p>
              Designed and engineered to showcase creative web architecture through fluid motion,
              responsive typography, interactive project cards, and zero-CLS layout stability.
            </p>
          </section>
          <section>
            <span className="eyebrow">02 / ENGINEERING EXECUTION</span>
            <h2>Modern full-stack integration.</h2>
            <p>
              Built with Next.js, React, TypeScript, and Tailwind CSS, backed by Supabase for
              dynamic content management, authentication, and media asset storage.
            </p>
          </section>
          <section className="case-details">
            <span className="eyebrow">03 / KEY CAPABILITIES</span>
            <article>
              <h3>Interactive UI &amp; Motion</h3>
              <p>
                Custom micro-interactions, WebGL/Canvas visual layers, and accessible keyboard and
                pointer navigation.
              </p>
            </article>
            <article>
              <h3>Core Web Vitals Optimization</h3>
              <p>
                Asset preloading, responsive image sizing, and high-contrast editorial typography.
              </p>
            </article>
            <article>
              <h3>Supabase CMS</h3>
              <p>
                Cloud-backed persistence for portfolio items, metadata, and media storage.
              </p>
            </article>
          </section>
          <section>
            <span className="eyebrow">04 / LIVE DEPLOYMENT</span>
            <h2>
              A flagship web experience uniting creative design and modern full-stack engineering.
            </h2>
            <a
              className="pill-link"
              href={proj?.live_url || 'https://moon-rocks.github.io/PORTFOLIO/'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Live Portfolio
              <ArrowUpRight size={16} />
            </a>
          </section>
        </div>
        <a className="next-story" href="/work/jal-setu">
          <span className="eyebrow">NEXT PROJECT</span>
          <span>
            Jal-Setu Platform
            <ArrowRight size={24} />
          </span>
        </a>
        <div className="case-footer">
          <a href="/#content">All Selected Projects ↗</a>
          <a href="/#contact">Let’s build something memorable ↗</a>
        </div>
      </main>
    );
  }

  if (route === 'work-jal-setu') {
    const proj = projects.find((p) => p.slug === 'jal-setu');
    const meta = proj ? parseProjectMetadata(proj) : null;
    return (
      <main id="main" className="case-page">
        <a className="text-link" href="/#content">
          <ArrowLeft size={16} /> Back to projects showcase
        </a>
        <div className="case-intro">
          <span className="eyebrow">
            SELECTED WORK / 0{proj?.display_order || 2} /{' '}
            {meta?.displayCategory || 'Infrastructure & Cloud Web App'}
          </span>
          <h1>
            {proj?.title || 'Jal-Setu Platform'}
            <span>.</span>
          </h1>
          <p>
            {proj?.summary ||
              'Web application for public utility monitoring and water resource management, containerized and deployed across Render and GitHub Pages.'}
          </p>
          <div className="case-role">
            <span>KEY TECH</span>
            <p>
              {proj?.key_tech?.length
                ? proj.key_tech.join(' · ')
                : 'Full-Stack Web · Render · Cloud Hosting · GitHub Actions'}
            </p>
          </div>
        </div>
        <div className="project-visual real-work-visual bootcamp-art">
          <div className="work-browser-bar">
            <span>
              <i />
              <i />
              <i />
            </span>
            <span>{proj?.browser_label || 'github.com/moon-rocks/Jal_setu'}</span>
            <span>↗</span>
          </div>
          <img
            alt={proj?.title || 'Jal_setu Platform public utility monitoring web application'}
            loading="eager"
            width={1440}
            height={660}
            decoding="async"
            src={proj?.image_url || '/images/work/jal-setu.svg'}
          />
          <div className="work-artifact-label">
            <span>{(meta?.displayCategory || 'INFRASTRUCTURE & CLOUD WEB APP').toUpperCase()}</span>
            <span>RENDER &amp; GITHUB PAGES DEPLOYMENT</span>
          </div>
        </div>
        <div className="case-body">
          <section>
            <span className="eyebrow">01 / CONTEXT</span>
            <h2>Public utility &amp; water resource monitoring.</h2>
            <p>
              Jal_setu is engineered to bring visibility, structured workflows, and accessible web
              dashboards to public utility monitoring and water resource management.
            </p>
          </section>
          <section>
            <span className="eyebrow">02 / CLOUD INFRASTRUCTURE</span>
            <h2>Multi-target deployment pipeline.</h2>
            <p>
              Configured for reliable cloud hosting across Render and GitHub Pages with automated
              GitHub Actions workflows supporting continuous integration and deployment.
            </p>
          </section>
          <section className="case-details">
            <span className="eyebrow">03 / SYSTEM HIGHLIGHTS</span>
            <article>
              <h3>Utility Telemetry &amp; Reporting</h3>
              <p>
                Structured interfaces for monitoring water distribution status and civic utility
                updates.
              </p>
            </article>
            <article>
              <h3>Cloud Hosting on Render</h3>
              <p>
                Production web service deployment with automated build and runtime health checks.
              </p>
            </article>
            <article>
              <h3>GitHub Actions CI/CD</h3>
              <p>
                Automated workflows keeping repository branches and static/cloud targets in sync.
              </p>
            </article>
          </section>
          <section>
            <span className="eyebrow">04 / OPEN SOURCE REPOSITORY</span>
            <h2>
              Practical full-stack web engineering applied to civic infrastructure and resource
              management.
            </h2>
            <a
              className="pill-link"
              href={proj?.live_url || 'https://github.com/moon-rocks/Jal_setu'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Jal_setu on GitHub
              <ArrowUpRight size={16} />
            </a>
          </section>
        </div>
        <a className="next-story" href="/work/campus-book">
          <span className="eyebrow">NEXT PROJECT</span>
          <span>
            Campus-Book Platform
            <ArrowRight size={24} />
          </span>
        </a>
        <div className="case-footer">
          <a href="/#content">All Selected Projects ↗</a>
          <a href="/#contact">Let’s build something memorable ↗</a>
        </div>
      </main>
    );
  }

  if (route === 'work-campus-book') {
    const proj = projects.find((p) => p.slug === 'campus-book');
    const meta = proj ? parseProjectMetadata(proj) : null;
    return (
      <main id="main" className="case-page">
        <a className="text-link" href="/#content">
          <ArrowLeft size={16} /> Back to projects showcase
        </a>
        <div className="case-intro">
          <span className="eyebrow">
            SELECTED WORK / 0{proj?.display_order || 3} /{' '}
            {meta?.displayCategory || 'Academic Portal & Repository'}
          </span>
          <h1>
            {proj?.title || 'Campus-Book Platform'}
            <span>.</span>
          </h1>
          <p>
            {proj?.summary ||
              'Centralized academic repository and collaborative documentation hub designed to organize CS notes, study material, and technical resources.'}
          </p>
          <div className="case-role">
            <span>KEY TECH</span>
            <p>
              {proj?.key_tech?.length
                ? proj.key_tech.join(' · ')
                : 'Static Web Architecture · GitHub Pages · Markdown · CSS'}
            </p>
          </div>
        </div>
        <div className="project-visual course-art">
          <img
            alt={proj?.title || 'Campus-Book Platform academic repository'}
            loading="eager"
            width={480}
            height={360}
            decoding="async"
            src={proj?.image_url || '/images/work/campus-book.svg'}
          />
          <div className="course-art-note">
            <Code2 size={20} />
            <span>
              {(proj?.title || 'CAMPUS-BOOK PLATFORM').toUpperCase()}
              <br />
              <small>{(meta?.displayCategory || 'ACADEMIC PORTAL & REPOSITORY').toUpperCase()}</small>
            </span>
          </div>
        </div>
        <div className="case-body">
          <section>
            <span className="eyebrow">01 / CONTEXT</span>
            <h2>Organizing computer science knowledge.</h2>
            <p>
              Campus-Book was built to give students a fast, centralized academic portal where
              coursework notes, syllabus references, and technical documentation stay structured and
              easy to navigate.
            </p>
          </section>
          <section>
            <span className="eyebrow">02 / ARCHITECTURE</span>
            <h2>Fast static web delivery.</h2>
            <p>
              Engineered with clean semantic markup, modular CSS, and Markdown-driven documentation
              hosted on GitHub Pages for instant load times across mobile and desktop devices.
            </p>
          </section>
          <section className="case-details">
            <span className="eyebrow">03 / KEY FEATURES</span>
            <article>
              <h3>Centralized Study Hub</h3>
              <p>
                Structured modules for Polytechnic CSE coursework, notes, and lab documentation.
              </p>
            </article>
            <article>
              <h3>Collaborative Repository</h3>
              <p>
                Version-controlled on GitHub so contributors can propose updates and add resources.
              </p>
            </article>
            <article>
              <h3>GitHub Pages Hosting</h3>
              <p>
                Zero-overhead static hosting delivering reliable access for students anywhere.
              </p>
            </article>
          </section>
          <section>
            <span className="eyebrow">04 / SOURCE &amp; DOCS</span>
            <h2>
              Built for students—making academic notes and technical resources accessible in one
              place.
            </h2>
            <a
              className="pill-link"
              href={proj?.live_url || 'https://github.com/moon-rocks/campus-book'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Campus-Book on GitHub
              <ArrowUpRight size={16} />
            </a>
          </section>
        </div>
        <a className="next-story" href="/work/algorithmic-practice-suite">
          <span className="eyebrow">NEXT PROJECT</span>
          <span>
            Algorithmic Practice Suite
            <ArrowRight size={24} />
          </span>
        </a>
        <div className="case-footer">
          <a href="/#content">All Selected Projects ↗</a>
          <a href="/#contact">Let’s build something memorable ↗</a>
        </div>
      </main>
    );
  }

  if (route === 'work-algorithmic-practice-suite') {
    const proj = projects.find((p) => p.slug === 'algorithmic-practice-suite');
    const meta = proj ? parseProjectMetadata(proj) : null;
    return (
      <main id="main" className="case-page">
        <a className="text-link" href="/#content">
          <ArrowLeft size={16} /> Back to projects showcase
        </a>
        <div className="case-intro">
          <span className="eyebrow">
            SELECTED WORK / 0{proj?.display_order || 4} /{' '}
            {meta?.displayCategory || 'Core CS & Problem Solving'}
          </span>
          <h1>
            {proj?.title || 'Algorithmic Practice Suite'}
            <span>.</span>
          </h1>
          <p>
            {proj?.summary ||
              'Implementations of fundamental data structures, algorithms, and complexity analysis across LeetCode and GeeksforGeeks.'}
          </p>
          <div className="case-role">
            <span>KEY TECH</span>
            <p>
              {proj?.key_tech?.length
                ? proj.key_tech.join(' · ')
                : 'C++ · Python · Data Structures & Algorithms'}
            </p>
          </div>
        </div>
        <div className="case-body">
          <section>
            <span className="eyebrow">01 / OVERVIEW</span>
            <h2>Core computer science problem solving.</h2>
            <p>
              Ongoing algorithmic practice across LeetCode and GeeksforGeeks focusing on arrays,
              recursion, sorting, searching, linked structures, dynamic programming foundations, and
              time/space complexity optimization.
            </p>
          </section>
          <section className="case-details">
            <span className="eyebrow">02 / FOCUS AREAS</span>
            <article>
              <h3>Data Structures</h3>
              <p>Arrays, strings, hash maps, stacks, queues, trees, and graph representations.</p>
            </article>
            <article>
              <h3>Algorithmic Complexity</h3>
              <p>Writing clean C++ and Python solutions with rigorous Big-O analysis.</p>
            </article>
            <article>
              <h3>Competitive Practice</h3>
              <p>Continuous problem-solving drills on LeetCode and GeeksforGeeks.</p>
            </article>
          </section>
          <section>
            <a
              className="pill-link"
              href={proj?.live_url || 'https://github.com/moon-rocks'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore GitHub Profile
              <ArrowUpRight size={16} />
            </a>
          </section>
        </div>
        <a className="next-story" href="/work/ai-hardware-labs">
          <span className="eyebrow">NEXT PROJECT</span>
          <span>
            AI &amp; Hardware Engineering Labs
            <ArrowRight size={24} />
          </span>
        </a>
        <div className="case-footer">
          <a href="/#content">All Selected Projects ↗</a>
          <a href="/#contact">Let’s build something memorable ↗</a>
        </div>
      </main>
    );
  }

  if (route === 'work-project') {
    const slug = pathname.replace(/^\/work\//, '').replace(/\/+$/, '');
    const dynamicProj = projects.find((p) => p.slug === slug) || projects[0];
    const meta = dynamicProj ? parseProjectMetadata(dynamicProj) : null;
    return (
      <main id="main" className="case-page">
        <a className="text-link" href="/#content">
          <ArrowLeft size={16} /> Back to projects showcase
        </a>
        <div className="case-intro">
          <span className="eyebrow">
            SELECTED WORK / 0{dynamicProj?.display_order || 1} /{' '}
            {meta?.displayCategory || dynamicProj?.category || 'Engineering Project'}
          </span>
          <h1>
            {dynamicProj?.title || 'Engineering Case Study'}
            <span>.</span>
          </h1>
          <p>{dynamicProj?.summary}</p>
          <div className="case-role">
            <span>KEY TECH</span>
            <p>{(dynamicProj?.key_tech || []).join(' · ')}</p>
          </div>
        </div>
        {dynamicProj?.image_url && (
          <div className="project-visual real-work-visual platform-art">
            <div className="work-browser-bar">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>{dynamicProj.browser_label || dynamicProj.slug}</span>
              <span>↗</span>
            </div>
            <img
              alt={dynamicProj.title}
              loading="eager"
              width={1440}
              height={660}
              decoding="async"
              src={dynamicProj.image_url}
            />
          </div>
        )}
        <div className="case-body">
          <section>
            <span className="eyebrow">01 / PROJECT OVERVIEW</span>
            <h2>{dynamicProj?.title}</h2>
            <p>{dynamicProj?.summary}</p>
          </section>
          {dynamicProj?.live_url && (
            <section>
              <a
                className="pill-link"
                href={dynamicProj.live_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore Live Deployment / Repository
                <ArrowUpRight size={16} />
              </a>
            </section>
          )}
        </div>
        <div className="case-footer">
          <a href="/#content">All Selected Projects ↗</a>
          <a href="/#contact">Let’s build something memorable ↗</a>
        </div>
      </main>
    );
  }

  const aiProj = projects.find((p) => p.slug === 'ai-hardware-labs');
  const aiMeta = aiProj ? parseProjectMetadata(aiProj) : null;
  return (
    <main id="main" className="case-page">
      <a className="text-link" href="/#content">
        <ArrowLeft size={16} /> Back to projects showcase
      </a>
      <div className="case-intro">
        <span className="eyebrow">
          SELECTED WORK / 0{aiProj?.display_order || 5} /{' '}
          {aiMeta?.displayCategory || 'Polytechnic Academic Work'}
        </span>
        <h1>
          {aiProj?.title || 'AI & Hardware Engineering Labs'}
          <span>.</span>
        </h1>
        <p>
          {aiProj?.summary ||
            'Hands-on experiments covering Artificial Intelligence algorithms and circuit foundations in the Polytechnic Expert CSE program.'}
        </p>
        <div className="case-role">
          <span>KEY TECH</span>
          <p>
            {aiProj?.key_tech?.length
              ? aiProj.key_tech.join(' · ')
              : 'Artificial Intelligence · Digital Electronics · Electrical & Electronics Foundations'}
          </p>
        </div>
      </div>
      <div className="case-body">
        <section>
          <span className="eyebrow">01 / ACADEMIC MODULES</span>
          <h2>Bridging AI software and hardware logic.</h2>
          <p>
            First-semester Polytechnic Expert CSE laboratory work exploring search and heuristic
            foundations in Artificial Intelligence alongside fundamental electrical circuits and
            digital electronics logic gates.
          </p>
        </section>
        <section className="case-details">
          <span className="eyebrow">02 / LAB DOMAINS</span>
          <article>
            <h3>Artificial Intelligence</h3>
            <p>Foundational AI concepts, problem representation, and Python experimentation.</p>
          </article>
          <article>
            <h3>Digital Electronics</h3>
            <p>Boolean logic, combinational circuits, and hardware-level computing foundations.</p>
          </article>
          <article>
            <h3>Electrical Engineering Basics</h3>
            <p>Circuit analysis, instrumentation, and practical laboratory verification.</p>
          </article>
        </section>
        <section>
          <a
            className="pill-link"
            href={aiProj?.live_url || 'https://github.com/moon-rocks'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore GitHub (@moon-rocks)
            <ArrowUpRight size={16} />
          </a>
        </section>
      </div>
      <a className="next-story" href="/work/emerging-tech-skilling">
        <span className="eyebrow">NEXT PROJECT</span>
        <span>
          Emerging Tech &amp; Skilling
          <ArrowRight size={24} />
        </span>
      </a>
      <div className="case-footer">
        <a href="/#content">All Selected Projects ↗</a>
        <a href="/#contact">Let’s build something memorable ↗</a>
      </div>
    </main>
  );
}
