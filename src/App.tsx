/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useLayoutEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomCursor } from './components/CustomCursor';
import { Experience } from './components/Experience';
import { HomePage } from './components/HomePage';
import { Navigation } from './components/Navigation';
import { SubPage } from './components/SubPages';
import { PortfolioProvider } from './context/PortfolioContext';
import { RouteId, resolveRoute } from './data/portfolioData';

const PAGE_TITLES: Record<RouteId, string> = {
  home: 'Chandresh Kumar — Creative Designer & Web Developer',
  about: 'About — Ideas into interfaces. — Chandresh Kumar',
  work: 'Selected Works — Chandresh Kumar',
  skills: 'Skills & Technical Stack — Chandresh Kumar',
  services: 'Services — Creative Designer & Web Developer — Chandresh Kumar',
  contact: 'Contact — Let’s build what’s next. — Chandresh Kumar',
  admin: 'Admin Console (/45861563/admin) — Chandresh Kumar',
  'work-cinematic-portfolio': 'Cinematic Interactive Portfolio — Chandresh Kumar',
  'work-jal-setu': 'Jal_setu Platform — Chandresh Kumar',
  'work-campus-book': 'Campus-Book Platform — Chandresh Kumar',
  'work-algorithmic-practice-suite': 'Algorithmic Practice Suite — Chandresh Kumar',
  'work-ai-hardware-labs': 'AI & Hardware Engineering Labs — Chandresh Kumar',
  'work-project': 'Project Case Study — Chandresh Kumar',
};

export default function App() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useLayoutEffect(() => {
    const route = resolveRoute(pathname);
    document.title = PAGE_TITLES[route];

    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
      const rafHash = requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      });
      return () => cancelAnimationFrame(rafHash);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || anchor.getAttribute('target') === '_blank' || anchor.hasAttribute('download')) {
        return;
      }
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        return;
      }

      if (href.startsWith('#')) {
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          if (window.location.hash !== href) {
            window.history.pushState({}, '', `${window.location.pathname}${href}`);
          }
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      if (href.startsWith('/')) {
        e.preventDefault();
        const url = new URL(href, window.location.origin);
        const nextPath = url.pathname;
        const nextHash = url.hash;
        const pathChanged = nextPath !== window.location.pathname;

        if (pathChanged || nextHash !== window.location.hash) {
          window.history.pushState({}, '', `${nextPath}${nextHash}`);
        }

        if (pathChanged) {
          setPathname(nextPath);
        } else if (nextHash) {
          const targetEl = document.getElementById(nextHash.slice(1));
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const route = resolveRoute(pathname);
  const isDetail = route !== 'home';

  return (
    <PortfolioProvider>
      <CustomCursor pathname={pathname} />
      <Experience pathname={pathname} isHome={!isDetail} />
      <Navigation detail={isDetail} pathname={pathname} />
      {route === 'home' ? (
        <HomePage />
      ) : route === 'admin' ? (
        <AdminDashboard />
      ) : (
        <SubPage route={route} pathname={pathname} />
      )}
    </PortfolioProvider>
  );
}
