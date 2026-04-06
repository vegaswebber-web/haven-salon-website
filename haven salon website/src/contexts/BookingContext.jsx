import { createContext, useContext, useState } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <BookingContext.Provider value={{
      open,
      openBooking: () => setOpen(true),
      closeBooking: () => setOpen(false),
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => useContext(BookingContext)
