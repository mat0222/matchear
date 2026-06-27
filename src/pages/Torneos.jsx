import { useState } from 'react'
import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'
import { inputClass, labelClass, selectClass, textareaClass } from '../lib/form'

const steps = [
  {
    title: 'Definí tu torneo',
    text: 'Elegí cantidad de equipos, formato (5, 7 u 8) y fechas tentativas. Nos contás la idea y la afinamos juntos.',
  },
  {
    title: 'Reservamos el complejo',
    text: 'Bloqueamos canchas, horarios e iluminación. Vos te enfocás en convocar equipos; nosotros en que todo funcione.',
  },
  {
    title: 'Armamos el fixture',
    text: 'Grupos, cruces, semifinales y final. Te damos el calendario listo para compartir con los capitanes.',
  },
  {
    title: 'Jugás y premiás',
    text: 'El torneo se disputa en Matchear. Al cierre, el campeón y el subcampeón se llevan el premio en efectivo.',
  },
]

const groupA = [
  { pos: 1, team: 'Equipo Alpha', pts: 9 },
  { pos: 2, team: 'Equipo Bravo', pts: 6 },
  { pos: 3, team: 'Equipo Charlie', pts: 3 },
  { pos: 4, team: 'Equipo Delta', pts: 0 },
]

const groupB = [
  { pos: 1, team: 'Equipo Echo', pts: 7 },
  { pos: 2, team: 'Equipo Foxtrot', pts: 6 },
  { pos: 3, team: 'Equipo Golf', pts: 4 },
  { pos: 4, team: 'Equipo Hotel', pts: 1 },
]

const prizes = [
  {
    place: '1° puesto',
    amount: '$150.000',
    detail: 'Campeón del torneo · premio en efectivo al finalizar la final',
    highlight: true,
  },
  {
    place: '2° puesto',
    amount: '$80.000',
    detail: 'Subcampeón · premio en efectivo para el equipo finalista',
    highlight: false,
  },
]

function GroupTable({ name, teams }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
      <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand">{name}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-50 text-xs font-bold uppercase text-neutral-400">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Equipo</th>
            <th className="px-4 py-2 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((row) => (
            <tr
              key={row.team}
              className={`border-b border-neutral-50 last:border-0 ${
                row.pos <= 2 ? 'bg-brand-muted/30' : ''
              }`}
            >
              <td className="px-4 py-2.5 font-bold text-brand">{row.pos}</td>
              <td className="px-4 py-2.5 font-semibold text-neutral-900">{row.team}</td>
              <td className="px-4 py-2.5 text-right font-extrabold text-neutral-950">{row.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-2 text-xs text-neutral-500">
        Pasan 1° y 2° de cada grupo a semifinales
      </p>
    </div>
  )
}

function MatchCard({ label, home, away, note }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-brand">{label}</p>
      <p className="mt-2 text-center text-base font-extrabold text-neutral-950">
        <span>{home}</span>
        <span className="mx-2 font-normal text-neutral-400">vs</span>
        <span>{away}</span>
      </p>
      {note ? <p className="mt-1 text-center text-xs text-neutral-500">{note}</p> : null}
    </div>
  )
}

export default function Torneos() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Organizá tu evento"
        title="Torneos en Matchear"
        description="¿Tenés un grupo de amigos, un equipo o una empresa? Armá tu propio campeonato en nuestro complejo. Nosotros te damos las canchas; vos traés la pasión."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-neutral-950 sm:text-3xl">¿Cómo funciona?</h2>
          <p className="mt-3 text-neutral-600">
            Organizar un torneo en Matchear es simple: coordinamos fechas, definimos el formato y vos invitás a los
            equipos. Ideal para cumpleaños, empresas, barrios o grupos de amigos.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <article
              key={step.title}
              className="relative rounded-3xl border border-neutral-100 bg-white p-6 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-sm font-extrabold text-white shadow-md shadow-brand/25">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-neutral-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Ejemplo</p>
            <h2 className="mt-3 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
              Formato con 8 equipos
            </h2>
            <p className="mt-3 text-neutral-600">
              Dos grupos de cuatro, todos contra todos. Los dos primeros de cada zona avanzan a semifinales y de ahí
              a la gran final.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            <div>
              <h3 className="mb-4 text-center text-sm font-extrabold uppercase tracking-wide text-neutral-500">
                Fase de grupos
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <GroupTable name="Grupo A" teams={groupA} />
                <GroupTable name="Grupo B" teams={groupB} />
              </div>
            </div>

            <div className="flex justify-center">
              <div className="h-8 w-px bg-gradient-to-b from-brand/40 to-brand" aria-hidden />
            </div>

            <div>
              <h3 className="mb-4 text-center text-sm font-extrabold uppercase tracking-wide text-neutral-500">
                Semifinales
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <MatchCard
                  label="Semifinal 1"
                  home="1° Grupo A"
                  away="2° Grupo B"
                  note="Ej: Equipo Alpha vs Equipo Foxtrot"
                />
                <MatchCard
                  label="Semifinal 2"
                  home="1° Grupo B"
                  away="2° Grupo A"
                  note="Ej: Equipo Echo vs Equipo Bravo"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <div className="h-8 w-px bg-gradient-to-b from-brand/40 to-brand" aria-hidden />
            </div>

            <div className="mx-auto max-w-md">
              <h3 className="mb-4 text-center text-sm font-extrabold uppercase tracking-wide text-neutral-500">
                Final
              </h3>
              <div className="overflow-hidden rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-brand-muted to-white p-6 text-center shadow-card">
                <p className="text-xs font-bold uppercase tracking-widest text-brand">Gran final</p>
                <p className="mt-3 text-xl font-extrabold text-neutral-950">
                  Ganador SF 1 <span className="text-neutral-400">vs</span> Ganador SF 2
                </p>
                <p className="mt-2 text-sm text-neutral-600">Un solo partido define al campeón</p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-center text-sm font-extrabold uppercase tracking-wide text-neutral-500">
                Premios en efectivo
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {prizes.map((prize) => (
                  <article
                    key={prize.place}
                    className={`rounded-3xl border p-6 text-center ${
                      prize.highlight
                        ? 'border-brand/30 bg-gradient-to-br from-brand via-brand to-brand-dark text-white shadow-lg shadow-brand/25'
                        : 'border-neutral-100 bg-white shadow-card'
                    }`}
                  >
                    <p
                      className={`text-sm font-bold uppercase tracking-wide ${
                        prize.highlight ? 'text-white/80' : 'text-brand'
                      }`}
                    >
                      {prize.place}
                    </p>
                    <p className={`mt-2 text-3xl font-black ${prize.highlight ? 'text-white' : 'text-neutral-950'}`}>
                      {prize.amount}
                    </p>
                    <p className={`mt-2 text-sm ${prize.highlight ? 'text-white/85' : 'text-neutral-600'}`}>
                      {prize.detail}
                    </p>
                  </article>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-neutral-500">
                * Montos de ejemplo. Los premios se acuerdan según cantidad de equipos, inscripción y duración del
                torneo.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-neutral-100 bg-white p-8 shadow-card">
          <h2 className="text-xl font-extrabold text-neutral-950">Quiero organizar mi torneo</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Contanos cuántos equipos pensás convocar y te armamos una propuesta con fechas, formato y premios.
          </p>
          {sent ? (
            <p className="mt-6 rounded-xl bg-brand-muted px-4 py-3 text-sm font-semibold text-brand">
              ¡Recibimos tu consulta! Te contactamos en las próximas 24 hs para coordinar.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="organizer" className={labelClass}>
                  Tu nombre
                </label>
                <input id="organizer" name="organizer" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  WhatsApp
                </label>
                <input id="phone" name="phone" type="tel" required className={inputClass} placeholder="351 000 0000" />
              </div>
              <div>
                <label htmlFor="teams" className={labelClass}>
                  Cantidad de equipos estimada
                </label>
                <select id="teams" name="teams" required className={selectClass}>
                  <option value="">Elegí una opción</option>
                  <option value="6">6 equipos</option>
                  <option value="8">8 equipos</option>
                  <option value="10">10 equipos</option>
                  <option value="12">12 equipos o más</option>
                </select>
              </div>
              <div>
                <label htmlFor="format" className={labelClass}>
                  Formato de cancha
                </label>
                <select id="format" name="format" required className={selectClass}>
                  <option value="">Elegí formato</option>
                  <option value="5v5">Fútbol 5</option>
                  <option value="7v7">Fútbol 7</option>
                  <option value="8v8">Fútbol 8</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>
                  Comentarios (opcional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className={textareaClass}
                  placeholder="Fechas tentativas, tipo de torneo, premio que querés ofrecer..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:brightness-105"
              >
                Consultar por mi torneo
              </button>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  )
}
