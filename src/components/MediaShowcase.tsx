import { useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, Code2, Cpu, Globe } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../context/PortfolioContext';
import {
  INITIAL_VISIBLE_PROJECTS_COUNT,
  VIDEO_FILTERS,
  VideoFilter,
  VideoItem,
  filterVideos,
  formatFilmCount,
  getVisibleVideos,
} from '../data/portfolioData';
import { SignalText } from './SignalText';

interface FilmCardProps {
  video: VideoItem;
  index: number;
}

function FilmCard({ video, index }: FilmCardProps) {
  const [imgError, setImgError] = useState(false);
  const isRevealedExtra = index >= INITIAL_VISIBLE_PROJECTS_COUNT;

  return (
    <article
      className={`film-card transition-all duration-500 ease-out ${
        isRevealedExtra ? 'animate-[path-arrive_0.45s_cubic-bezier(0.22,1,0.36,1)_both]' : ''
      }`}
    >
      <div className="film-screen">
        <a
          className="film-play"
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${video.title}`}
        >
          {!imgError && (
            <img
              src={video.image}
              alt={video.subtitle}
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          )}
          {imgError && <span className="film-image-fallback">{video.title}</span>}
          <span className="film-play-icon">
            <ArrowUpRight size={23} />
          </span>
          <span className="film-channel">{video.category}</span>
        </a>
      </div>
      <div className="film-caption">
        <span className="eyebrow">
          {video.channel} / {video.role}
        </span>
        <h3>{video.title}</h3>
        <p>{video.subtitle}</p>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore module <ArrowUpRight size={13} />
        </a>
      </div>
    </article>
  );
}

interface MediaShowcaseProps {
  standalone?: boolean;
}

export function MediaShowcase({ standalone = false }: MediaShowcaseProps) {
  const { videos } = usePortfolio();
  const [selectedFilter, setSelectedFilter] = useState<VideoFilter>('All modules');
  const [showAllProjects, setShowAllProjects] = useState(false);

  const filteredVideos = filterVideos(videos, selectedFilter);
  const { visible: visibleVideos, hasMore } = getVisibleVideos(
    filteredVideos,
    showAllProjects,
    INITIAL_VISIBLE_PROJECTS_COUNT
  );

  return (
    <section
      id="content"
      className={`media-showcase ${standalone ? 'media-standalone' : 'chapter solid-section'}`}
    >
      <div className="section-label">
        <span>
          <SignalText>05 / ARCHITECTURE &amp; LABS</SignalText>
        </span>
        <span>IN CODE. IN CLOUD. IN ACADEMIC PRACTICE.</span>
      </div>
      <div className="media-heading" data-editorial-reveal="true">
        <h2>
          Ideas into
          <br />
          <em>interfaces.</em>
        </h2>
        <div>
          <p>
            From full-stack cloud deployments
            <br />
            to core CS algorithmic practice
            <br />
            and AI &amp; hardware engineering labs.
          </p>
          <a
            href="https://github.com/moon-rocks"
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore GitHub (@moon-rocks) <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <div className="media-controls">
        <div className="media-filters" role="group" aria-label="Filter modules">
          {VIDEO_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={selectedFilter === filter}
              onClick={() => {
                setSelectedFilter(filter);
                setShowAllProjects(false);
                requestAnimationFrame(() => {
                  ScrollTrigger.refresh();
                });
              }}
            >
              {filter}
            </button>
          ))}
        </div>
        <span className="eyebrow" aria-live="polite">
          {formatFilmCount(filteredVideos.length)}
        </span>
      </div>
      <div id="projects-showcase-grid" className="film-grid">
        {visibleVideos.map((video, index) => (
          <FilmCard key={video.id} video={video} index={index} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            aria-expanded={showAllProjects}
            aria-controls="projects-showcase-grid"
            onClick={() => {
              setShowAllProjects((prev) => !prev);
              requestAnimationFrame(() => {
                ScrollTrigger.refresh();
              });
            }}
            className="pill-link cursor-pointer transition-all duration-300"
          >
            <span>{showAllProjects ? 'Show Less' : 'See More Projects'}</span>
            {showAllProjects ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      )}
      <div className="social-editorial" data-editorial-reveal="true">
        <div className="social-intro">
          <span className="eyebrow">OPEN SOURCE &amp; LIVE DEPLOYMENTS</span>
          <h3>
            Different layers.
            <br />
            <em>The same precision.</em>
          </h3>
        </div>
        <a
          href="https://github.com/moon-rocks"
          target="_blank"
          rel="noopener noreferrer"
          className="social-feature"
        >
          <Code2 size={22} />
          <span className="eyebrow">GITHUB / @MOON-ROCKS</span>
          <h4>
            Repositories,
            <br />
            <em>in production.</em>
          </h4>
          <p>Source code for Jal_setu, Campus-Book, and core CS algorithmic implementations.</p>
          <span className="social-action">
            Explore GitHub profile <ArrowUpRight size={17} />
          </span>
        </a>
        <a
          href="https://moon-rocks.github.io/PORTFOLIO/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-feature"
        >
          <Globe size={22} />
          <span className="eyebrow">PORTFOLIO / CANONICAL WEB</span>
          <h4>
            Creative architecture
            <br />
            <em>on the web.</em>
          </h4>
          <p>Interactive web experiences built with Next.js, React, TypeScript, and Supabase.</p>
          <span className="social-action">
            Visit live portfolio <ArrowUpRight size={17} />
          </span>
        </a>
      </div>
      <a
        className="media-channel-link"
        href="https://github.com/moon-rocks"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Cpu size={20} />
        <span>Explore all repositories, AI coursework labs &amp; deployments on GitHub</span>
        <ArrowUpRight size={18} />
      </a>
    </section>
  );
}
