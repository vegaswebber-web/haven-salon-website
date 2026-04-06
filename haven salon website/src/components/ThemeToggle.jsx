import { useTheme } from '../contexts/ThemeContext'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      className={`theme-toggle ${theme}`}
      onClick={toggle}
      aria-label="Thema wisselen"
      title={theme === 'dark' ? 'Licht thema' : 'Donker thema'}
    >
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span className="toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  )
}
