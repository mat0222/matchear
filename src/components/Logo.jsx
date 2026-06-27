import { Link } from 'react-router-dom'

const LOGO_SRC = '/logo-matchear.png'

export function Logo({ to = '/', className = '', size = 'default' }) {
  const isLarge = size === 'large'

  const boxClass = isLarge
    ? 'h-44 w-44 sm:h-52 sm:w-52 md:h-60 md:w-60'
    : 'h-14 w-auto max-w-[11rem] sm:h-16 sm:max-w-[12rem]'

  return (
    <Link
      to={to}
      className={`group inline-flex shrink-0 items-center transition hover:opacity-90 ${className}`}
      aria-label="Matchear - inicio"
    >
      <span className={`relative flex items-center justify-center overflow-hidden ${boxClass}`}>
        <img
          src={LOGO_SRC}
          alt="Matchear"
          className="h-full w-auto max-w-none scale-[1.45] object-contain object-left transition group-hover:scale-[1.5]"
        />
      </span>
    </Link>
  )
}
