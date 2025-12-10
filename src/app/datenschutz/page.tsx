import { Metadata } from 'next'
import { LegalPageContent } from '@/components/legal/legal-page-content'

export const metadata: Metadata = {
  title: 'Datenschutz | NICNOA',
  description: 'Datenschutzerklärung für die Nutzung der NICNOA Plattform',
}

export default function DatenschutzPage() {
  return <LegalPageContent pageType="DATENSCHUTZ" />
}
