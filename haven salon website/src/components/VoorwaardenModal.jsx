import './VoorwaardenModal.css'

export default function VoorwaardenModal({ onClose }) {
  return (
    <div className="vw-overlay" onClick={onClose}>
      <div className="vw-card" onClick={e => e.stopPropagation()}>
        <div className="vw-header">
          <span className="vw-title">Algemene voorwaarden</span>
          <button className="vw-close" onClick={onClose} aria-label="Sluiten">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="vw-body">
          <p className="vw-date">Versie: januari 2025 · Haven Salon Volendam</p>

          <h3>1. Algemeen</h3>
          <p>Deze voorwaarden zijn van toepassing op alle diensten van Haven Salon, gevestigd aan de Burgstraat 1, Volendam. Door een account aan te maken gaat u akkoord met deze voorwaarden.</p>

          <h3>2. Afspraken</h3>
          <p>Afspraken dienen minimaal 24 uur van tevoren geannuleerd te worden. Bij no-show of te late annulering kunnen kosten in rekening worden gebracht. Haven Salon behoudt het recht om afspraken te weigeren of te annuleren.</p>

          <h3>3. Account</h3>
          <p>U bent verantwoordelijk voor de veiligheid van uw accountgegevens. Deel uw wachtwoord niet met anderen. Bij vermoed misbruik kunt u contact opnemen met de salon.</p>

          <h3>4. Privacy</h3>
          <p>Uw persoonsgegevens (naam, e-mailadres, telefoonnummer) worden uitsluitend gebruikt voor het beheren van uw account en afspraken. Gegevens worden niet gedeeld met derden. U kunt uw account en gegevens op elk moment verwijderen.</p>

          <h3>5. Nieuwsbrief en communicatie</h3>
          <p>Als u kiest voor het ontvangen van updates, sturen wij u occasioneel berichten over aanbiedingen, nieuws en evenementen. U kunt zich op elk moment afmelden via uw accountinstellingen.</p>

          <h3>6. Aansprakelijkheid</h3>
          <p>Haven Salon is niet aansprakelijk voor schade als gevolg van onjuiste of onvolledige informatie op de website. Prijzen en diensten kunnen zonder voorafgaande kennisgeving worden gewijzigd.</p>

          <h3>7. Contact</h3>
          <p>Voor vragen over deze voorwaarden kunt u contact opnemen via <strong>info@havensalon.nl</strong> of <strong>+31 299 235 355</strong>.</p>

          <button className="vw-btn" onClick={onClose}>Sluiten</button>
        </div>
      </div>
    </div>
  )
}
