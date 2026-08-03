import { useEffect, useRef } from 'react'

/** Revela o elemento quando ele entra na viewport. Sem biblioteca, sem estado. */
export function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        node.style.animationDelay = `${delay}ms`
        node.classList.add('is-visible')
        observer.disconnect()
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  return ref
}
