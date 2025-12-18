import { Link } from 'react-router-dom'
import { Logo } from './Logo.jsx'

export function Footer() {
  return (
    <footer className="mt-16 bg-[#ff4d4d] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <Logo className="bg-white/15" />
          <p className="mt-4 max-w-sm text-sm text-white/90">
            Reservá canchas, organizá partidos y jugá más. Matchear te conecta con
            las mejores opciones en tu ciudad.
          </p>
        </div>

        <div>
          <div className="text-sm font-extrabold tracking-wide text-white">
            Navegación
          </div>
          <ul className="mt-4 space-y-3 text-sm text-white/90">
            <li>
              <Link to="/" className="hover:text-white hover:underline">
                Portada
              </Link>
            </li>
            <li>
              <Link to="/canchas" className="hover:text-white hover:underline">
                Canchas
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white hover:underline">
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-extrabold tracking-wide text-white">
            Contacto
          </div>
          <div className="mt-4 space-y-3 text-sm text-white/90">
            <div>
              <div className="font-semibold text-white">Ubicación</div>
              <div>Villa del Rosario, Córdoba</div>
            </div>
            <div>
              <div className="font-semibold text-white">Email</div>
              <div>contacto@matchear.com</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/90 md:flex-row">
          <div>© {new Date().getFullYear()} Matchear. Todos los derechos reservados.</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-white hover:underline" href="#faq">
              FAQ
            </a>
            <span className="text-white/50">•</span>
            <a className="hover:text-white hover:underline" href="#">
              Términos
            </a>
            <span className="text-white/50">•</span>
            <a className="hover:text-white hover:underline" href="#">
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}



