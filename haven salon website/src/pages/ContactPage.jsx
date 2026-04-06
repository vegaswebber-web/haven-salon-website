import PageBanner from '../components/PageBanner'
import Contact from '../sections/Contact'

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact"
        subtitle="Maak een afspraak of neem contact op — we helpen je graag."
      />
      <Contact />
    </>
  )
}
