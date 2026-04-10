import { useState } from 'react'
import './FAQ.css'

const faqs = [
  {
    q: 'Heb ik een afspraak nodig?',
    a: 'Een afspraak is aanbevolen zodat we je op het gewenste tijdstip kunnen ontvangen. Loop-ins zijn welkom als er plek is, maar om wachten te vermijden raden we aan vooraf te boeken.',
  },
  {
    q: 'Hoe lang duurt een knipbeurt?',
    a: 'Een standaard knipbeurt duurt ongeveer 30 minuten. Knippen inclusief baard stylen duurt gemiddeld 45 minuten. Voor kleur- en behandelingsafspraken reserveren we meer tijd.',
  },
  {
    q: 'Welke betaalmethoden accepteren jullie?',
    a: 'Wij accepteren contant geld en pinnen. Creditcard betaling is helaas niet mogelijk.',
  },
  {
    q: 'Kan ik mijn afspraak verzetten of annuleren?',
    a: 'Ja, dat kan. Bel of WhatsApp ons zo vroeg mogelijk als je jouw afspraak wilt verzetten of annuleren, zodat we de plek voor een andere klant kunnen vrijmaken.',
  },
  {
    q: 'Is er parkeergelegenheid in de buurt?',
    a: 'Ja, in de Burgstraat en de directe omgeving zijn meerdere parkeerplaatsen beschikbaar. Volendam heeft ook gratis parkeren op loopafstand.',
  },
  {
    q: 'Werken jullie ook met kinderen?',
    a: 'Ja, we knippen kinderen tot en met 13 jaar voor een speciaal tarief. Jongens zijn van harte welkom bij Haven Salon.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="faq">
      <div className="container">
        <div className="faq-header">
          <span className="section-label">Veelgestelde vragen</span>
          <h2 className="section-title">FAQ</h2>
          <div className="divider" />
        </div>

        <div className="faq-list">
          {faqs.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${open === i ? 'open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{item.q}</span>
                <span className="faq-icon">{open === i ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
