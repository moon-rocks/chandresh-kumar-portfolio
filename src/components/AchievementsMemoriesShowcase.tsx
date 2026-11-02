import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Award,
  Calendar,
  Camera,
  GraduationCap,
  Maximize2,
  Sparkles,
  X,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  CertificateRecord,
  filterShowcaseItems,
  SHOWCASE_FILTERS,
  ShowcaseCategory,
  ShowcaseFilter,
} from '../data/portfolioData';
import { SignalText } from './SignalText';

function CategoryIcon({ category }: { category: ShowcaseCategory | string }) {
  switch (category) {
    case 'Certificates':
      return <Award size={15} className="text-[#ff8c59]" />;
    case 'Achievements':
      return <Sparkles size={15} className="text-[#ff8c59]" />;
    case 'Hackathon Memories':
      return <Camera size={15} className="text-[#ff8c59]" />;
    case 'Academic Milestones':
      return <GraduationCap size={15} className="text-[#ff8c59]" />;
    default:
      return <Award size={15} className="text-[#ff8c59]" />;
  }
}

export function AchievementsMemoriesShowcase() {
  const { showcaseItems } = usePortfolio();
  const [selectedFilter, setSelectedFilter] = useState<ShowcaseFilter>('All');
  const [previewItem, setPreviewItem] = useState<CertificateRecord | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredItems = filterShowcaseItems(showcaseItems, selectedFilter);

  useEffect(() => {
    if (!previewItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewItem]);

  return (
    <section className="voice chapter solid-section" id="services">
      <div className="section-label">
        <span>
          <SignalText>06 / ACHIEVEMENTS, CERTIFICATES &amp; MEMORIES</SignalText>
        </span>
        <span>VERIFIED CREDENTIALS · HACKATHONS · ACADEMIC MILESTONES</span>
      </div>

      <div className="media-heading" data-editorial-reveal="true">
        <h2>
          Achievements,
          <br />
          certificates &amp; <em>memories.</em>
        </h2>
        <div>
          <p>
            Verified certifications, achievement photos,
            <br />
            hackathon moments, and academic milestones
            <br />
            published dynamically from my learning journey.
          </p>
          <a href="#journey" className="text-link">
            Explore My Learning Journey <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      <div className="media-controls">
        <div
          className="media-filters"
          role="group"
          aria-label="Filter achievements, certificates, and memories"
        >
          {SHOWCASE_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={selectedFilter === filter}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <span className="eyebrow" aria-live="polite">
          {String(filteredItems.length).padStart(2, '0')} PUBLISHED{' '}
          {filteredItems.length === 1 ? 'RECORD' : 'RECORDS'}
        </span>
      </div>

      {filteredItems.length > 0 ? (
        <div
          id="showcase-memories-grid"
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredItems.map((item) => {
            const hasImageError = Boolean(failedImages[item.id]);
            return (
              <article
                key={item.id}
                className="group flex flex-col justify-between border border-[#24201d] bg-[#090807] transition-colors duration-300 hover:border-[#ff8c59]/60"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-[#24201d] bg-[#050505]">
                    {!hasImageError ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                        }
                        onClick={() => setPreviewItem(item)}
                        className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center text-sm text-[#bdb5aa]"
                      >
                        <CategoryIcon category={item.category} />
                        <span>{item.title}</span>
                      </button>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-3.5">
                      <span className="inline-flex items-center gap-1.5 border border-[#ff8c59]/40 bg-[#050505]/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#ff8c59]">
                        <CategoryIcon category={item.category} />
                        <span>{item.category}</span>
                      </span>
                      {item.issue_date && (
                        <span className="inline-flex items-center gap-1 border border-[#2c2723] bg-[#050505]/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#d2c6ba]">
                          <Calendar size={11} />
                          <span>{item.issue_date}</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      aria-label={`Preview image for ${item.title}`}
                      className="absolute right-3 bottom-3 inline-flex cursor-pointer items-center gap-1.5 border border-[#2c2723] bg-[#050505]/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#f4efe9] transition hover:border-[#ff8c59] hover:text-[#ff8c59]"
                    >
                      <Maximize2 size={12} />
                      <span>Preview</span>
                    </button>
                  </div>

                  <div className="p-4 sm:p-6">
                    <span className="eyebrow text-[#dcab84]">
                      {item.issuer}
                      {item.role_or_domain ? ` · ${item.role_or_domain}` : ''}
                    </span>
                    <h3 className="mt-2 font-serif text-xl leading-snug text-white sm:text-2xl">
                      {item.title}
                    </h3>
                    {item.subtitle_or_skills && (
                      <p className="mt-2.5 text-sm leading-relaxed text-[#bdb5aa]">
                        {item.subtitle_or_skills}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1d1917] px-4 py-3.5 sm:px-6 sm:py-4">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#f4efe9] transition hover:text-[#ff8c59]"
                  >
                    <Maximize2 size={13} />
                    <span>Image Preview</span>
                  </button>

                  {item.credential_url && item.credential_url.trim().length > 0 && (
                    <a
                      href={item.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#ff8c59] transition hover:underline"
                    >
                      <span>Verify Link</span>
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div
          id="showcase-memories-empty"
          className="mt-8 border border-[#24201d] bg-[#080706] p-5 sm:p-10"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-3 lg:col-span-6">
              <span className="eyebrow text-[#ff8c59]">
                LIVE SUPABASE ARCHIVE ·{' '}
                {selectedFilter === 'All' ? 'ALL CATEGORIES' : selectedFilter.toUpperCase()}
              </span>
              <h3 className="font-serif text-2xl text-white sm:text-4xl">
                {selectedFilter === 'All'
                  ? 'Verified credentials & milestones archive.'
                  : `No published records in ${selectedFilter} yet.`}
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-[#bdb5aa]">
                This showcase displays only verified, published certificates, achievement photos,
                hackathon memories, and academic milestones synced from Supabase Storage and
                PostgreSQL. New entries appear here automatically as soon as they are published.
              </p>
              {selectedFilter !== 'All' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFilter('All')}
                    className="pill-link cursor-pointer text-xs"
                  >
                    <span>Show All Categories</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-6">
              {(
                [
                  [
                    'Certificates',
                    'Technical certifications, coursework completions, and verified credentials.',
                  ],
                  [
                    'Achievements',
                    'Recognition photos, project milestones, and technical accomplishments.',
                  ],
                  [
                    'Hackathon Memories',
                    'Collaborative builds, problem-solving sprints, and event snapshots.',
                  ],
                  [
                    'Academic Milestones',
                    'Diploma in CSE at Government Polytechnic Muzaffarpur & academic highlights.',
                  ],
                ] as const
              ).map(([catName, catDesc]) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setSelectedFilter(catName)}
                  className={`flex cursor-pointer flex-col items-start gap-2 border p-4 text-left transition ${
                    selectedFilter === catName
                      ? 'border-[#ff8c59] bg-[#ff8c59]/10'
                      : 'border-[#221e1b] bg-[#050505] hover:border-[#3d352e]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={catName} />
                    <span className="font-mono text-xs uppercase tracking-wider text-white">
                      {catName}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#9e958b]">{catDesc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image preview for ${previewItem.title}`}
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-auto border border-[#2c2723] bg-[#0b0a09] p-4 sm:p-8"
          >
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#24201d] pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-[#ff8c59]/40 bg-[#ff8c59]/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#ff8c59]">
                  <CategoryIcon category={previewItem.category} />
                  <span>{previewItem.category}</span>
                </span>
                {previewItem.issue_date && (
                  <span className="border border-[#2c2723] bg-[#050505] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#d2c6ba]">
                    {previewItem.issue_date}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                aria-label="Close image preview"
                className="inline-flex cursor-pointer items-center gap-1.5 border border-[#2c2723] bg-[#050505] px-3 py-1.5 font-mono text-xs uppercase text-[#f4efe9] transition hover:border-[#ff8c59] hover:text-[#ff8c59]"
              >
                <X size={14} />
                <span>Close</span>
              </button>
            </div>

            <div className="overflow-hidden border border-[#24201d] bg-[#050505]">
              <img
                src={previewItem.image_url}
                alt={previewItem.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <span className="eyebrow text-[#dcab84]">
                  {previewItem.issuer}
                  {previewItem.role_or_domain ? ` · ${previewItem.role_or_domain}` : ''}
                </span>
                <h3 className="font-serif text-2xl text-white sm:text-3xl">
                  {previewItem.title}
                </h3>
                {previewItem.subtitle_or_skills && (
                  <p className="max-w-2xl text-sm leading-relaxed text-[#bdb5aa]">
                    {previewItem.subtitle_or_skills}
                  </p>
                )}
              </div>

              {previewItem.credential_url && previewItem.credential_url.trim().length > 0 && (
                <a
                  href={previewItem.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-link shrink-0"
                >
                  <span>Verify Credential</span>
                  <ArrowUpRight size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
