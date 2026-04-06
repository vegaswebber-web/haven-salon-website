import PageBanner from '../components/PageBanner'
import Pricing from '../sections/Pricing'

export default function PrijzenPage() {
  return (
    <>
      <PageBanner
        title="Tarieven"
        subtitle="Eerlijke tarieven voor topkwaliteit. Inclusief BTW, geen verrassingen."
      />
      <Pricing />
    </>
  )
}
