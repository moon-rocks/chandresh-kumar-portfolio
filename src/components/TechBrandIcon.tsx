import type { TechStackItem } from '../data/portfolioData';

interface TechBrandIconProps {
  iconKey: TechStackItem['iconKey'];
  className?: string;
}

export function TechBrandIcon({ iconKey, className = 'h-4 w-4' }: TechBrandIconProps) {
  switch (iconKey) {
    case 'react':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="2.1" fill="#58C4DC" />
          <g stroke="#58C4DC" strokeWidth="1.45">
            <ellipse cx="12" cy="12" rx="10" ry="4.1" />
            <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(120 12 12)" />
          </g>
        </svg>
      );

    case 'nextjs':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#0d0d0d" stroke="#d4d4d4" strokeWidth="1.35" />
          <path
            d="M8.4 16V8h1.5l6.8 8.85-.95.65L9.8 9.8V16H8.4Z"
            fill="#f1eee8"
          />
          <rect x="14.5" y="8" width="1.4" height="5.5" fill="#f1eee8" />
        </svg>
      );

    case 'typescript':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="3.2" fill="#2d6db5" />
          <path
            d="M12.6 12.15H9.9V19H8.1v-6.85H5.4V10.6h7.2v1.55Zm2.2 5.1c.55.35 1.3.6 2.1.6.85 0 1.4-.35 1.4-.9 0-.6-.45-.85-1.55-1.25-1.5-.55-2.35-1.2-2.35-2.5 0-1.45 1.15-2.5 2.95-2.5.95 0 1.75.2 2.3.5l-.45 1.45c-.4-.22-1.05-.45-1.8-.45-.8 0-1.25.35-1.25.85 0 .55.48.8 1.65 1.25 1.55.55 2.28 1.25 2.28 2.55 0 1.5-1.15 2.6-3.15 2.6-1.05 0-1.98-.3-2.55-.65l.42-1.55Z"
            fill="#f1eee8"
          />
        </svg>
      );

    case 'javascript':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="3.2" fill="#EAD41C" />
          <path
            d="M11.6 16.65c0 1.75-1.02 2.6-2.55 2.6-.95 0-1.72-.35-2.18-.85l.98-1.22c.28.32.62.55 1.08.55.55 0 .9-.25.9-1.08V10.6h1.77v6.05Zm3.15.68c.52.42 1.22.7 2.02.7.82 0 1.35-.35 1.35-.88 0-.6-.5-.82-1.52-1.22-1.48-.55-2.32-1.18-2.32-2.48 0-1.42 1.12-2.45 2.88-2.45.95 0 1.72.22 2.25.55l-.52 1.4c-.42-.25-1-.45-1.7-.45-.78 0-1.2.35-1.2.82 0 .52.45.78 1.6 1.2 1.52.55 2.25 1.22 2.25 2.52 0 1.52-1.15 2.58-3.08 2.58-1.05 0-1.95-.32-2.5-.72l.49-1.57Z"
            fill="#111111"
          />
        </svg>
      );

    case 'html5':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M4 2h16l-1.45 16.2L12 22l-6.55-3.8L4 2Z" fill="#DF4B25" />
          <path d="M12 3.6v16.7l5.3-3.05L18.5 3.6H12Z" fill="#EA6228" />
          <path
            d="M12 9.4H8.6l-.2-2.2H12V5H6l.6 6.6H12V9.4Zm0 5.75-.02.01-2.45-.66-.16-1.8H7.15l.3 3.45 4.53 1.25.02-.01v-2.24Zm3.68-3.55-.28 2.91-2.4.65v2.24l4.53-1.25.63-6.75H12v2.2h3.68ZM12 5v2.2h5.35l.2-2.2H12Z"
            fill="#f1eee8"
          />
        </svg>
      );

    case 'css3':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M4 2h16l-1.45 16.2L12 22l-6.55-3.8L4 2Z" fill="#1B6CA8" />
          <path d="M12 3.6v16.7l5.3-3.05L18.5 3.6H12Z" fill="#2D89C8" />
          <path
            d="M12 9.3H8.7l.2 2.2H12v2.2H9.08l.18 1.9 2.74.75v2.24l-4.53-1.25-.32-3.64h2.2M12 5H6l.2 2.2H12V5Zm0 4.3v2.2h3.5l-.3 3-2.4.65v2.24l4.53-1.25.65-6.84H12Zm0-4.3v2.2h5.55L17.75 5H12Z"
            fill="#f1eee8"
          />
        </svg>
      );

    case 'tailwindcss':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C15.61 7.15 14.47 6 12 6ZM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 13.15 9.47 12 7 12Z"
            fill="#38BDF8"
          />
        </svg>
      );

    case 'gsap':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="#0b1a10" stroke="#28d765" strokeWidth="1.5" />
          <path
            d="M13.2 5.5 7.5 13h4.2l-.9 5.5L16.5 11h-4.2l.9-5.5Z"
            fill="#28d765"
          />
        </svg>
      );

    case 'figma':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M8.5 2h3.5v6.5H8.5a3.25 3.25 0 1 1 0-6.5Z" fill="#E84D24" />
          <path d="M12 2h3.5a3.25 3.25 0 1 1 0 6.5H12V2Z" fill="#F47163" />
          <path d="M12 8.5h3.5a3.25 3.25 0 1 1 0 6.5H12V8.5Z" fill="#27B1F0" />
          <path d="M8.5 8.5H12V15H8.5a3.25 3.25 0 1 1 0-6.5Z" fill="#9B59F6" />
          <path d="M8.5 15H12v3.25a3.25 3.25 0 1 1-3.25-3.25H8.5Z" fill="#18C77E" />
        </svg>
      );

    case 'nodejs':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 2 3.5 6.9v10.2L12 22l8.5-4.9V6.9L12 2Z"
            fill="#5FA04E"
          />
          <path
            d="M12 6.2v11.6l6.2-3.55V9.75L12 6.2Z"
            fill="#f1eee8"
            fillOpacity="0.9"
          />
        </svg>
      );

    case 'express':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="2" y="3.5" width="20" height="17" rx="3.5" fill="#111111" stroke="#454549" strokeWidth="1.3" />
          <path
            d="M5.2 12.4h4.4c.05-1.9-1.05-3.2-2.75-3.2-1.8 0-3.05 1.35-3.05 3.35 0 2.05 1.25 3.35 3.15 3.35 1.25 0 2.15-.55 2.55-1.4l-1.1-.55c-.28.55-.8.85-1.45.85-1.02 0-1.72-.65-1.8-1.75v-.65Zm1.62-2.15c.85 0 1.42.5 1.52 1.25H5.25c.15-.75.72-1.25 1.57-1.25Zm5.58-1.85 2.25 3.2-2.35 3.3h1.55l1.58-2.3 1.58 2.3h1.58l-2.35-3.3 2.25-3.2h-1.55l-1.5 2.2-1.5-2.2H12.4Z"
            fill="#f1eee8"
          />
        </svg>
      );

    case 'supabase':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M13.35 21.4c-.52.65-1.58.28-1.58-.55V13h7.48c1.05 0 1.65 1.2.98 2.02L13.35 21.4Z"
            fill="#249361"
          />
          <path
            d="M10.65 2.6c.52-.65 1.58-.28 1.58.55V11H4.75c-1.05 0-1.65-1.2-.98-2.02L10.65 2.6Z"
            fill="#3ECF8E"
          />
        </svg>
      );

    case 'postgresql':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <ellipse cx="12" cy="6.2" rx="7.5" ry="3.2" fill="#336791" />
          <path
            d="M4.5 6.2v5.6c0 1.77 3.36 3.2 7.5 3.2s7.5-1.43 7.5-3.2V6.2"
            stroke="#699eca"
            strokeWidth="1.5"
          />
          <path
            d="M4.5 11.8v5.6c0 1.77 3.36 3.2 7.5 3.2s7.5-1.43 7.5-3.2v-5.6"
            stroke="#5282a8"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'git':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="m21.4 10.9-8.3-8.3a1.55 1.55 0 0 0-2.2 0L9.15 4.35l2.22 2.22a1.85 1.85 0 0 1 2.34 2.36l2.14 2.14a1.85 1.85 0 1 1-1.1 1.1l-2-2v5.25a1.85 1.85 0 1 1-1.5 0V10a1.85 1.85 0 0 1-1-2.42L8.05 5.45 2.6 10.9a1.55 1.55 0 0 0 0 2.2l8.3 8.3a1.55 1.55 0 0 0 2.2 0l8.3-8.3a1.55 1.55 0 0 0 0-2.2Z"
            fill="#DE4C36"
          />
        </svg>
      );

    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.475 2 2 6.59 2 12.253c0 4.53 2.865 8.373 6.84 9.728.5.095.68-.222.68-.493 0-.243-.009-.887-.014-1.741-2.782.618-3.369-1.375-3.369-1.375-.455-1.184-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.072 1.532 1.057 1.532 1.057.892 1.568 2.341 1.115 2.91.853.091-.664.35-1.115.636-1.371-2.22-.259-4.555-1.14-4.555-5.072 0-1.12.39-2.036 1.03-2.754-.104-.26-.447-1.302.098-2.714 0 0 .84-.276 2.75 1.052A9.38 9.38 0 0 1 12 6.844c.85.004 1.705.118 2.504.346 1.909-1.328 2.748-1.052 2.748-1.052.546 1.412.203 2.454.1 2.714.64.718 1.028 1.634 1.028 2.754 0 3.942-2.339 4.81-4.566 5.064.359.317.678.942.678 1.899 0 1.371-.012 2.477-.012 2.813 0 .274.18.593.688.492C19.138 20.622 22 16.78 22 12.253 22 6.59 17.523 2 12 2Z"
            fill="#f1eee8"
          />
        </svg>
      );

    case 'c':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 2 3.5 6.9v10.2L12 22l8.5-4.9V6.9L12 2Z" fill="#283593" />
          <path
            d="M15.6 14.3a4.5 4.5 0 1 1 0-4.6l1.75-1a6.5 6.5 0 1 0 0 6.6l-1.75-1Z"
            fill="#f1eee8"
          />
        </svg>
      );

    case 'python':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M11.9 2C7.8 2 8.1 3.8 8.1 3.8v2.1h3.9v.6H6.5S4 6.2 4 10.2s2.2 3.8 2.2 3.8h1.3v-1.9s-.1-2.2 2.2-2.2h3.8s2.1 0 2.1-2V4.3S16 2 11.9 2Zm-2.1 1.4a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"
            fill="#3776AB"
          />
          <path
            d="M12.1 22c4.1 0 3.8-1.8 3.8-1.8v-2.1H12v-.6h5.5S20 17.8 20 13.8s-2.2-3.8-2.2-3.8h-1.3v1.9s.1 2.2-2.2 2.2h-3.8s-2.1 0-2.1 2v3.6S8 22 12.1 22Zm2.1-1.4a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            fill="#FFD43B"
          />
        </svg>
      );

    case 'fastapi':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="#05998B" />
          <path d="M13 5.5 7.5 13h4.1l-.8 5.5L16.5 11h-4.1l.6-5.5Z" fill="#f1eee8" />
        </svg>
      );

    case 'code':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect
            x="2.5"
            y="3.5"
            width="19"
            height="17"
            rx="3.2"
            fill="#141312"
            stroke="#dcab84"
            strokeWidth="1.4"
          />
          <path
            d="m9.5 9-3 3 3 3m5-6 3 3-3 3"
            stroke="#f1eee8"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
