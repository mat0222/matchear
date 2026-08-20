import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'

const gallery = [
  {
    src: 'https://images.unsplash.com/photo-1459865269847-f9fc3a4cb5fc?auto=format&fit=crop&w=800&q=80',
    alt: 'Cancha de fútbol sintético iluminada',
    caption: 'Canchas premium',
  },
  {
    src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    alt: 'Buffet y cantina del complejo',
    caption: 'Buffet y cantina',
  },
  {
    src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80',
    alt: 'Asadores al aire libre',
    caption: 'Asadores',
  },
  {
    src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    alt: 'Vestuarios con duchas',
    caption: 'Vestuarios',
  },
  {
    src: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    alt: 'Estacionamiento del predio',
    caption: 'Estacionamiento',
  },
  {
    src: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80',
    alt: 'Zona de tercer tiempo después del partido',
    caption: 'Tercer tiempo',
  },
]

const facilities = [
  {
    title: 'Asadores',
    text: 'Parrillas cubiertas para que tu equipo siga la jornada después del partido.',
  },
  {
    title: 'Buffet y cantina',
    text: 'Hamburguesas, picadas, bebidas frías y café. Todo listo para el antes y el después del encuentro.',
  },
  {
    title: 'Baños',
    text: 'Amplios, limpios y con agua caliente. Toallas disponibles en horario de partidos.',
  },
  {
    title: 'Estacionamiento privado',
    text: 'Ingreso controlado y lugar seguro para autos y motos, a metros de las canchas.',
  },
  {
    title: 'Iluminación LED',
    text: 'Todas las canchas con iluminación profesional para jugar de noche con excelente visibilidad.',
  },
  {
    title: 'Zona de descanso',
    text: 'Mesas, sombra y Wi-Fi para esperar el próximo partido o ver la fecha en vivo.',
  },
]

export default function Instalaciones() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="El complejo"
        title="Instalaciones"
        description="En Matchear no solo alquilás el sintético: alquilás la experiencia completa en Villa del Rosario."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((photo) => (
            <figure
              key={photo.caption}
              className="group overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <figcaption className="absolute bottom-0 left-0 right-0 px-4 py-3 text-sm font-bold text-white">
                  {photo.caption}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>

        <div className="mt-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-neutral-950 sm:text-3xl">Todo para quedarte después del partido</h2>
            <p className="mt-3 text-neutral-600">
              Diseñamos el predio pensando en el tercer tiempo: comer, charlar y relajarse sin apuro.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card transition hover:border-brand/20 hover:shadow-card-hover"
              >
                <h3 className="text-lg font-extrabold text-neutral-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.text}</p>
                <div className="mt-4 h-1 w-10 rounded-full bg-gradient-to-r from-brand to-brand-dark opacity-60" />
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
