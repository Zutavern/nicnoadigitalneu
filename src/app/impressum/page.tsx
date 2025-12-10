import { Metadata } from 'next'
import { LegalPageContent } from '@/components/legal/legal-page-content'

export const metadata: Metadata = {
  title: 'Impressum | NICNOA',
  description: 'Impressum und rechtliche Informationen von NICNOA',
}

export default function ImpressumPage() {
  return <LegalPageContent pageType="IMPRESSUM" />
}
