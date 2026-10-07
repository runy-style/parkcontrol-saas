'use client'

import { useEffect, useState } from 'react'

export default function SpotlightCursor() {
  const [position, setPosition] = useState({ x: -500, y: -500 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      aria-hidden="true"
    >
      <div
        className="absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(14, 165, 233, 0.04) 40%, transparent 70%)',
        }}
      />
    </div>
  )
}
