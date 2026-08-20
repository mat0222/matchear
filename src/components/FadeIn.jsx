/**
 * Entrada suave al montar. Respeta prefers-reduced-motion vía CSS global.
 */
export function FadeIn({ children, className = '', delay = 0, as: Tag = 'div' }) {
  return (
    <Tag
      className={`motion-safe:animate-fade-in ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
