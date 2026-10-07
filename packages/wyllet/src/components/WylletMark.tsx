import { useId } from 'react'

const LID = 'M8.2 14.2 L7 10.6 L23.2 3.6 L25.8 10.6 Z'

/** Wyllet's mascot as a tiny vector mark — crisp at 12–32px, no image request. */
export function WylletMark({ size = 16, className }: { size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6FF5E0" />
          <stop offset="1" stopColor="#2CCFB4" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5FEFD9" />
          <stop offset="1" stopColor="#9AFAEC" />
        </linearGradient>
      </defs>
      <g transform="rotate(-9 16 18)">
        <rect x="3.5" y="12" width="25" height="17.5" rx="7" fill={`url(#${id}b)`} />
        <path d="M7.2 13.6 Q7.4 12.6 9 12.6 L15 12.6 L15 14.4 L8.6 14.4 Q7.1 14.4 7.2 13.6Z" fill="#08332C" />
        <rect x="18" y="18.3" width="2.8" height="6.2" rx="1.4" fill="#0B0B0F" />
        <rect x="22.6" y="18.3" width="2.8" height="6.2" rx="1.4" fill="#0B0B0F" />
      </g>
      <path d={LID} transform="translate(0.4 1)" fill="#1A9E89" stroke="#1A9E89" strokeWidth="2.6" strokeLinejoin="round" opacity="0.55" />
      <path d={LID} fill={`url(#${id}l)`} stroke={`url(#${id}l)`} strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  )
}
