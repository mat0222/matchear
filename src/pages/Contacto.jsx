import { useState } from 'react'
import { PageShell } from '../components/PageShell'
import { PageHeader } from '../components/PageHeader'
import { inputClass, labelClass, textareaClass } from '../lib/form'
import { OWNER_WHATSAPP, isOwnerWhatsappConfigured } from '../lib/whatsapp'

const address = 'Av. San Martín 1250, Villa del Rosario, Córdoba'
const mapEmbedSrc =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3406.5!2d-63.54!3d-31.56!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMzJzM2LjAiUyA2M8KwMzInMjQuMCJX!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar'

const hours = [
  { day: 'Lunes a viernes', time: '08:00 – 23:00 hs' },
  { day: 'Sábados', time: '08:00 – 00:00 hs' },
  { day: 'Domingos y feriados', time: '09:00 – 22:00 hs' },
]

const whatsappHref = isOwnerWhatsappConfigured() ? `https://wa.me/${OWNER_WHATSAPP}` : '#'

const socials = [
  { name: 'Instagram', href: 'https://instagram.com', handle: '@matchear.vdr' },
  { name: 'Facebook', href: 'https://facebook.com', handle: 'Matchear Villa del Rosario' },
  {
    name: 'WhatsApp',
    href: whatsappHref,
    handle: isOwnerWhatsappConfigured() ? `+${OWNER_WHATSAPP}` : 'Configurar VITE_WHATSAPP_OWNER',
  },
]

export default function Contacto() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Estamos cerca"
        title="Contacto"
        description="Encontranos en Villa del Rosario. Escribinos para reservas, torneos o eventos corporativos."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-neutral-100 shadow-card">
              <iframe
                title="Ubicación de Matchear en Villa del Rosario"
                src={mapEmbedSrc}
                className="h-64 w-full border-0 sm:h-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card">
              <h2 className="text-lg font-extrabold text-neutral-950">Dirección</h2>
              <p className="mt-2 text-sm text-neutral-600">{address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-bold text-brand hover:underline"
              >
                Abrir en Google Maps →
              </a>
            </div>

            <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card">
              <h2 className="text-lg font-extrabold text-neutral-950">Horarios de atención</h2>
              <ul className="mt-4 space-y-3">
                {hours.map((item) => (
                  <li key={item.day} className="flex justify-between gap-4 text-sm">
                    <span className="font-semibold text-neutral-700">{item.day}</span>
                    <span className="font-bold text-neutral-900">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card">
              <h2 className="text-lg font-extrabold text-neutral-950">Redes sociales</h2>
              <ul className="mt-4 space-y-3">
                {socials.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-neutral-50"
                    >
                      <span className="font-semibold text-neutral-700">{item.name}</span>
                      <span className="font-bold text-brand">{item.handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-100 bg-white p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-neutral-950">Reservas corporativas</h2>
            <p className="mt-2 text-sm text-neutral-600">
              ¿Tu empresa quiere armar un torneo interno o un after office en cancha? Contanos y te armamos una
              propuesta.
            </p>

            {sent ? (
              <p className="mt-6 rounded-xl bg-brand-muted px-4 py-3 text-sm font-semibold text-brand">
                ¡Gracias! Un asesor se comunicará con vos a la brevedad.
              </p>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="company" className={labelClass}>
                    Empresa
                  </label>
                  <input id="company" name="company" required className={inputClass} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>
                      Nombre de contacto
                    </label>
                    <input id="contact-name" name="contactName" required className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={labelClass}>
                      Email
                    </label>
                    <input id="contact-email" name="email" type="email" required className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-phone" className={labelClass}>
                    Teléfono
                  </label>
                  <input id="contact-phone" name="phone" type="tel" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="message" className={labelClass}>
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className={textareaClass}
                    placeholder="Cantidad de personas, fecha estimada, tipo de evento..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:brightness-105"
                >
                  Enviar consulta
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
