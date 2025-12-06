import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Roadmap | nicnoa",
  description: "Entdecken Sie die Zukunft des Salon-Managements mit unserer Produktroadmap.",
}

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 