import React, { useRef, useState } from 'react'

export function GlareCard({ children, as = 'div', ...props }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMouseOver, setIsMouseOver] = useState(false)
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const Component = as
  const { style = {}, ...restProps } = props

  return (
    <Component
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...style,
      }}
      {...restProps}
    >
      {children}
      {isMouseOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1) 0%, transparent 80%)`,
            pointerEvents: 'none',
            borderRadius: '12px',
          }}
        />
      )}
    </Component>
  )
}
