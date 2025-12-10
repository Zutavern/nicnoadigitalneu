import { Metadata } from 'next'
import { LegalPageContent } from '@/components/legal/legal-page-content'

export const metadata: Metadata = {
  title: 'AGB | NICNOA',
  description: 'Allgemeine Geschäftsbedingungen für die Nutzung der NICNOA Plattform',
}

export default function AGBPage() {
  return <LegalPageContent pageType="AGB" />
}
