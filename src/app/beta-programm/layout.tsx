import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beta-Programm | nicnoa",
  description: "Werden Sie Teil der Zukunft des Salon-Managements als einer unserer exklusiven Beta-Tester.",
}

export default function BetaProgrammLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 