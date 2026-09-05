import { useEffect, useRef, useState } from 'react'

// Reveals an element (see the .scroll-reveal / .scroll-reveal--visible
// classes in index.css) the first time it scrolls into view. Observes
// once, then disconnects — it doesn't hide again if you scroll back past
// it. Falls back to already-visible if IntersectionObserver isn't
// available at all, rather than leaving content permanently invisible.
export function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
} = {}) {
  const ref = useRef(null)
  // Old-browser fallback lives in the initializer, not a setState call
  // inside the effect below — starts already-visible when there's no
  // IntersectionObserver to react to.
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isVisible]
}

// className helper: `${revealClass(isVisible)} ${otherClasses}`.
export function revealClass(isVisible) {
  return `scroll-reveal${isVisible ? ' scroll-reveal--visible' : ''}`
}
