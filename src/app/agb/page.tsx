import { Metadata } from "next";
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: "AGB | nicnoa",
  description: "Allgemeine Geschäftsbedingungen für die Nutzung der nicnoa Plattform",
};

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§1 Geltungsbereich</h2>
        <p className="mb-4">
          Diese Allgemeinen Geschäftsbedingungen (&quot;AGB&quot;) regeln die Nutzung der nicnoa-Plattform (&quot;Plattform&quot;) zwischen der nicnoa GmbH (&quot;Anbieter&quot;) und den Nutzern der Plattform (&quot;Nutzer&quot;).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§2 Leistungsbeschreibung</h2>
        <p className="mb-4">
          Die Plattform ermöglicht die Vermittlung von Salonarbeitsplätzen zwischen Salonbetreibern (&quot;Vermieter&quot;) und Beautyprofis (&quot;Mieter&quot;). Der Anbieter stellt hierfür die technische Infrastruktur zur Verfügung.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§3 Registrierung und Nutzerkonto</h2>
        <p className="mb-4">
          Die Nutzung der Plattform erfordert eine Registrierung. Der Nutzer verpflichtet sich, wahrheitsgemäße Angaben zu machen und diese aktuell zu halten. Das Nutzerkonto ist nicht übertragbar.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§4 Pflichten der Nutzer</h2>
        <p className="mb-4">
          Nutzer verpflichten sich, die Plattform nicht missbräuchlich zu nutzen und keine rechtswidrigen oder gegen die guten Sitten verstoßenden Inhalte einzustellen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§5 Gebühren und Zahlungen</h2>
        <p className="mb-4">
          Die Nutzung der Plattform ist für Mieter kostenfrei. Vermieter zahlen eine Provision in Höhe von 10% des Mietpreises. Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§6 Datenschutz</h2>
        <p className="mb-4">
          Der Anbieter verarbeitet personenbezogene Daten gemäß der Datenschutzerklärung. Diese ist jederzeit auf der Plattform einsehbar.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§7 Gewährleistung und Haftung</h2>
        <p className="mb-4">
          Der Anbieter gewährleistet eine Verfügbarkeit der Plattform von 99%. Die Haftung des Anbieters ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Dies gilt nicht für die Verletzung von Leben, Körper und Gesundheit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§8 Änderungen der AGB</h2>
        <p className="mb-4">
          Der Anbieter behält sich vor, diese AGB jederzeit zu ändern. Änderungen werden den Nutzern mindestens 4 Wochen vor Inkrafttreten mitgeteilt.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">§9 Schlussbestimmungen</h2>
        <p className="mb-4">
          Es gilt deutsches Recht. Gerichtsstand ist Berlin. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </section>
      </div>
      <Footer />
    </main>
  );
} 