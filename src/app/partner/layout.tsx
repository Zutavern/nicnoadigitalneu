import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Partner | nicnoa",
  description: "Entdecken Sie unsere starken Technologie- und Integrationspartner für Ihren Salon-Space.",
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 