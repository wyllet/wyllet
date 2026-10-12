'use client'

import { useEffect, useRef } from 'react'

/**
 * The mascot hop clip: muted, looping, inline. Visitors who prefer reduced motion get the still poster instead.
 * Decorative, so it is hidden from assistive technology.
 */
export function MascotVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => (reduce.matches ? video.pause() : void video.play().catch(() => {}))
    apply()
    reduce.addEventListener('change', apply)
    return () => reduce.removeEventListener('change', apply)
  }, [])
  return (
    <video
      ref={ref}
      className={className}
      poster="/illustrations/mascot-hop-poster.jpg"
      muted
      loop
      playsInline
      preload="metadata"
      width={1280}
      height={720}
      aria-hidden
      tabIndex={-1}
    >
      <source src="/illustrations/mascot-hop.webm" type="video/webm" />
      <source src="/illustrations/mascot-hop.mp4" type="video/mp4" />
    </video>
  )
}
