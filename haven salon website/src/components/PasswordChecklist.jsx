import './PasswordChecklist.css'

const rules = [
  { key: 'len',    label: 'Minimaal 8 tekens',      test: pw => pw.length >= 8 },
  { key: 'upper',  label: 'Minimaal 1 hoofdletter', test: pw => /[A-Z]/.test(pw) },
  { key: 'digit',  label: 'Minimaal 1 cijfer',      test: pw => /[0-9]/.test(pw) },
  { key: 'symbol', label: 'Minimaal 1 symbool',     test: pw => /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(pw) },
]

function Check() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3.8 6.5l1.8 1.8 3.6-3.6" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Cross() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round"/>
    </svg>
  )
}

export default function PasswordChecklist({ password }) {
  if (!password) return null
  return (
    <ul className="pw-checklist">
      {rules.map(r => {
        const ok = r.test(password)
        return (
          <li key={r.key} className={`pw-item ${ok ? 'pw-ok' : 'pw-fail'}`}>
            <span className="pw-icon">{ok ? <Check /> : <Cross />}</span>
            {r.label}
          </li>
        )
      })}
    </ul>
  )
}
