import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar.jsx'
import { Footer } from '../components/Footer.jsx'

export function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <section className="relative">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: "url('/hero.jpg')",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/35" />

            <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
                ¡ALQUILA Y AHORRA EN
                <br />
                CANCHAS DE FÚTBOL EN TU
                <br />
                CIUDAD!
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-white/85 md:text-lg">
                Obtén grandes descuentos y empieza a ahorrar con Matchear
              </p>

              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/15">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                Villa del Rosario, Córdoba
              </div>

              <div className="mt-10">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-rose-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-black/30 hover:bg-rose-400 active:bg-rose-600"
                >
                  ¡REGÍSTRATE HOY!
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center text-3xl font-extrabold text-slate-900 md:text-4xl">
            ¿Listo para jugar?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Encontrá tu cancha ideal y reservá en segundos.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/canchas"
              className="rounded-full bg-rose-500 px-7 py-2.5 text-sm font-semibold text-white hover:bg-rose-400 active:bg-rose-600"
            >
              Ver Canchas
            </Link>
          </div>
        </section>

        <section id="faq" className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center text-3xl font-extrabold text-slate-900 md:text-4xl">
              ¿Por qué elegir Matchear?
            </h2>
            <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-black/5 bg-slate-50 p-6">
                <div className="text-sm font-bold text-slate-900">
                  Reservas rápidas
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Encontrá disponibilidad y reservá sin llamadas.
                </p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-slate-50 p-6">
                <div className="text-sm font-bold text-slate-900">
                  Mejores precios
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Promos y descuentos en tu ciudad.
                </p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-slate-50 p-6">
                <div className="text-sm font-bold text-slate-900">
                  Variedad de canchas
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  5v5, 7v7, 8v8 y 9v9 para tu equipo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


