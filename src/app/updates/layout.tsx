import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Updates | nicnoa",
  description: "Die neuesten Entwicklungen und Verbesserungen für Ihren Salon-Space.",
}

export default function UpdatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 