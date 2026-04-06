import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="nf-page">
      <div className="nf-content">
        <span className="nf-code">404</span>
        <h1 className="nf-title">Pagina niet gevonden</h1>
        <p className="nf-text">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <Link to="/" className="btn-primary">
          Terug naar home
        </Link>
      </div>
    </div>
  )
}
