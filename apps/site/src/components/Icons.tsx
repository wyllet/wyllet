import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = ({ size = 18, ...p }: P) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, ...p })

export const GitHubIcon = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
)
export const NpmIcon = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M2 7h20v9H12v1.5H7.5V16H2V7Zm1.5 7.5h3v-6h1.5v6h1.5v-7.5h-6v7.5Zm6 0v1.5h3v-1.5h3v-7.5h-6v7.5Zm3-6h1.5v4.5h-1.5V8.5Zm4.5-1.5v7.5h3v-6h1.5v6h1.5v-6h1.5v6h.5V7h-8Z" />
  </svg>
)
export const SunIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
export const MoonIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
)
export const SystemIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
)
export const MenuIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
export const CloseIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const CopyIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
    <rect x="8" y="8" width="12" height="12" rx="3" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
)
export const CheckIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)
export const ArrowIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const SearchIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
)
export const XIcon = (p: P) => (
  <svg {...base(p)}>
    <path fill="currentColor" d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
  </svg>
)
export const MailIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" strokeLinecap="round" />
  </svg>
)
export const RssIcon = (p: P) => (
  <svg {...base(p)} stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14" />
    <circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)
