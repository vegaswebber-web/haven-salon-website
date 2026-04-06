import { useBooking } from '../contexts/BookingContext'
import './Team.css'

const team = [
  {
    name: 'Abdulhalim Al Hussein',
    role: 'Eigenaar & Kapper',
    specialty: 'Knippen, stylen & baard',
    initials: 'AH',
    photo: '/halimm.jpg',
  },
]

export default function Team() {
  const { openBooking } = useBooking()
  return (
    <section id="team" className="team">
      <div className="container">
        <div className="team-header">
          <span className="section-label">Het team</span>
          <h2 className="section-title">Maak kennis met Abdulla</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Abdulla is de man achter Haven Salon. Met zijn persoonlijke aanpak
            en oog voor detail zorgt hij ervoor dat jij met een goed gevoel de deur uitloopt.
          </p>
        </div>

        <div className="team-single">
          {team.map(member => (
            <div key={member.name} className="team-card-large">
              <div className="team-photo-wrap">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="team-photo"
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="team-initials-fallback" style={{ display: 'none' }}>
                  {member.initials}
                </div>
              </div>
              <div className="team-info">
                <span className="team-role">{member.role}</span>
                <h3 className="team-name">{member.name}</h3>
                <div className="divider" style={{ margin: '16px 0' }} />
                <p className="team-specialty">{member.specialty}</p>
                <button className="btn-primary" style={{ marginTop: '28px' }} onClick={openBooking}>
                  Maak een afspraak
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
