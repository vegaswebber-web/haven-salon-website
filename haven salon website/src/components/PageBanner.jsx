import { Link } from 'react-router-dom'
import './PageBanner.css'

export default function PageBanner({ title, subtitle, crumb }) {
  return (
    <div className="page-banner">
      <div className="container page-banner-inner">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{crumb || title}</span>
        </nav>
        <h1 className="page-banner-title">{title}</h1>
        {subtitle && <p className="page-banner-sub">{subtitle}</p>}
      </div>
    </div>
  )
}
