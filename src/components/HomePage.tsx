import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  IMPACT_TECHNICAL_SKILLS,
  LEARNING_JOURNEY_HEADING,
  LEARNING_JOURNEY_SUBTITLE,
  getPublishedAchievementMetrics,
  getPublishedProofStripCta,
} from '../data/portfolioData';
import { AchievementsMemoriesShowcase } from './AchievementsMemoriesShowcase';
import { ContactForm } from './ContactForm';
import { Expertise } from './Expertise';
import { MediaShowcase } from './MediaShowcase';
import { SignalExplorer } from './SignalExplorer';
import { SignalText } from './SignalText';
import { TechBrandIcon } from './TechBrandIcon';

export function HomePage() {
  const { achievements, learningJourneyItems, techStackCategories } = usePortfolio();
  const totalTechCount = techStackCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  const metricAchievements = getPublishedAchievementMetrics(achievements);
  const proofStripCta = getPublishedProofStripCta(achievements);

  const ach1 = metricAchievements[0];
  const ach2 = metricAchievements[1];

  return (
    <main id="main">
      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-topline">
          <span>
            <i className="live-dot" /> CREATIVE DESIGNER. DEVELOPER. CS STUDENT.
          </span>
          <span>BASED IN INDIA · THINKING BEYOND</span>
        </div>
        <div className="hero-content">
          <span className="hero-kicker">
            <SignalText>IDEAS INTO INTERFACES. CREATIVE ARCHITECTURE.</SignalText>
          </span>
          <h1>
            <span className="line-mask">
              <span className="reveal-line">
                Chandresh <em>Kumar</em>
              </span>
            </span>
          </h1>
          <div className="hero-description">
            <p>
              I turn ideas into memorable digital experiences, engineering modern full-stack web
              applications and exploring AI systems.
            </p>
            <div className="hero-actions">
              <a className="pill-link" href="#work">
                <SignalText>Explore my work</SignalText> <ArrowUpRight size={16} />
              </a>
              <a className="text-link" href="#contact">
                <SignalText>Start a project →</SignalText>
              </a>
            </div>
          </div>
        </div>
        <div className="hero-side-note">
          <span>01 / PRESENCE</span>
          <span>
            CREATIVE DESIGN
            <br />
            WEB ENGINEERING
            <br />
            AI &amp; CORE CS
          </span>
        </div>
        <div className="hero-bottom">
          <a href="#about">
            <span className="scroll-line" /> SCROLL TO DISCOVER <ArrowDown size={13} />
          </a>
          <span>POLYTECHNIC EXPERT CSE · SEMESTER 1</span>
          <span className="hero-edition">IDEAS INTO INTERFACES →</span>
        </div>
      </section>

      <section
        className="proof-strip"
        aria-label="Career highlights"
        data-has-cta={Boolean(proofStripCta)}
      >
        {metricAchievements.slice(0, 3).map((ach) => (
          <div key={ach.id}>
            <strong>
              {ach.metric_value}
              <span>{ach.metric_suffix}</span>
            </strong>
            <p>{ach.label}</p>
          </div>
        ))}
        {proofStripCta && (
          <a href={proofStripCta.href}>
            {proofStripCta.line1}
            {proofStripCta.line2 ? (
              <>
                <br />
                {proofStripCta.line2}
              </>
            ) : null}
            <ArrowUpRight size={22} />
          </a>
        )}
      </section>

      <section id="about" className="about chapter solid-section">
        <div className="section-label">
          <span>01 / THE PERSON BEHIND THE WORK</span>
          <span>A CONNECTED PERSPECTIVE</span>
        </div>
        <div className="about-grid">
          <div className="about-copy" data-reveal="true">
            <h2>
              Technology is
              <br />
              the starting point.
              <br />
              <em>Design is the experience.</em>
            </h2>
            <p className="lead">
              I connect creative design, full-stack engineering, and core computer science.
            </p>
            <p>
              As a Computer Science Engineering student specializing in Artificial Intelligence and
              Electronics, I bridge academic foundations with modern web production—
              <strong className="copy-highlight">
                building interactive portfolios, cloud-hosted platforms, and collaborative academic
                tools.
              </strong>
            </p>
            <a className="text-link" href="/about">
              Read my story <ArrowUpRight size={16} />
            </a>
            <div className="identity-notes">
              <span>CREATIVE DESIGNER.</span>
              <span>WEB DEVELOPER.</span>
              <span>POLYTECHNIC CSE STUDENT.</span>
            </div>
          </div>
          <SignalExplorer impact={false} />
        </div>
      </section>

      <section id="work" className="selected-work chapter solid-section tech-stack-section">
        <div className="tech-stack-frame border-t border-[#242424] pt-14 sm:pt-20">
          <div className="tech-stack-grid grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5 lg:sticky lg:top-28" data-reveal="true">
              <span className="eyebrow tech-stack-eyebrow mb-4 inline-flex items-center gap-2.5 text-[#8c8881]">
                <span className="tech-stack-live-dot h-1.5 w-1.5 rounded-full bg-[#ff8c59]" aria-hidden="true" />
                02 / VERIFIED TECHNICAL STACK
              </span>
              <h2 className="tech-stack-heading text-[#f1eee8]">
                Tools I use to
                <br />
                bring <em className="tech-stack-accent text-[#ff8c59]">ideas</em> to
                <br />
                life.
              </h2>
              <p className="tech-stack-lead mt-5 max-w-[410px] text-[#a8a49e]">
                A curated production stack spanning component architecture, choreographed motion,
                relational cloud persistence, and version-controlled engineering workflows.
              </p>
              <dl className="tech-stack-spec-strip mt-8 grid max-w-[410px] grid-cols-3 border-y border-[#1f1f1f] py-4">
                <div className="border-r border-[#1f1f1f] pr-3">
                  <dt className="eyebrow tech-stack-spec-label text-[#78746e]">DOMAINS</dt>
                  <dd className="tech-stack-spec-value mt-1 text-[#f1eee8]">
                    {String(techStackCategories.length).padStart(2, '0')}
                  </dd>
                </div>
                <div className="border-r border-[#1f1f1f] px-3">
                  <dt className="eyebrow tech-stack-spec-label text-[#78746e]">CORE STACK</dt>
                  <dd className="tech-stack-spec-value mt-1 text-[#f1eee8]">
                    {totalTechCount}
                    <span className="tech-stack-plus text-[#ff8c59]">+</span>
                  </dd>
                </div>
                <div className="pl-3">
                  <dt className="eyebrow tech-stack-spec-label text-[#78746e]">STANDARD</dt>
                  <dd className="tech-stack-spec-value mt-1 text-[#f1eee8]">
                    Prod
                  </dd>
                </div>
              </dl>
            </div>
            <div className="tech-stack-categories flex flex-col gap-8 lg:col-span-7" data-reveal="true">
              {techStackCategories.map((category) => (
                <div
                  key={category.id}
                  className="tech-stack-category border-b border-[#1c1c1c] pb-8 last:border-b-0 last:pb-0"
                >
                  <div className="tech-stack-category-header mb-4 flex items-center gap-2.5 sm:gap-3">
                    <span className="eyebrow tech-stack-category-index shrink-0 text-[#dcab84]">
                      {category.index}
                    </span>
                    <span className="eyebrow tech-stack-category-label text-[#a8a49e]">
                      {category.title}
                    </span>
                    <span className="tech-stack-category-rule h-px flex-1 bg-[#1c1c1c]" aria-hidden="true" />
                    <span className="eyebrow tech-stack-category-count shrink-0 whitespace-nowrap text-[#6d6963]">
                      {String(category.items.length).padStart(2, '0')} TOOLS
                    </span>
                  </div>
                  <div
                    className={
                      category.columns === 3
                        ? 'tech-stack-category-grid grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:grid-cols-3 sm:gap-3'
                        : 'tech-stack-category-grid grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:grid-cols-2 sm:gap-3'
                    }
                  >
                    {category.items.map((tech, idx) => {
                      const isOddLastOnMobile =
                        category.items.length % 2 === 1 && idx === category.items.length - 1;
                      return (
                        <div
                          key={tech.name}
                          tabIndex={0}
                          className={`tech-stack-tile group relative flex items-center gap-2.5 rounded-[6px] border border-[#222222] bg-[#0a0a0a] px-3 py-2.5 sm:gap-3.5 sm:px-4 sm:py-3.5 ${
                            isOddLastOnMobile ? 'min-[380px]:col-span-2 sm:col-span-1' : ''
                          }`}
                        >
                          <span className="tech-stack-icon-well flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-[#1f1f1f] bg-[#111111] sm:h-10 sm:w-10">
                            <TechBrandIcon
                              iconKey={tech.iconKey}
                              className="tech-stack-brand-svg h-[19px] w-[19px] sm:h-[21px] sm:w-[21px]"
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="tech-stack-tile-name text-[#f1eee8]">
                                {tech.name}
                              </span>
                              <span
                                className="tech-stack-tile-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#262626]"
                                aria-hidden="true"
                              />
                            </div>
                            <span className="tech-stack-tile-role mt-0.5 block text-[#7d7973]">
                              {tech.role}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="chapter-index solid-section">
        <a
          href="#work"
          className="inline-flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            if (window.location.hash !== '#work') {
              window.history.pushState({}, '', '#work');
            }
            document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Technical Skills <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>

      <section className="expertise chapter solid-section" id="skills">
        <div className="section-label">
          <span>03 / METHODOLOGY &amp; TECHNICAL STACK</span>
          <span>PROTOTYPE. ENGINEER. DEPLOY.</span>
        </div>
        <Expertise />
      </section>

      <section id="impact" className="impact-stage chapter">
        <div className="impact-stage-content">
          <div className="section-label">
            <span>
              <SignalText>04 / THE ARCHITECTURE, DEPLOYED</SignalText>
            </span>
            <span>INTERFACES. INFRASTRUCTURE. INTELLIGENCE.</span>
          </div>
          <div className="impact-title" data-editorial-reveal="true">
            <h2>
              Ideas into interfaces.
              <br />
              <em>Creative Architecture.</em>
            </h2>
            <p>
              Every project combines clean code,
              <br />
              modern cloud infrastructure, and thoughtful design.
            </p>
          </div>
          <div className="impact-lead" data-editorial-reveal="true">
            <div className="impact-value">
              <span>{ach1 ? ach1.metric_value : '3'}</span>
              <em>{ach1 ? ach1.metric_suffix : '+'}</em>
            </div>
            <div className="impact-context">
              <h3>
                Core Web Applications Deployed.
                <br />
                Built for production.
              </h3>
              <p>
                {ach1
                  ? ach1.description
                  : 'Across Vercel, Render, and GitHub Pages. Interactive portfolios, public utility platforms, and academic portals.'}
              </p>
              <a className="text-link" href="#content">
                Explore the deployed systems <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="impact-pair">
            <div data-editorial-reveal="true">
              <strong>
                {ach2 ? ach2.metric_value : '100'}
                <em>{ach2 ? ach2.metric_suffix : '%'}</em>
              </strong>
              <h3>Modern Stack Focus</h3>
              <p>
                {ach2
                  ? ach2.description
                  : 'Engineered with React, Next.js, TypeScript, Supabase (Database, Auth, Media Storage), and Tailwind CSS.'}
              </p>
            </div>
            <div className="impact-technical-skills" data-editorial-reveal="true">
              <span className="eyebrow">CORE TECHNOLOGIES</span>
              <h3>Technical Skills</h3>
              <ul className="impact-skills-tags" aria-label="Technical Skills">
                {IMPACT_TECHNICAL_SKILLS.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div className="impact-principle" data-editorial-reveal="true">
              <span className="eyebrow">THE PHILOSOPHY</span>
              <p>
                Turn ideas into
                <br />
                memorable digital experiences.
                <br />
                <em>Clean architecture first.</em>
              </p>
            </div>
          </div>

          <div id="education" className="brand-story" data-editorial-reveal="true">
            <div className="brand-story-heading">
              <span className="eyebrow">EDUCATION &amp; CURRENT STUDIES</span>
              <h3>
                Academic foundation.
                <br />
                <em>Modern web execution.</em>
              </h3>
              <p>
                Combining formal Polytechnic Expert CSE coursework in Artificial Intelligence and
                Electrical &amp; Electronics Engineering with{' '}
                <strong className="copy-highlight">
                  certified emerging technologies specializations and continuous algorithmic
                  practice.
                </strong>{' '}
                Bridging classroom theory directly with live cloud deployments.
              </p>
              <a className="text-link" href="/about#section-1">
                Read my academic &amp; skilling profile <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="brand-milestones">
              <div>
                <span>01. CSE FOUNDATION</span>
                <p>
                  <b>Computer Science &amp; Engineering.</b> Currently pursuing a Diploma in
                  Computer Science &amp; Engineering at Government Polytechnic Muzaffarpur
                  (2025–2028). Building a foundation in programming, Engineering Mathematics,
                  Applied Chemistry, Web Development, and core computer science concepts.
                </p>
              </div>
              <div>
                <span>02. WEB ENGINEERING</span>
                <p>
                  <b>Full-Stack Development &amp; Projects.</b> Building practical web applications,
                  including JalSetu, Campus Book, Digital Library, and my personal portfolio.
                  Exploring responsive UI development, backend integration, databases, APIs, and
                  deployment workflows using technologies relevant to my projects.
                </p>
                <a
                  href="#content"
                  onClick={(e) => {
                    const target = document.getElementById('content');
                    if (target) {
                      e.preventDefault();
                      window.history.pushState({}, '', '#content');
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  View My Projects <ArrowUpRight size={13} />
                </a>
              </div>
              <div>
                <span>03. DSA &amp; CONTINUOUS LEARNING</span>
                <p>
                  <b>Problem Solving &amp; Technical Growth.</b> Strengthening programming
                  fundamentals through C and Python, exploring data structures and algorithms, and
                  practising problem-solving. Continuously learning modern web development, backend
                  engineering, databases, and AI/ML fundamentals.
                </p>
              </div>
            </div>
          </div>

          <div className="reach-strip">
            <div className="reach-intro">
              <span className="eyebrow">
                CORE TECHNICAL STACK.
                <br />
                VERIFIED WORKFLOW.
              </span>
              <p>
                Tooling and cloud platforms
                <br />
                powering every build.
              </p>
            </div>
            <div>
              <strong>
                Next.js<em>+</em>TS
              </strong>
              <span>React · TypeScript · Tailwind CSS · Canvas API</span>
            </div>
            <div>
              <strong>
                Cloud<em>+</em>AI
              </strong>
              <span>Supabase · Render · Vercel · GitHub Pages · Copilot</span>
            </div>
          </div>
          <p className="reach-attribution">
            Developer workflow powered by VS Code, GitHub Copilot, Figma (Education Plan), Git, and
            Claude.
          </p>
        </div>
      </section>

      <MediaShowcase standalone={false} />

      <AchievementsMemoriesShowcase />

      <section id="journey" className="journey chapter solid-section">
        <div className="section-label">
          <span>LEARNING JOURNEY / ACADEMIC &amp; TECHNICAL TIMELINE</span>
          <span>02 VERIFIED PHASES · 2025 – PRESENT</span>
        </div>
        <div className="journey-grid">
          <div className="journey-intro" data-reveal="true">
            <span className="eyebrow journey-eyebrow">
              01 — 02 / ACADEMIC &amp; ENGINEERING PROGRESSION
            </span>
            <h2>{LEARNING_JOURNEY_HEADING}</h2>
            <p className="journey-subtitle">
              <em>{LEARNING_JOURNEY_SUBTITLE}</em>
            </p>
            <dl className="journey-spec-strip" aria-label="Academic progression summary">
              <div>
                <dt className="eyebrow">PHASE 01 · 2025</dt>
                <dd>
                  <strong>89.4%</strong>
                  <span>Class 10 · BSEB</span>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">PHASE 02 · 2025–PRESENT</dt>
                <dd>
                  <strong>CSE</strong>
                  <span>GP Muzaffarpur, Bihar</span>
                </dd>
              </div>
            </dl>
          </div>
          <div className="timeline">
            {learningJourneyItems.map((item) => (
              <article key={item.step} className="timeline-phase" data-reveal="true">
                <div className="timeline-meta">
                  <span className="timeline-phase-tag">{item.phase}</span>
                  <span className="timeline-meta-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="timeline-period">{item.period}</span>
                  <span className="timeline-meta-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="timeline-status">{item.status}</span>
                </div>
                <h3>{item.heading}</h3>
                <p className="timeline-institution">
                  <strong>{item.institution}</strong>
                  <span aria-hidden="true"> · </span>
                  <span>{item.qualification}</span>
                  {item.achievement && item.achievement !== item.period && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span className="timeline-achievement">{item.achievement}</span>
                    </>
                  )}
                </p>
                <div className="timeline-copy">
                  {item.paragraphs.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
                {item.highlights && item.highlights.length > 0 && (
                  <div className="timeline-highlights" aria-label={`Key focus areas for ${item.phase}`}>
                    {item.highlights.join(' · ')}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact chapter">
        <div className="section-label">
          <span>06 / THE NEXT CHAPTER</span>
          <span>LET’S MAKE IT MATTER</span>
        </div>
        <div className="contact-inner" data-reveal="true">
          <span className="availability">
            <i /> OPEN TO PROJECTS, INTERNSHIPS &amp; COLLABORATIONS
          </span>
          <h2>
            Something great
            <br />
            starts with <em>a hello.</em>
          </h2>
          <a
            className="contact-cta"
            href="https://github.com/moon-rocks"
            target="_blank"
            rel="noopener noreferrer"
          >
            Let’s connect <ArrowUpRight size={24} />
          </a>
          <p>
            Web development, interactive UI/UX, full-stack prototypes, and open-source
            collaborations.
          </p>
          <ContactForm />
        </div>
        <footer>
          <a className="footer-name" href="#top">
            Chandresh Kumar<span>.</span>
          </a>
          <div className="socials">
            <a
              href="https://github.com/moon-rocks"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <ArrowUpRight size={12} />
            </a>
            <a
              href="https://moon-rocks.github.io/PORTFOLIO/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Portfolio
              <ArrowUpRight size={12} />
            </a>
            <a
              href="https://github.com/moon-rocks/Jal_setu"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jal_setu
              <ArrowUpRight size={12} />
            </a>
            <a
              href="https://github.com/moon-rocks/campus-book"
              target="_blank"
              rel="noopener noreferrer"
            >
              Campus-Book
              <ArrowUpRight size={12} />
            </a>
          </div>
          <a href="#top" className="back-top" aria-label="Back to top">
            <ArrowUp size={19} />
          </a>
          <div className="footer-bottom">
            <span>© 2026 CHANDRESH KUMAR. ALL RIGHTS RESERVED.</span>
            <span>BUILT WITH NEXT.JS, TYPESCRIPT &amp; TAILWIND CSS.</span>
            <span>INDIA → THE WORLD</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
