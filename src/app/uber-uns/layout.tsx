import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Über uns | nicnoa",
  description: "Lernen Sie das Team hinter NICNOA&CO.online kennen - Experten für moderne Salon-Coworking-Lösungen.",
}

export default function UberUnsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 