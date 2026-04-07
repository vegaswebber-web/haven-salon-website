import PageBanner from '../components/PageBanner'
import Gallery from '../sections/Gallery'

export default function GaleriePage() {
  return (
    <>
      <PageBanner
        title="Galerie"
        subtitle="Een beeld zegt meer dan duizend woorden. Bekijk een selectie van ons werk."
      />
      <Gallery />
    </>
  )
}
