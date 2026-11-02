import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../data/portfolioData';
import { SignalText } from './SignalText';

interface NavigationProps {
  detail?: boolean;
  pathname: string;
}

export function Navigation({ detail = false, pathname }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const clickLockUntilRef = useRef<number>(0);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const desktopMedia = window.matchMedia('(min-width: 901px)');
    const onMediaChange = () => {
      if (desktopMedia.matches) setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    desktopMedia.addEventListener('change', onMediaChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
      desktopMedia.removeEventListener('change', onMediaChange);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (detail) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (performance.now() < clickLockUntilRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-18% 0px -62% 0px' }
    );

    const observedIds = new Set([
      'top',
      ...NAV_LINKS.map(([, slug]) => slug),
      'skills',
      'services',
      'contact',
    ]);
    for (const id of observedIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [detail, pathname]);

  useEffect(() => {
    let rafId = 0;

    const updateScroll = () => {
      rafId = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (!detail && y < 120 && performance.now() >= clickLockUntilRef.current) {
        setActiveSection('top');
      }
    };

    updateScroll();

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [detail, pathname]);

  const prefix = detail ? '/' : '';

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        ref={headerRef}
        className="navigation refined-navigation glass-navigation"
        data-hidden={false}
        data-scrolled={scrolled}
      >
        <a
          className="wordmark"
          href={detail ? '/' : '#top'}
          aria-label="Chandresh Kumar"
          onClick={() => {
            setMenuOpen(false);
            setActiveSection('top');
            clickLockUntilRef.current = performance.now() + 1000;
            if (!detail && window.location.hash === '#top') {
              document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span className="nav-identity">
            <span>Chandresh Kumar</span>
          </span>
        </a>
        <nav
          className={menuOpen ? 'nav-links is-open' : 'nav-links'}
          aria-label="Main navigation"
          id="main-nav"
        >
          {NAV_LINKS.map(([label, slug]) => (
            <a
              key={slug}
              className="nav-destination"
              href={`${prefix}#${slug}`}
              aria-current={
                (
                  detail
                    ? slug === 'top'
                      ? pathname === '/'
                      : slug === 'content'
                        ? pathname.startsWith('/work') || pathname.startsWith('/content')
                        : slug === 'work'
                          ? pathname.startsWith('/skills')
                          : slug === 'impact'
                            ? pathname.startsWith('/services')
                            : pathname.startsWith(`/${slug}`)
                    : activeSection === slug ||
                      (slug === 'work' && activeSection === 'skills') ||
                      (slug === 'impact' && activeSection === 'services')
                )
                  ? 'location'
                  : undefined
              }
              onClick={() => {
                setMenuOpen(false);
                setActiveSection(slug);
                clickLockUntilRef.current = performance.now() + 1000;
                if (!detail && window.location.hash === `#${slug}`) {
                  document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <SignalText>{label}</SignalText>
              <span className="nav-mobile-arrow" aria-hidden="true">
                <ArrowUpRight size={14} />
              </span>
            </a>
          ))}
          <a
            className="nav-contact"
            href={`${prefix}#contact`}
            onClick={() => {
              setMenuOpen(false);
              setActiveSection('contact');
              clickLockUntilRef.current = performance.now() + 1000;
              if (!detail && window.location.hash === '#contact') {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <SignalText>Let’s talk</SignalText>
            <ArrowUpRight size={16} />
          </a>
        </nav>
        <button
          className="menu-toggle"
          ref={toggleRef}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>
    </>
  );
}
