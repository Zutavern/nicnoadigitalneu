import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use DIRECT_DATABASE_URL for direct TCP connection
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedLegalPages() {
  console.log('🏛️ Seeding Legal Pages...')

  // ========================
  // IMPRESSUM
  // ========================
  console.log('  Creating Impressum config...')
  await prisma.legalPageConfig.upsert({
    where: { pageType: 'IMPRESSUM' },
    create: {
      pageType: 'IMPRESSUM',
      heroBadgeText: 'Rechtliches',
      heroTitle: 'Impressum',
      heroDescription: 'Angaben gemäß § 5 TMG',
      metaTitle: 'Impressum | NICNOA',
      metaDescription: 'Impressum und rechtliche Informationen von NICNOA',
      contactEmail: 'info@nicnoa.de',
      contactPhone: '+49 (0) 123 456789',
      lastUpdated: new Date(),
    },
    update: {
      heroTitle: 'Impressum',
      heroDescription: 'Angaben gemäß § 5 TMG',
    },
  })

  // Delete existing sections first to avoid duplicates
  await prisma.legalSection.deleteMany({
    where: { pageType: 'IMPRESSUM' },
  })

  const impressumSections = [
    {
      pageType: 'IMPRESSUM' as const,
      title: 'Angaben gemäß § 5 TMG',
      content: `NICNOA&CO.online
Musterstraße 123
12345 Berlin
Deutschland

**Kontakt**
Telefon: +49 (0) 123 456789
E-Mail: info@nicnoa.de

**Vertreten durch**
Geschäftsführer: Max Mustermann`,
      sortOrder: 0,
      isActive: true,
      isCollapsible: false,
    },
    {
      pageType: 'IMPRESSUM' as const,
      title: 'Registereintrag',
      content: `Eintragung im Handelsregister.
Registergericht: Amtsgericht Berlin
Registernummer: HRB 123456

**Umsatzsteuer-ID**
Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:
DE 123 456 789`,
      sortOrder: 1,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'IMPRESSUM' as const,
      title: 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV',
      content: `Max Mustermann
NICNOA&CO.online
Musterstraße 123
12345 Berlin`,
      sortOrder: 2,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'IMPRESSUM' as const,
      title: 'Streitschlichtung',
      content: `Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: [https://ec.europa.eu/consumers/odr/](https://ec.europa.eu/consumers/odr/)

Unsere E-Mail-Adresse finden Sie oben im Impressum.

Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
      sortOrder: 3,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'IMPRESSUM' as const,
      title: 'Haftung für Inhalte',
      content: `Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.`,
      sortOrder: 4,
      isActive: true,
      isCollapsible: true,
    },
  ]

  await prisma.legalSection.createMany({
    data: impressumSections,
  })
  console.log(`    ✓ Created ${impressumSections.length} Impressum sections`)

  // ========================
  // DATENSCHUTZ
  // ========================
  console.log('  Creating Datenschutz config...')
  await prisma.legalPageConfig.upsert({
    where: { pageType: 'DATENSCHUTZ' },
    create: {
      pageType: 'DATENSCHUTZ',
      heroBadgeText: 'Rechtliches',
      heroTitle: 'Datenschutzerklärung',
      heroDescription: 'Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003).',
      metaTitle: 'Datenschutz | NICNOA',
      metaDescription: 'Datenschutzerklärung für die Nutzung der NICNOA Plattform',
      contactEmail: 'datenschutz@nicnoa.de',
      contactPhone: '+49 (0) 123 456789',
      lastUpdated: new Date(),
    },
    update: {
      heroTitle: 'Datenschutzerklärung',
      heroDescription: 'Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003).',
    },
  })

  await prisma.legalSection.deleteMany({
    where: { pageType: 'DATENSCHUTZ' },
  })

  const datenschutzSections = [
    {
      pageType: 'DATENSCHUTZ' as const,
      title: '1. Verantwortlicher',
      content: `NICNOA&CO.online
Musterstraße 123
12345 Berlin
Deutschland
E-Mail: info@nicnoa.de`,
      sortOrder: 0,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'DATENSCHUTZ' as const,
      title: '2. Erhebung und Verarbeitung von Daten',
      content: `Bei der Nutzung unserer Plattform werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Diese Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.`,
      sortOrder: 1,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'DATENSCHUTZ' as const,
      title: '3. Ihre Rechte',
      content: `Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten.

• Recht auf Auskunft
• Recht auf Berichtigung
• Recht auf Löschung
• Recht auf Einschränkung der Verarbeitung
• Recht auf Datenübertragbarkeit
• Widerspruchsrecht`,
      sortOrder: 2,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'DATENSCHUTZ' as const,
      title: '4. Datensicherheit',
      content: `Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird. Ob eine einzelne Seite unseres Internetauftrittes verschlüsselt übertragen wird, erkennen Sie an der geschlossenen Darstellung des Schüssel- beziehungsweise Schloss-Symbols in der unteren Statusleiste Ihres Browsers.`,
      sortOrder: 3,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'DATENSCHUTZ' as const,
      title: '5. Cookies',
      content: `Unsere Website verwendet Cookies. Das sind kleine Textdateien, die es möglich machen, auf dem Endgerät des Nutzers spezifische, auf den Nutzer bezogene Informationen zu speichern, während er die Website nutzt. Cookies ermöglichen es, insbesondere Nutzungshäufigkeit und Nutzeranzahl der Seiten zu ermitteln, Verhaltensweisen der Seitennutzung zu analysieren, aber auch unser Angebot kundenfreundlicher zu gestalten.`,
      sortOrder: 4,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'DATENSCHUTZ' as const,
      title: '6. Analytische Tools',
      content: `Zur Verbesserung unseres Angebots und der Benutzerfreundlichkeit verwenden wir Analysedienste. Diese helfen uns zu verstehen, wie Besucher mit unserer Website interagieren. Alle gesammelten Daten werden anonymisiert verarbeitet.`,
      sortOrder: 5,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'DATENSCHUTZ' as const,
      title: '7. Kontaktformular',
      content: `Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.`,
      sortOrder: 6,
      isActive: true,
      isCollapsible: true,
    },
  ]

  await prisma.legalSection.createMany({
    data: datenschutzSections,
  })
  console.log(`    ✓ Created ${datenschutzSections.length} Datenschutz sections`)

  // ========================
  // AGB
  // ========================
  console.log('  Creating AGB config...')
  await prisma.legalPageConfig.upsert({
    where: { pageType: 'AGB' },
    create: {
      pageType: 'AGB',
      heroBadgeText: 'Rechtliches',
      heroTitle: 'Allgemeine Geschäftsbedingungen',
      heroDescription: 'Diese AGB regeln die Nutzung der NICNOA-Plattform.',
      metaTitle: 'AGB | NICNOA',
      metaDescription: 'Allgemeine Geschäftsbedingungen für die Nutzung der NICNOA Plattform',
      contactEmail: null,
      contactPhone: null,
      lastUpdated: new Date(),
    },
    update: {
      heroTitle: 'Allgemeine Geschäftsbedingungen',
      heroDescription: 'Diese AGB regeln die Nutzung der NICNOA-Plattform.',
    },
  })

  await prisma.legalSection.deleteMany({
    where: { pageType: 'AGB' },
  })

  const agbSections = [
    {
      pageType: 'AGB' as const,
      title: '§1 Geltungsbereich',
      content: `Diese Allgemeinen Geschäftsbedingungen ("AGB") regeln die Nutzung der nicnoa-Plattform ("Plattform") zwischen der nicnoa GmbH ("Anbieter") und den Nutzern der Plattform ("Nutzer").`,
      sortOrder: 0,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'AGB' as const,
      title: '§2 Leistungsbeschreibung',
      content: `Die Plattform ermöglicht die Vermittlung von Salonarbeitsplätzen zwischen Salonbetreibern ("Vermieter") und Beautyprofis ("Mieter"). Der Anbieter stellt hierfür die technische Infrastruktur zur Verfügung.`,
      sortOrder: 1,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'AGB' as const,
      title: '§3 Registrierung und Nutzerkonto',
      content: `Die Nutzung der Plattform erfordert eine Registrierung. Der Nutzer verpflichtet sich, wahrheitsgemäße Angaben zu machen und diese aktuell zu halten. Das Nutzerkonto ist nicht übertragbar.`,
      sortOrder: 2,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'AGB' as const,
      title: '§4 Pflichten der Nutzer',
      content: `Nutzer verpflichten sich, die Plattform nicht missbräuchlich zu nutzen und keine rechtswidrigen oder gegen die guten Sitten verstoßenden Inhalte einzustellen.`,
      sortOrder: 3,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'AGB' as const,
      title: '§5 Gebühren und Zahlungen',
      content: `Die Nutzung der Plattform ist für Mieter kostenfrei. Vermieter zahlen eine Provision in Höhe von 10% des Mietpreises. Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer.`,
      sortOrder: 4,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'AGB' as const,
      title: '§6 Datenschutz',
      content: `Der Anbieter verarbeitet personenbezogene Daten gemäß der Datenschutzerklärung. Diese ist jederzeit auf der Plattform einsehbar.`,
      sortOrder: 5,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'AGB' as const,
      title: '§7 Gewährleistung und Haftung',
      content: `Der Anbieter gewährleistet eine Verfügbarkeit der Plattform von 99%. Die Haftung des Anbieters ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Dies gilt nicht für die Verletzung von Leben, Körper und Gesundheit.`,
      sortOrder: 6,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'AGB' as const,
      title: '§8 Änderungen der AGB',
      content: `Der Anbieter behält sich vor, diese AGB jederzeit zu ändern. Änderungen werden den Nutzern mindestens 4 Wochen vor Inkrafttreten mitgeteilt.`,
      sortOrder: 7,
      isActive: true,
      isCollapsible: true,
    },
    {
      pageType: 'AGB' as const,
      title: '§9 Schlussbestimmungen',
      content: `Es gilt deutsches Recht. Gerichtsstand ist Berlin. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.`,
      sortOrder: 8,
      isActive: true,
      isCollapsible: true,
    },
  ]

  await prisma.legalSection.createMany({
    data: agbSections,
  })
  console.log(`    ✓ Created ${agbSections.length} AGB sections`)

  console.log('✅ Legal Pages seeding complete!')
}

// Main execution
seedLegalPages()
  .catch((e) => {
    console.error('Error seeding legal pages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
