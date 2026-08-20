import { useState } from 'react'
import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'
import { inputClass, labelClass, selectClass, textareaClass } from '../lib/form'
import { openWhatsappFixedSlotRequest } from '../lib/whatsapp'

const benefits = [
  {
    title: 'Precio congelado',
    text: 'Tu tarifa queda fija durante todo el período contratado, sin sorpresas por temporada alta.',
    icon: '💰',
  },
  {
    title: 'Prioridad de reserva',
    text: 'Tu horario está garantizado semana a semana. Nadie te quita la cancha.',
    icon: '⭐',
  },
  {
    title: 'Descuentos en cantina',
    text: 'Beneficios exclusivos en buffet, bebidas y asadores para equipos con turno fijo.',
    icon: '🍔',
  },
  {
    title: 'Vestuario reservado',
    text: 'Acceso preferencial a vestuarios con duchas antes y después del partido.',
    icon: '🚿',
  },
]

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const hours = ['08:00', '09:00', '10:00', '11:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']

export default function TurnosFijos() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    openWhatsappFixedSlotRequest(
      {
        name: String(data.get('name') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        day: String(data.get('day') || ''),
        hour: String(data.get('hour') || ''),
        format: String(data.get('format') || ''),
        period: String(data.get('period') || ''),
        notes: String(data.get('notes') || ''),
      },
    )

    setSent(true)
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Membresía"
        title="Turnos fijos"
        description="Asegurá tu día y horario permanente. Es la forma más conveniente — y económica — de jugar todas las semanas."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-brand/20 hover:shadow-card-hover"
            >
              <span className="text-3xl" aria-hidden>
                {item.icon}
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-neutral-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-neutral-100 bg-white p-8 shadow-card">
          <h2 className="text-xl font-extrabold text-neutral-950">Solicitá tu turno fijo</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Indicá el día, horario y duración que buscás. Nuestro equipo te arma una propuesta a medida.
          </p>

          {sent ? (
            <p className="mt-6 rounded-xl bg-brand-muted px-4 py-3 text-sm font-semibold text-brand">
              ¡Listo! Se abrió WhatsApp con tu solicitud al complejo. Enviá el mensaje y te respondemos a la brevedad.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Nombre completo
                  </label>
                  <input id="name" name="name" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    WhatsApp
                  </label>
                  <input id="phone" name="phone" type="tel" required className={inputClass} placeholder="351 000 0000" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="day" className={labelClass}>
                    Día preferido
                  </label>
                  <select id="day" name="day" required className={selectClass}>
                    <option value="">Elegí un día</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="hour" className={labelClass}>
                    Horario preferido
                  </label>
                  <select id="hour" name="hour" required className={selectClass}>
                    <option value="">Elegí un horario</option>
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour} hs
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="format" className={labelClass}>
                    Formato de cancha
                  </label>
                  <select id="format" name="format" required className={selectClass}>
                    <option value="">Elegí formato</option>
                    <option value="5v5">5v5</option>
                    <option value="7v7">7v7</option>
                    <option value="8v8">8v8</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="period" className={labelClass}>
                    Período
                  </label>
                  <select id="period" name="period" required className={selectClass}>
                    <option value="">Elegí período</option>
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>
                  Detalles adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className={textareaClass}
                  placeholder="Cantidad de jugadores, frecuencia, si necesitás vestuario..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:brightness-105"
              >
                Solicitar turno fijo
              </button>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  )
}
