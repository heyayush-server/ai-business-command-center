"use client"

import * as React from "react"

export function useScrollStory(stepCount: number) {
  const [activeStep, setActiveStep] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      return
    }

    const stepElements = el.querySelectorAll<HTMLElement>("[data-story-step]")
    if (stepElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const stepIndex = Number(entry.target.getAttribute("data-story-step"))
            if (!isNaN(stepIndex)) {
              setActiveStep(stepIndex)
            }
          }
        }
      },
      {
        root: null,
        rootMargin: "-25% 0px -40% 0px",
        threshold: 0.2,
      }
    )

    stepElements.forEach((stepEl) => observer.observe(stepEl))

    return () => {
      observer.disconnect()
    }
  }, [stepCount])

  return { containerRef, activeStep, setActiveStep }
}
