import { useEffect, useState } from 'react'
import './TopBanner.css'

const TARGET = new Date('2026-06-13T10:00:00+02:00').getTime()
function calcCd() {
  const d = TARGET - Date.now()
  if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(d / 86400000),
    hours:   Math.floor((d % 86400000) / 3600000),
    minutes: Math.floor((d % 3600000) / 60000),
    seconds: Math.floor((d % 60000) / 1000),
  }
}

function Num({ value, label }) {
  const str = String(value).padStart(2, '0')
  return (
    <div className="tb-unit">
      <span className="tb-num" key={str}>{str}</span>
      <span className="tb-lbl">{label}</span>
    </div>
  )
}

export default function TopBanner() {
  const [open, setOpen] = useState(true)
  const [cd, setCd] = useState(calcCd)

  useEffect(() => {
    const id = setInterval(() => setCd(calcCd()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    document.body.dataset.banner = open ? 'open' : 'closed'
    return () => { delete document.body.dataset.banner }
  }, [open])

  return (
    <div className={`tb-wrap ${open ? 'tb-wrap--open' : 'tb-wrap--closed'}`}>
      <div className="tb-content">
        <span className="tb-label">Opening 13 juni 2026</span>

        <div className="tb-cd">
          <Num value={cd.days}    label="Dagen" />
          <span className="tb-sep">:</span>
          <Num value={cd.hours}   label="Uren" />
          <span className="tb-sep">:</span>
          <Num value={cd.minutes} label="Min" />
          <span className="tb-sep">:</span>
          <Num value={cd.seconds} label="Sec" />
        </div>
      </div>

      <button
        className="tb-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Banner sluiten' : 'Banner openen'}
      >
        <svg
          className={`tb-arrow ${open ? 'tb-arrow--up' : 'tb-arrow--down'}`}
          width="12" height="8" viewBox="0 0 12 8" fill="none"
        >
          <path d="M1 6.5L6 1.5L11 6.5" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
