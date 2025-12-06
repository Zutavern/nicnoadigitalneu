import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Über uns | nicnoa",
  description: "Lernen Sie das Team hinter NICNOA & CO. DIGITAL kennen - Experten für moderne Salon-Coworking-Lösungen.",
}

export default function UberUnsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 