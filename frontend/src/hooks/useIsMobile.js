import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)

  useEffect(() => {
    let ticking = false
    const handleResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsMobile(window.innerWidth < breakpoint)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}
