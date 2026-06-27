import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'

const WHATSAPP_URL =
  'https://wa.me/5493515551234?text=Hola%21%20Quiero%20consultar%20por%20la%20escuelita%20de%20f%C3%BAtbol%20en%20Matchear.'

const schedules = [
  { category: 'Categoría 2018–2019', days: 'Martes y jueves', time: '17:00 – 18:00 hs', ages: '6–7 años' },
  { category: 'Categoría 2016–2017', days: 'Martes y jueves', time: '18:00 – 19:00 hs', ages: '8–9 años' },
  { category: 'Categoría 2014–2015', days: 'Lunes y miércoles', time: '17:30 – 19:00 hs', ages: '10–11 años' },
  { category: 'Categoría 2012–2013', days: 'Lunes y miércoles', time: '19:00 – 20:30 hs', ages: '12–13 años' },
]

const coaches = [
  { name: 'Prof. Alejandro Martínez', role: 'Director técnico · Licencia CONMEBOL B' },
  { name: 'Prof. Sofía Benítez', role: 'Categorías formativas · Especialista infantil' },
  { name: 'Prof. Diego Romero', role: 'Preparador físico · Categorías 2012–2015' },
]

export default function Escuelita() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Formación"
        title="Escuelita de fútbol"
        description="Entrenamiento profesional para chicos y chicas. Aprovechamos el horario de tarde en canchas de primer nivel."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-brand/20 bg-brand-muted p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950">Inscripciones abiertas 2026</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-700">
                Clases con metodología progresiva, trabajo en equipo y diversión. Primera clase de prueba sin cargo.
              </p>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-105"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.547 4.095 1.505 5.827L0 24l6.335-1.662A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.01-1.37l-.358-.214-3.76.986 1.004-3.666-.233-.375A9.818 9.818 0 1112 21.818z" />
              </svg>
              Consultar por WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-extrabold text-neutral-950">Horarios y categorías</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {schedules.map((item) => (
              <article
                key={item.category}
                className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card"
              >
                <h3 className="text-lg font-extrabold text-brand">{item.category}</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="font-semibold text-neutral-500">Edades</dt>
                    <dd className="font-bold text-neutral-900">{item.ages}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-semibold text-neutral-500">Días</dt>
                    <dd className="font-bold text-neutral-900">{item.days}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-semibold text-neutral-500">Horario</dt>
                    <dd className="font-bold text-neutral-900">{item.time}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-extrabold text-neutral-950">Cuerpo técnico</h2>
          <ul className="mt-6 space-y-4">
            {coaches.map((coach) => (
              <li
                key={coach.name}
                className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-muted text-lg font-extrabold text-brand">
                  {coach.name.split(' ')[1]?.[0]}
                  {coach.name.split(' ')[2]?.[0]}
                </span>
                <div>
                  <p className="font-extrabold text-neutral-950">{coach.name}</p>
                  <p className="mt-1 text-sm text-neutral-600">{coach.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  )
}
