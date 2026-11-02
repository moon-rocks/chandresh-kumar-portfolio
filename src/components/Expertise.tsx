import { useState } from 'react';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EXPERTISE_ITEMS, TECH_BADGES, getThinkingPath } from '../data/portfolioData';
import { SignalText } from './SignalText';

export function Expertise() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const currentPath = getThinkingPath(expandedIndex);

  return (
    <div className="expertise-grid expertise-studio">
      <div className="expertise-intro">
        <h2>
          How I work.
          <br />
          <em>From idea to impact.</em>
        </h2>
        <p className="muted">Choose a discipline. Follow the engineering workflow.</p>
        <div className="thinking-path" aria-live="polite">
          <span className="eyebrow">
            <SignalText>{currentPath.name.toUpperCase()}</SignalText>
          </span>
          <ol key={currentPath.name}>
            {currentPath.stages.map((stage, idx) => (
              <li key={stage} style={{ animationDelay: `${70 * idx}ms` }}>
                <span>0{idx + 1}</span>
                {stage}
              </li>
            ))}
          </ol>
          <a href={currentPath.link} className="text-link">
            {currentPath.label} <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="speaking-topics" aria-label="Core technology badges">
          {TECH_BADGES.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
      </div>
      <div className="expertise-list">
        {EXPERTISE_ITEMS.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <article
              key={item.title}
              className={`expertise-item ${isExpanded ? 'expanded' : ''}`}
            >
              <h3>
                <button
                  onClick={() => {
                    setExpandedIndex(isExpanded ? null : idx);
                    requestAnimationFrame(() => {
                      ScrollTrigger.refresh();
                    });
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={`expertise-${idx}`}
                >
                  <span>
                    <small className="eyebrow">
                      <SignalText>{item.label}</SignalText>
                    </small>
                    {item.title}
                  </span>
                  {isExpanded ? <Minus size={24} /> : <Plus size={24} />}
                </button>
              </h3>
              <div
                id={`expertise-${idx}`}
                hidden={!isExpanded}
                className="expertise-body"
              >
                <p>{item.description}</p>
                <p className="strengths">{item.strengths}</p>
                <a href="/about#capabilities" className="expertise-depth">
                  Academic foundation &amp; full stack <ArrowUpRight size={13} />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
