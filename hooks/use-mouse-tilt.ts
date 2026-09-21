"use client"

import * as React from "react"

interface MouseTiltOptions {
  maxRotation?: number
  perspective?: number
  scale?: number
  disabled?: boolean
}

export function useMouseTilt<T extends HTMLElement = HTMLDivElement>(
  options: MouseTiltOptions = {}
) {
  const { maxRotation = 6, perspective = 1000, scale = 1.01, disabled = false } = options
  const ref = React.useRef<T | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    // Check prefers-reduced-motion and pointer coarse (touch devices)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isTouch = window.matchMedia("(pointer: coarse)").matches

    if (prefersReducedMotion || isTouch) return

    let frameId: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      if (frameId) cancelAnimationFrame(frameId)

      frameId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const mouseX = e.clientX - centerX
        const mouseY = e.clientY - centerY

        const rotateX = -(mouseY / (rect.height / 2)) * maxRotation
        const rotateY = (mouseX / (rect.width / 2)) * maxRotation

        el.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`
        el.style.transition = "transform 0.08s ease-out"
        el.style.willChange = "transform"
      })
    }

    const handleMouseLeave = () => {
      if (frameId) cancelAnimationFrame(frameId)
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
      el.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
    }

    el.addEventListener("mousemove", handleMouseMove)
    el.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      el.removeEventListener("mousemove", handleMouseMove)
      el.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [maxRotation, perspective, scale, disabled])

  return { ref }
}
