import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import confetti from 'canvas-confetti'

const OPENING = new Date('2026-06-13T00:00:00')
const COLORS = ['#c9a84c', '#e0c97a', '#f5e6c0', '#ffffff', '#d4a843']

export default function OpeningConfetti() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') return
    if (new Date() < OPENING) return
    if (sessionStorage.getItem('haven-confetti')) return

    sessionStorage.setItem('haven-confetti', '1')

    const end = Date.now() + 4000

    ;(function frame() {
      confetti({ particleCount: 4, angle: 60,  spread: 60, origin: { x: 0 }, colors: COLORS })
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: COLORS })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }, [location.pathname])

  return null
}
