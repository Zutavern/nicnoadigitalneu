import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const articles = [
  {
    title: 'TikTok für Friseure: Der neue Weg zu viraler Reichweite',
    slug: 'tiktok-friseure-virale-reichweite',
    excerpt: 'TikTok ist die am schnellsten wachsende Social-Media-Plattform. So nutzt du sie als Stylist für mehr Kunden.',
    categorySlug: 'marketing',
    authorSlug: 'nicnoa-team',
    tagSlugs: ['social-media', 'kundengewinnung'],
    readingTime: 10,
    featuredImage: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&h=630&fit=crop',
    content: `
<p>TikTok hat die Social-Media-Welt revolutioniert. Mit über einer Milliarde aktiver Nutzer bietet die Plattform enormes Potenzial für Stylisten, die neue Kunden erreichen wollen. Das Beste: Du brauchst keine perfekten Hochglanz-Videos – Authentizität gewinnt.</p>

<h2>Warum TikTok für Friseure funktioniert</h2>

<p>Die Beauty-Nische gehört zu den erfolgreichsten auf TikTok. Transformations-Videos, Styling-Tutorials und Behind-the-Scenes-Content performen hervorragend. Der Algorithmus bevorzugt Engagement – nicht Follower-Zahlen. Das bedeutet: Auch mit null Followern kann dein erstes Video viral gehen.</p>

<h3>Die Vorteile im Überblick</h3>
<ul>
  <li>Organische Reichweite ist noch möglich (im Gegensatz zu Instagram)</li>
  <li>Jüngere Zielgruppe (aber wachsend in allen Altersgruppen)</li>
  <li>Video-Content zeigt deine Arbeit am besten</li>
  <li>Trends bieten einfache Content-Vorlagen</li>
  <li>Lokale Reichweite durch Hashtags</li>
</ul>

<h2>Content-Ideen, die funktionieren</h2>

<h3>1. Transformations-Videos</h3>
<p>Der Klassiker: Vorher-Nachher in 15-60 Sekunden. Nutze beliebte Songs und zeige den dramatischen Unterschied. Timing ist alles – baue Spannung auf.</p>

<h3>2. Haarpflege-Tipps</h3>
<p>Kurze, wertvolle Tipps: "3 Fehler beim Föhnen", "So hält deine Farbe länger". Edukativer Content wird oft gespeichert und geteilt.</p>

<h3>3. Day in the Life</h3>
<p>Zeige deinen Arbeitsalltag. Menschen lieben Einblicke hinter die Kulissen. Das schafft Nähe und Vertrauen.</p>

<h3>4. Trend-Partizipation</h3>
<p>Nutze aktuelle TikTok-Trends und adaptiere sie für deine Nische. Der Algorithmus liebt Trend-Content.</p>

<h3>5. Kundenstimmen</h3>
<p>Kurze Reaktionen von Kunden nach der Behandlung. Authentisch und überzeugend.</p>

<blockquote>
"Die besten TikToks fühlen sich an wie ein Gespräch mit einer Freundin – nicht wie Werbung."
</blockquote>

<h2>Technische Tipps für bessere Videos</h2>

<h3>Beleuchtung</h3>
<p>Gutes Licht ist alles. Nutze das Tageslicht an deinem Arbeitsplatz oder investiere in ein Ringlicht. Meide grelles Deckenlicht.</p>

<h3>Sound</h3>
<p>Verwende Trending-Sounds – sie pushen deine Reichweite. Du findest sie auf der TikTok Discover-Seite.</p>

<h3>Schnitt</h3>
<p>Schnelle Schnitte halten die Aufmerksamkeit. Nutze die TikTok-eigenen Tools oder Apps wie CapCut (vom gleichen Unternehmen).</p>

<h3>Hooks</h3>
<p>Die ersten 1-2 Sekunden entscheiden. Starte mit einem starken Hook: "Du machst diesen Fehler jeden Tag" oder zeige sofort das Endergebnis.</p>

<h2>Hashtag-Strategie</h2>

<p>Nutze eine Mischung aus:</p>
<ul>
  <li>Große Hashtags (#hairtok, #hairstylist) für Reichweite</li>
  <li>Mittlere Hashtags (#balayage, #hairtransformation) für Relevanz</li>
  <li>Lokale Hashtags (#friseurberlin, #hairstylistmünchen) für lokale Kunden</li>
</ul>

<h2>Posting-Zeiten</h2>

<p>Die besten Zeiten variieren, aber generell funktionieren:</p>
<ul>
  <li>Morgens: 7-9 Uhr (Pendler)</li>
  <li>Mittags: 12-14 Uhr (Pause)</li>
  <li>Abends: 19-21 Uhr (Feierabend)</li>
</ul>

<p>Experimentiere und prüfe deine Analytics für deine spezifische Zielgruppe.</p>

<h2>Von Followern zu Kunden</h2>

<h3>Bio optimieren</h3>
<p>Deine Bio sollte enthalten: Was du machst, wo du arbeitest, Link zur Buchung. Ein Call-to-Action schadet nie.</p>

<h3>Link in Bio</h3>
<p>Nutze einen Link-Tree oder deine Buchungsseite. Mache es potenziellen Kunden so einfach wie möglich.</p>

<h3>Kommentare beantworten</h3>
<p>Interaktion ist der Schlüssel. Beantworte Fragen, reagiere auf Kommentare. Das pusht den Algorithmus und baut Beziehungen auf.</p>

<h2>Fazit</h2>

<p>TikTok ist keine Zukunftsmusik mehr – es ist jetzt. Starte einfach, lerne unterwegs und habe Spaß dabei. Die Authentizität, die TikTok belohnt, passt perfekt zum Friseurhandwerk: echte Menschen, echte Transformationen, echte Emotionen.</p>
    `.trim(),
  },
  {
    title: 'Nachhaltigkeit im Salon: Der komplette Leitfaden',
    slug: 'nachhaltigkeit-salon-leitfaden',
    excerpt: 'Umweltbewusstsein wird für Kunden immer wichtiger. So machst du deinen Salon nachhaltig – ohne Kompromisse bei der Qualität.',
    categorySlug: 'trends',
    authorSlug: 'nico-schneider',
    tagSlugs: ['salonmanagement'],
    readingTime: 14,
    featuredImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=630&fit=crop',
    content: `
<p>Nachhaltigkeit ist kein Trend, der wieder verschwindet – sie wird zum Standard. Immer mehr Kunden achten bewusst darauf, wo und wie Dienstleistungen erbracht werden. Ein nachhaltiger Salon ist nicht nur gut für die Umwelt, sondern auch ein starkes Differenzierungsmerkmal.</p>

<h2>Warum Nachhaltigkeit im Salon wichtig ist</h2>

<p>Der Friseurberuf hat einen nicht unerheblichen ökologischen Fußabdruck:</p>

<ul>
  <li>Hoher Wasserverbrauch</li>
  <li>Chemikalien in Färbemitteln und Stylingprodukten</li>
  <li>Einwegmaterialien (Folien, Handschuhe, Handtücher)</li>
  <li>Energieverbrauch (Föhne, Glätteisen, Beleuchtung)</li>
  <li>Verpackungsmüll</li>
</ul>

<p>Die gute Nachricht: In jedem Bereich gibt es Möglichkeiten zur Verbesserung.</p>

<h2>Wasser sparen</h2>

<h3>Wassersparende Duschköpfe</h3>
<p>Moderne Sparduschköpfe reduzieren den Wasserverbrauch um bis zu 50%, ohne dass Kunden einen Unterschied merken. Die Investition amortisiert sich schnell.</p>

<h3>Bewusstes Waschen</h3>
<p>Schulung für das Team: Wasser nicht unnötig laufen lassen, effiziente Waschtechniken anwenden. Kleine Verhaltensänderungen haben große Wirkung.</p>

<h3>Regenwassernutzung</h3>
<p>Für fortgeschrittene Salons: Regenwasser sammeln und für die WC-Spülung oder Reinigung nutzen.</p>

<h2>Energie reduzieren</h2>

<h3>LED-Beleuchtung</h3>
<p>Falls noch nicht geschehen: Umstellung auf LED ist ein No-Brainer. Bis zu 80% Ersparnis bei der Beleuchtung.</p>

<h3>Energieeffiziente Geräte</h3>
<p>Bei Neuanschaffungen auf Energieeffizienz achten. Moderne Föhne trocknen schneller und verbrauchen weniger.</p>

<h3>Standby vermeiden</h3>
<p>Geräte über Nacht komplett ausschalten. Steckdosenleisten mit Schalter machen es einfach.</p>

<h3>Ökostrom</h3>
<p>Der Wechsel zu einem Ökostromanbieter ist einfach und oft nicht teurer als konventioneller Strom.</p>

<blockquote>
"Nachhaltigkeit ist kein Kostenfaktor, sondern eine Investition in die Zukunft."
</blockquote>

<h2>Produkte bewusst wählen</h2>

<h3>Naturkosmetik und Bio-Produkte</h3>
<p>Immer mehr Hersteller bieten professionelle Produkte in Bio-Qualität an. Zertifikate wie NATRUE oder COSMOS geben Orientierung.</p>

<h3>Vegane und tierversuchsfreie Produkte</h3>
<p>Ein wichtiges Kriterium für viele Kunden. Achte auf entsprechende Siegel.</p>

<h3>Konzentrierte Produkte</h3>
<p>Konzentrate, die vor Ort verdünnt werden, sparen Verpackung und Transport.</p>

<h3>Nachfüllsysteme</h3>
<p>Manche Marken bieten Nachfüllstationen an. Gut für die Umwelt und ein Gesprächsthema mit Kunden.</p>

<h2>Müll vermeiden und recyceln</h2>

<h3>Alufolien</h3>
<p>Wiederverwendbare Strähnenpapiere oder Folienalternativen reduzieren Müll erheblich.</p>

<h3>Handschuhe</h3>
<p>Gibt es in bioabbaubaren Varianten. Oder: Nicht für jeden Handgriff Handschuhe wechseln.</p>

<h3>Handtücher</h3>
<p>Stoffhandtücher statt Einweg. Ja, es ist mehr Wäsche – aber deutlich nachhaltiger.</p>

<h3>Haar-Recycling</h3>
<p>Wusstest du, dass Haare Öl absorbieren können? Programme wie "Hair for Our Coast" sammeln Haare für Ölunfälle.</p>

<h2>Nachhaltigkeit kommunizieren</h2>

<p>Tue Gutes und rede darüber! Kunden schätzen Transparenz:</p>

<ul>
  <li>Informiere auf deiner Website über deine Maßnahmen</li>
  <li>Erkläre Kunden, warum du bestimmte Produkte verwendest</li>
  <li>Zertifizierungen (z.B. "Green Salon") können vertrauensbildend sein</li>
  <li>Social Media: Zeige deine nachhaltigen Praktiken</li>
</ul>

<h2>Schritt für Schritt</h2>

<p>Du musst nicht alles auf einmal ändern. Starte mit den einfachsten Maßnahmen:</p>

<ol>
  <li>LED-Beleuchtung (schnelle Amortisation)</li>
  <li>Wassersparende Duschköpfe</li>
  <li>Ökostrom wechseln</li>
  <li>Müll trennen und recyceln</li>
  <li>Schrittweise auf nachhaltige Produkte umstellen</li>
</ol>

<h2>Fazit</h2>

<p>Ein nachhaltiger Salon ist gut für die Umwelt, gut fürs Geschäft und gut fürs Gewissen. Die meisten Maßnahmen sparen langfristig sogar Geld. Fang heute an – deine Kunden und der Planet werden es dir danken.</p>
    `.trim(),
  },
  {
    title: 'Digitale Tools, die deinen Salon-Alltag revolutionieren',
    slug: 'digitale-tools-salon-alltag',
    excerpt: 'Von Terminbuchung bis Kundenverwaltung: Diese digitalen Helfer machen dein Leben als Salonbesitzer einfacher.',
    categorySlug: 'business',
    authorSlug: 'daniel-zutavern',
    tagSlugs: ['digitalisierung', 'salonmanagement'],
    readingTime: 11,
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    content: `
<p>Die Digitalisierung hat auch die Friseurbranche erreicht – und das ist gut so. Moderne Tools können dir Stunden an Arbeit sparen, Fehler reduzieren und das Kundenerlebnis verbessern. Hier ist dein Guide durch den digitalen Dschungel.</p>

<h2>Warum digitale Tools unverzichtbar sind</h2>

<p>Die Erwartungen deiner Kunden haben sich verändert. Sie wollen:</p>

<ul>
  <li>24/7 online buchen können</li>
  <li>Erinnerungen an Termine erhalten</li>
  <li>Kontaktlos bezahlen</li>
  <li>Schnelle Antworten auf Fragen</li>
</ul>

<p>Gleichzeitig hast du weniger Zeit für Verwaltung, weil du am Stuhl arbeiten willst. Digitale Tools lösen dieses Dilemma.</p>

<h2>Terminbuchung und Verwaltung</h2>

<h3>Empfohlene Tools</h3>
<ul>
  <li><strong>Shore:</strong> Speziell für Friseure entwickelt, umfangreiche Funktionen</li>
  <li><strong>Planity:</strong> Moderne Oberfläche, gutes Booking-Widget</li>
  <li><strong>Treatwell:</strong> Zusätzlich Marktplatz für Neukunden</li>
  <li><strong>SimplyBook.me:</strong> Flexibel und preislich attraktiv</li>
</ul>

<h3>Must-Have Features</h3>
<ul>
  <li>Online-Buchung mit Website-Integration</li>
  <li>Automatische Terminerinnerungen (SMS/E-Mail)</li>
  <li>Kalender-Synchronisation</li>
  <li>Kundendatenbank mit Historie</li>
  <li>No-Show-Management</li>
</ul>

<blockquote>
"Seit wir Online-Buchung eingeführt haben, telefonieren wir 70% weniger – und haben trotzdem mehr Termine."
</blockquote>

<h2>Kassensysteme und Bezahlung</h2>

<h3>Moderne POS-Systeme</h3>
<ul>
  <li><strong>SumUp:</strong> Einfach, günstig, mobil</li>
  <li><strong>Zettle (by PayPal):</strong> Gute Integration mit PayPal</li>
  <li><strong>Square:</strong> Umfangreiche Features, etwas teurer</li>
</ul>

<h3>Darauf achten</h3>
<ul>
  <li>Alle Bezahlarten (Karte, kontaktlos, Apple/Google Pay)</li>
  <li>TSE-konform (seit 2020 Pflicht in Deutschland)</li>
  <li>Gute Reporting-Funktionen</li>
  <li>Einfache Benutzerführung</li>
</ul>

<h2>Kundenkommunikation</h2>

<h3>WhatsApp Business</h3>
<p>Viele Kunden bevorzugen WhatsApp. Mit der Business-Version bekommst du:</p>
<ul>
  <li>Professionelles Unternehmensprofil</li>
  <li>Automatische Begrüßungsnachricht</li>
  <li>Schnellantworten für häufige Fragen</li>
  <li>Katalog-Funktion für Dienstleistungen</li>
</ul>

<h3>E-Mail-Marketing</h3>
<p>Für Newsletter und automatisierte E-Mails:</p>
<ul>
  <li><strong>Mailchimp:</strong> Kostenlos bis 500 Kontakte</li>
  <li><strong>Brevo (ehem. Sendinblue):</strong> DSGVO-konform, gute Automatisierung</li>
</ul>

<h2>Social Media Management</h2>

<h3>Planung und Scheduling</h3>
<ul>
  <li><strong>Later:</strong> Speziell für Instagram, visuelle Planung</li>
  <li><strong>Buffer:</strong> Übersichtlich, für mehrere Plattformen</li>
  <li><strong>Canva:</strong> Für die Content-Erstellung (kostenlose Version reicht oft)</li>
</ul>

<h2>Buchhaltung und Finanzen</h2>

<h3>Buchhaltungssoftware</h3>
<ul>
  <li><strong>lexoffice:</strong> Sehr benutzerfreundlich, für Einsteiger ideal</li>
  <li><strong>sevDesk:</strong> Gutes Preis-Leistungs-Verhältnis</li>
  <li><strong>Debitoor:</strong> Schlank und einfach</li>
</ul>

<h3>Wichtige Funktionen</h3>
<ul>
  <li>Rechnungserstellung</li>
  <li>Belegerfassung (am besten per App)</li>
  <li>Umsatzsteuer-Voranmeldung</li>
  <li>DATEV-Export (für den Steuerberater)</li>
</ul>

<h2>Wie du die richtigen Tools auswählst</h2>

<h3>Schritt 1: Bedarf analysieren</h3>
<p>Was sind deine größten Zeitfresser? Wo entstehen die meisten Fehler? Dort ansetzen.</p>

<h3>Schritt 2: Budget festlegen</h3>
<p>Monatliche Kosten summieren sich. Kalkuliere realistisch, welchen Wert die Zeitersparnis hat.</p>

<h3>Schritt 3: Testen</h3>
<p>Die meisten Tools bieten kostenlose Testphasen. Nutze sie ausgiebig, bevor du dich bindest.</p>

<h3>Schritt 4: Schulung</h3>
<p>Das beste Tool bringt nichts, wenn du es nicht nutzt. Investiere Zeit in die Einarbeitung.</p>

<h2>Fazit</h2>

<p>Digitale Tools sind keine Spielerei, sondern echte Helfer. Starte mit den Basics (Terminbuchung, Kasse), und erweitere schrittweise. Die anfängliche Investition in Zeit und Geld zahlt sich schnell aus.</p>
    `.trim(),
  },
  {
    title: 'Farbtrends 2025: Diese Looks werden deinen Salon rocken',
    slug: 'farbtrends-2025-looks',
    excerpt: 'Die heißesten Haarfarben-Trends des Jahres. Inklusive Formeln und Stylingtipps für deine Kunden.',
    categorySlug: 'trends',
    authorSlug: 'nicnoa-team',
    tagSlugs: ['weiterbildung'],
    readingTime: 9,
    featuredImage: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=1200&h=630&fit=crop',
    content: `
<p>2025 wird bunt, aber auch natürlich. Die Farbtrends bewegen sich zwischen mutigen Statements und zurückhaltender Eleganz. Hier erfährst du, welche Looks dieses Jahr gefragt sein werden.</p>

<h2>Trend 1: Expensive Brunette</h2>

<p>Der "Expensive Hair"-Trend setzt sich fort, besonders bei Brünetten. Der Look: Multidimensionale Brauntöne mit subtilen, sonnengeküssten Highlights, die das Haar gesund und gepflegt aussehen lassen.</p>

<h3>Technik</h3>
<ul>
  <li>Face-framing Highlights</li>
  <li>Babylights im Oberkopf</li>
  <li>Warme Karamell- und Honig-Töne</li>
  <li>Glossing für den Shine-Faktor</li>
</ul>

<h3>Für wen?</h3>
<p>Perfekt für Kundinnen, die niedrigen Pflegeaufwand wollen. Der Look wächst natürlich raus.</p>

<h2>Trend 2: Copper und Auburn</h2>

<p>Kupfer bleibt stark, wird aber wärmer und tiefer. Auburn-Töne – ein Mix aus Rot und Braun – sind die Antwort auf "Ich will mal was Neues, aber nicht zu verrückt".</p>

<h3>Variationen</h3>
<ul>
  <li>Deep Copper: Satt und glänzend</li>
  <li>Strawberry Copper: Weicher, mit Erdbeer-Unterton</li>
  <li>Burnt Sienna: Erdig und sophisticated</li>
</ul>

<blockquote>
"Kupfer ist das neue Blond – es schmeichelt fast jedem Hautton."
</blockquote>

<h2>Trend 3: Soft Contrast Blond</h2>

<p>Vorbei sind die Zeiten von hartem Kontrast. 2025 ist Blond weich, cremig und natürlich. Der Root-Smudge ist sanft, die Übergänge fließend.</p>

<h3>Beliebte Töne</h3>
<ul>
  <li>Buttercream Blond</li>
  <li>Champagne Blond</li>
  <li>Sand Blond</li>
</ul>

<h2>Trend 4: Statement Farben (für die Mutigen)</h2>

<p>Nicht für jeden, aber definitiv gefragt: Pastelltöne und lebhafte Farben. Der Unterschied zu früher: Sie sind raffinierter und oft nur als Akzente gesetzt.</p>

<h3>Beliebte Varianten</h3>
<ul>
  <li>Lavender Highlights</li>
  <li>Dusty Rose Underlights</li>
  <li>Electric Blue Peek-a-boos</li>
</ul>

<h2>Trend 5: Natürliche Grautöne</h2>

<p>Graues Haar wird gefeiert, nicht versteckt. Ob komplett natural grey oder gezielte Silver-Strähnen – dieser Trend ist gekommen, um zu bleiben.</p>

<h3>Für wen?</h3>
<p>Mutige Kundinnen jeden Alters, die ihr Grau umarmen wollen – aber mit Stil.</p>

<h2>Pflege-Empfehlungen</h2>

<p>Jeder Farbtrend lebt von gesundem Haar. Empfiehl deinen Kunden:</p>
<ul>
  <li>Color-Safe Shampoos</li>
  <li>Regelmäßige Glossing-Treatments</li>
  <li>Hitzeschutz immer</li>
  <li>Trockenshampoo statt täglicher Wäsche</li>
</ul>

<h2>Fazit</h2>

<p>2025 ist vielseitig – von natürlich bis mutig ist alles dabei. Die gemeinsame Basis: Gesundes, glänzendes Haar. Investiere in Pflegebehandlungen und Beratung. Deine Kunden werden es lieben.</p>
    `.trim(),
  },
  {
    title: 'Die perfekte Preisliste: So gestaltest du sie kundenfreundlich',
    slug: 'perfekte-preisliste-gestalten',
    excerpt: 'Deine Preisliste ist mehr als eine Aufzählung von Preisen. Lerne, wie du sie als Verkaufstool nutzt.',
    categorySlug: 'business',
    authorSlug: 'daniel-zutavern',
    tagSlugs: ['preisgestaltung', 'salonmanagement'],
    readingTime: 8,
    featuredImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop',
    content: `
<p>Die meisten Preislisten sind langweilig, verwirrend oder beides. Dabei ist die Preisliste oft der erste Kontaktpunkt mit potenziellen Kunden. Zeit, das zu ändern.</p>

<h2>Warum die Preisliste so wichtig ist</h2>

<p>Deine Preisliste:</p>
<ul>
  <li>Gibt Kunden Orientierung und Sicherheit</li>
  <li>Positioniert dich im Markt</li>
  <li>Kann zum Upselling einladen</li>
  <li>Spiegelt deine Markenidentität wider</li>
</ul>

<h2>Die häufigsten Fehler</h2>

<h3>1. Zu viele Optionen</h3>
<p>Eine endlose Liste überfordert. Kunden wissen nicht, wo sie anfangen sollen. Weniger ist mehr.</p>

<h3>2. Unklare Bezeichnungen</h3>
<p>"Signature Cut" oder "Premium Styling" – was bedeutet das? Beschreibe, was Kunden bekommen.</p>

<h3>3. Versteckte Kosten</h3>
<p>Nichts ist frustrierender, als am Ende einen höheren Preis zu zahlen. Sei transparent.</p>

<h3>4. Veraltetes Design</h3>
<p>Eine lieblose Preisliste signalisiert: Hier wird auch an der Qualität gespart.</p>

<h2>Die Grundstruktur</h2>

<h3>Kategorien klar trennen</h3>
<ul>
  <li>Schnitte</li>
  <li>Coloration</li>
  <li>Styling</li>
  <li>Treatments</li>
  <li>Pakete/Extras</li>
</ul>

<h3>Beschreibungen hinzufügen</h3>
<p>Kurz und knackig: Was ist enthalten? Was macht diese Leistung besonders?</p>

<h3>Zeitangaben</h3>
<p>Geschätzte Dauer hilft Kunden bei der Planung – und dir bei der Terminvergabe.</p>

<blockquote>
"Eine gute Preisliste verkauft die Transformation, nicht nur den Haarschnitt."
</blockquote>

<h2>Psychologie der Preisgestaltung</h2>

<h3>Ankerpreise</h3>
<p>Zeige das Premium-Angebot zuerst. Alles andere wirkt daneben günstiger.</p>

<h3>Pakete schnüren</h3>
<p>"Schnitt + Pflege + Styling" als Paket zu einem attraktiven Gesamtpreis steigert den Durchschnittsbon.</p>

<h3>Ungerade Preise</h3>
<p>49€ statt 50€? Die Psychologie sagt ja – es wirkt günstiger. Ob das zu deiner Marke passt, entscheidest du.</p>

<h2>Design-Tipps</h2>

<ul>
  <li>Lesbare Schrift (keine Schnörkel bei Preisen)</li>
  <li>Genug Weißraum</li>
  <li>Deine Markenfarben</li>
  <li>Hochwertiges Papier (wenn gedruckt)</li>
  <li>Mobil-optimiert (wenn digital)</li>
</ul>

<h2>Fazit</h2>

<p>Deine Preisliste verdient Aufmerksamkeit. Investiere Zeit in Klarheit, Design und Struktur. Eine gute Preisliste macht das Verkaufen einfacher – für dich und deine Kunden.</p>
    `.trim(),
  },
  {
    title: 'Mitarbeiterführung im Salon: Leadership-Tipps für Salonbesitzer',
    slug: 'mitarbeiterfuehrung-salon-leadership',
    excerpt: 'Gute Mitarbeiter zu finden ist schwer. Sie zu halten noch schwerer. So wirst du zur Führungskraft, für die Menschen arbeiten wollen.',
    categorySlug: 'business',
    authorSlug: 'nico-schneider',
    tagSlugs: ['salonmanagement'],
    readingTime: 13,
    featuredImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=630&fit=crop',
    content: `
<p>Der Fachkräftemangel trifft die Friseurbranche hart. Umso wichtiger ist es, gute Mitarbeiter zu halten. Das gelingt nur mit guter Führung. Dieser Artikel zeigt dir, wie.</p>

<h2>Warum Führung so wichtig ist</h2>

<p>Die Statistik ist eindeutig: Menschen kündigen nicht ihren Job – sie kündigen ihren Chef. Schlechte Führung ist der Hauptgrund für Fluktuation. Gute Führung hingegen:</p>

<ul>
  <li>Bindet Talente</li>
  <li>Steigert die Produktivität</li>
  <li>Verbessert die Atmosphäre</li>
  <li>Reduziert Krankmeldungen</li>
  <li>Macht dein Leben leichter</li>
</ul>

<h2>Grundlagen moderner Führung</h2>

<h3>Vom Boss zum Coach</h3>
<p>Früher: "Mach das so, weil ich es sage." Heute: "Lass uns gemeinsam schauen, wie du dich entwickeln kannst." Moderne Führung ist unterstützend, nicht kontrollierend.</p>

<h3>Vertrauen statt Kontrolle</h3>
<p>Mikromanagement frustriert. Gib deinen Mitarbeitern Verantwortung und vertraue ihnen. Fehler passieren – sie sind Lernchancen.</p>

<h3>Kommunikation ist alles</h3>
<p>Regelmäßige Gespräche, offene Türen, aktives Zuhören. Wer nicht kommuniziert, verliert den Draht zum Team.</p>

<h2>Konkrete Leadership-Tools</h2>

<h3>Regelmäßige Einzelgespräche</h3>
<p>Mindestens einmal im Monat 15-30 Minuten mit jedem Mitarbeiter. Nicht nur über Arbeit, auch über Befinden und Entwicklung.</p>

<h3>Teammeetings</h3>
<p>Wöchentlich kurz (15 Min) für Operatives, monatlich länger für Strategisches. Alle sollen zu Wort kommen.</p>

<h3>Feedback-Kultur</h3>
<p>Feedback geben und annehmen – beides ist wichtig. Regelmäßig, ehrlich, konstruktiv.</p>

<blockquote>
"Behandle deine Mitarbeiter so, wie du möchtest, dass sie deine Kunden behandeln."
</blockquote>

<h2>Motivation und Anerkennung</h2>

<h3>Was wirklich motiviert</h3>
<ul>
  <li>Sinn und Bedeutung in der Arbeit</li>
  <li>Autonomie und Verantwortung</li>
  <li>Persönliche Entwicklung</li>
  <li>Wertschätzung und Anerkennung</li>
  <li>Faire Bezahlung (notwendig, aber nicht hinreichend)</li>
</ul>

<h3>Anerkennung zeigen</h3>
<ul>
  <li>Lob öffentlich, Kritik unter vier Augen</li>
  <li>Konkret loben: "Deine Beratung bei Frau X war super"</li>
  <li>Kleine Aufmerksamkeiten: Geburtstage, Jubiläen</li>
  <li>Erfolge feiern</li>
</ul>

<h2>Entwicklung fördern</h2>

<h3>Weiterbildung ermöglichen</h3>
<p>Seminare, Kurse, Messen – investiere in dein Team. Das zahlt sich aus und zeigt Wertschätzung.</p>

<h3>Karrierepfade aufzeigen</h3>
<p>Nicht jeder will Führungskraft werden, aber alle wollen Perspektiven. Zeige Entwicklungsmöglichkeiten auf.</p>

<h3>Verantwortung übertragen</h3>
<p>Lass Mitarbeiter Projekte übernehmen: Social Media, Einkauf, Azubi-Betreuung. Das fördert und bindet.</p>

<h2>Konflikte lösen</h2>

<h3>Konflikte nicht ignorieren</h3>
<p>Probleme im Team verschwinden nicht von selbst. Je früher du eingreifst, desto besser.</p>

<h3>Neutral bleiben</h3>
<p>Als Führungskraft bist du Mediator, nicht Richter. Höre beide Seiten an.</p>

<h3>Lösungsorientiert vorgehen</h3>
<p>Was können wir ändern? Was braucht jede Partei? Fokus auf die Zukunft, nicht auf Schuldzuweisung.</p>

<h2>Work-Life-Balance vorleben</h2>

<p>Wenn du selbst 60 Stunden arbeitest und nie Urlaub nimmst, sendest du eine Botschaft. Lebe vor, was du von deinem Team erwartest.</p>

<h2>Fazit</h2>

<p>Gute Führung ist keine angeborene Fähigkeit – sie ist erlernbar. Investiere in deine Leadership-Skills, und du wirst mit loyalen, motivierten Mitarbeitern belohnt. Das macht nicht nur den Salon erfolgreicher, sondern auch dein Leben leichter.</p>
    `.trim(),
  },
  {
    title: 'So baust du dir eine treue Instagram-Community auf',
    slug: 'instagram-community-aufbauen',
    excerpt: 'Follower sind gut. Eine echte Community ist besser. Lerne, wie du tiefe Verbindungen auf Instagram schaffst.',
    categorySlug: 'marketing',
    authorSlug: 'nicnoa-team',
    tagSlugs: ['social-media', 'instagram', 'kundengewinnung'],
    readingTime: 12,
    featuredImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&h=630&fit=crop',
    content: `
<p>10.000 Follower sind nutzlos, wenn niemand interagiert. Was du wirklich willst, ist eine Community: Menschen, die deine Posts liken, kommentieren, speichern und – am wichtigsten – zu dir in den Salon kommen. So baust du sie auf.</p>

<h2>Community vs. Follower: Der Unterschied</h2>

<p>Follower sind Zahlen. Eine Community sind Menschen, die:</p>
<ul>
  <li>Regelmäßig mit deinem Content interagieren</li>
  <li>Deine Stories schauen und antworten</li>
  <li>Dich weiterempfehlen</li>
  <li>Zu deinen Kunden werden</li>
  <li>Dir treu bleiben, auch wenn du mal weniger postest</li>
</ul>

<h2>Authentizität als Fundament</h2>

<h3>Zeig dich selbst</h3>
<p>Menschen folgen Menschen, nicht Marken. Zeig dein Gesicht, erzähl von dir, sei nahbar.</p>

<h3>Perfektion ist langweilig</h3>
<p>Perfekt polierte Accounts können entfremden. Echte Momente, auch mal ein Fail – das schafft Verbindung.</p>

<h3>Deine Stimme finden</h3>
<p>Wie redest du im Salon? So solltest du auch schreiben. Sei konsistent in deiner Persönlichkeit.</p>

<h2>Content, der verbindet</h2>

<h3>Behind the Scenes</h3>
<p>Nimm deine Follower mit in deinen Alltag. Der Weg zum Salon, der erste Kaffee, das Team-Meeting.</p>

<h3>Stories erzählen</h3>
<p>Nicht nur "Hier ist ein neuer Cut", sondern "Diese Kundin wollte nach Jahren endlich mal was Neues wagen – und schaut euch ihr Lächeln an!"</p>

<h3>Mehrwert bieten</h3>
<p>Tipps, Tutorials, Produktempfehlungen. Gib deinen Followern einen Grund, dir zu folgen.</p>

<h3>Persönliches teilen</h3>
<p>Du musst nicht alles teilen, aber etwas Privates macht dich menschlich. Hobbys, Familie, Meinungen.</p>

<blockquote>
"Die Leute vergessen, was du sagst. Sie vergessen, was du tust. Aber sie vergessen nie, wie du sie fühlen lässt." – Maya Angelou
</blockquote>

<h2>Engagement aktiv fördern</h2>

<h3>Fragen stellen</h3>
<p>Jeder Post sollte zur Interaktion einladen. "Was ist eure Lieblingsfarbe?" "Kurz oder lang?"</p>

<h3>Auf Kommentare antworten</h3>
<p>Und zwar wirklich antworten, nicht nur ein Emoji. Stell Gegenfragen, führe Gespräche.</p>

<h3>DMs ernst nehmen</h3>
<p>Direktnachrichten sind goldwert. Hier entstehen echte Beziehungen und oft auch Buchungen.</p>

<h3>Story-Interaktion</h3>
<p>Umfragen, Fragen-Sticker, Quiz – alle Features nutzen, die Interaktion ermöglichen.</p>

<h2>Konsistenz ist Key</h2>

<h3>Regelmäßig posten</h3>
<p>Nicht jeden Tag, aber konstant. Dein Publikum soll wissen, wann es von dir hören kann.</p>

<h3>Content vorplanen</h3>
<p>Nutze Planungs-Tools wie Later oder Buffer. So bleibst du auch in stressigen Zeiten aktiv.</p>

<h3>Geduld haben</h3>
<p>Community-Aufbau braucht Zeit. Monate, nicht Wochen. Bleib dran.</p>

<h2>Deine Community offline holen</h2>

<p>Das ultimative Ziel: Follower zu Kunden machen.</p>

<ul>
  <li>Lade zu Events ein (Launch-Partys, Workshops)</li>
  <li>Biete exklusive Angebote für Follower</li>
  <li>Mache den Buchungsprozess einfach (Link in Bio)</li>
  <li>Erinnere daran, dass du echt bist und gebucht werden kannst</li>
</ul>

<h2>Fazit</h2>

<p>Eine echte Instagram-Community ist mehr wert als jede Werbeanzeige. Sie braucht Zeit, Authentizität und echtes Interesse an den Menschen hinter den Accounts. Aber wenn du sie hast, hast du einen Schatz fürs Leben.</p>
    `.trim(),
  },
  {
    title: 'Haarausfall-Beratung: So gehst du sensibel mit dem Thema um',
    slug: 'haarausfall-beratung-sensibel',
    excerpt: 'Haarausfall ist für viele Kunden ein sensibles Thema. Lerne, wie du einfühlsam berätst und unterstützt.',
    categorySlug: 'salon-tipps',
    authorSlug: 'daniel-zutavern',
    tagSlugs: ['kundengewinnung', 'weiterbildung'],
    readingTime: 10,
    featuredImage: 'https://images.unsplash.com/photo-1522338242042-2d1c6c14cd0c?w=1200&h=630&fit=crop',
    content: `
<p>Für Menschen mit Haarausfall ist der Gang zum Friseur oft mit Angst und Scham verbunden. Als Stylist*in kannst du einen enormen Unterschied machen – nicht nur mit deiner Technik, sondern auch mit deiner Empathie.</p>

<h2>Warum dieses Thema so wichtig ist</h2>

<p>Haarausfall betrifft nicht nur ältere Männer. Er kann jeden treffen:</p>
<ul>
  <li>Hormonelle Veränderungen (Schwangerschaft, Wechseljahre)</li>
  <li>Stress und Ernährung</li>
  <li>Medikamente und Behandlungen (z.B. Chemotherapie)</li>
  <li>Genetische Veranlagung</li>
  <li>Autoimmunerkrankungen (Alopecia areata)</li>
</ul>

<p>Für Betroffene ist der Haarverlust oft eng mit ihrem Selbstbild verbunden. Deine Rolle: Unterstützen, nicht urteilen.</p>

<h2>Das erste Gespräch</h2>

<h3>Aktiv ansprechen oder abwarten?</h3>
<p>Folge dem Kunden. Wenn er/sie das Thema anspricht, höre zu. Wenn nicht, dränge nicht – aber signalisiere, dass du offen für das Gespräch bist.</p>

<h3>Die richtigen Worte finden</h3>
<ul>
  <li>Nicht: "Sie haben ja ganz schön dünnes Haar."</li>
  <li>Besser: "Gibt es etwas Bestimmtes, worauf Sie achten möchten?"</li>
</ul>

<h3>Zuhören</h3>
<p>Manchmal brauchen Menschen einfach jemanden, der zuhört. Du musst nicht sofort Lösungen anbieten.</p>

<blockquote>
"Die größte Kraft eines Stylisten ist nicht die Schere, sondern das Ohr."
</blockquote>

<h2>Technische Möglichkeiten</h2>

<h3>Schnitte, die kaschieren</h3>
<ul>
  <li>Stufenschnitte für mehr Volumen</li>
  <li>Kürzere Längen bei diffusem Haarausfall</li>
  <li>Pony bei Geheimratsecken</li>
</ul>

<h3>Farbe und Textur</h3>
<ul>
  <li>Highlights können Volumen simulieren</li>
  <li>Kopfhautfarben (Scalp Camouflage) bei stark lichten Stellen</li>
  <li>Texturisierende Produkte für mehr Fülle</li>
</ul>

<h3>Haarteile und Extensions</h3>
<p>Für manche Kunden die richtige Lösung. Biete Beratung an oder vermittle an Spezialisten.</p>

<h2>Produkte und Pflege</h2>

<h3>Was du empfehlen kannst</h3>
<ul>
  <li>Schonende, sulfatfreie Shampoos</li>
  <li>Volumengebende Produkte</li>
  <li>Kopfhaut-Seren mit Wirkstoffen wie Koffein, Biotin</li>
</ul>

<h3>Was du nicht empfehlen solltest</h3>
<ul>
  <li>Wundermittel versprechen ("Das lässt alles nachwachsen")</li>
  <li>Medizinische Ratschläge geben</li>
</ul>

<p>Verweise bei medizinischen Fragen immer an Dermatologen.</p>

<h2>Psychologische Unterstützung</h2>

<h3>Selbstwertgefühl stärken</h3>
<p>Betone, was schön ist. Fokussiere auf das, was du tun kannst, nicht auf das Problem.</p>

<h3>Normalisieren</h3>
<p>Haarausfall ist weit verbreitet. Manchmal hilft es zu wissen, dass man nicht allein ist.</p>

<h3>Ressourcen kennen</h3>
<p>Informiere dich über lokale Selbsthilfegruppen oder Online-Communities, die du empfehlen kannst.</p>

<h2>Spezialfall Chemotherapie</h2>

<p>Krebspatienten verlieren oft ihr gesamtes Haar. Hier ist besondere Sensibilität gefragt:</p>

<ul>
  <li>Private Termine anbieten, wenn gewünscht</li>
  <li>Über Perücken und Tücher informieren</li>
  <li>Den Prozess begleiten (vor, während, nach der Therapie)</li>
  <li>Neuwuchs feiern</li>
</ul>

<h2>Fazit</h2>

<p>Als Stylist*in bist du mehr als ein Handwerker – du bist Vertrauensperson. Gerade bei sensiblen Themen wie Haarausfall kannst du einen enormen Unterschied im Leben deiner Kunden machen. Mit Empathie, Fachwissen und Respekt.</p>
    `.trim(),
  },
  {
    title: 'Bewertungsmanagement: So bekommst du mehr 5-Sterne-Reviews',
    slug: 'bewertungsmanagement-5-sterne-reviews',
    excerpt: 'Online-Bewertungen entscheiden über Erfolg oder Misserfolg. Lerne, wie du aktiv positive Bewertungen sammelst.',
    categorySlug: 'marketing',
    authorSlug: 'nico-schneider',
    tagSlugs: ['kundengewinnung', 'digitalisierung'],
    readingTime: 9,
    featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop',
    content: `
<p>Bevor jemand einen Termin bucht, liest er Bewertungen. Google, Treatwell, Facebook – überall schauen potenzielle Kunden, was andere erlebt haben. Positive Bewertungen sind Gold wert. Hier erfährst du, wie du sie bekommst.</p>

<h2>Warum Bewertungen so wichtig sind</h2>

<ul>
  <li>88% der Konsumenten vertrauen Online-Bewertungen wie persönlichen Empfehlungen</li>
  <li>Bessere Bewertungen = höheres Google-Ranking</li>
  <li>Mehr Bewertungen = mehr Vertrauen</li>
  <li>Negative Bewertungen können abschrecken – oder eine Chance sein</li>
</ul>

<h2>Aktiv um Bewertungen bitten</h2>

<h3>Der richtige Moment</h3>
<p>Frage, wenn die Kundin glücklich ist – direkt nach dem "Wow, das ist toll!"-Moment. Nicht erst Wochen später.</p>

<h3>Wie fragen?</h3>
<ul>
  <li>Persönlich: "Es freut mich, dass du happy bist! Wenn du magst, würde mir eine Google-Bewertung sehr helfen."</li>
  <li>Per Karte: Kleine Kärtchen mit QR-Code zur Bewertungsseite</li>
  <li>Per Follow-up: Automatische E-Mail/SMS nach dem Termin</li>
</ul>

<blockquote>
"Die meisten zufriedenen Kunden schreiben keine Bewertung – nicht weil sie nicht wollen, sondern weil sie nicht daran denken."
</blockquote>

<h2>Es einfach machen</h2>

<h3>Direct Links</h3>
<p>Je weniger Klicks, desto besser. Erstelle einen direkten Link zu deinem Google-Bewertungsformular.</p>

<h3>QR-Codes</h3>
<p>Platziere sie an der Rezeption, im Spiegel, auf Visitenkarten. Ein Scan, fertig.</p>

<h3>Anleitung geben</h3>
<p>Nicht jeder weiß, wie Google-Bewertungen funktionieren. Eine kurze Erklärung hilft.</p>

<h2>Negative Bewertungen managen</h2>

<h3>Nicht ignorieren</h3>
<p>Eine unbeantwortete negative Bewertung wirkt schlimmer als die Kritik selbst.</p>

<h3>Professionell antworten</h3>
<ul>
  <li>Bedanke dich für das Feedback</li>
  <li>Entschuldige dich für die Unannehmlichkeit</li>
  <li>Biete eine Lösung an</li>
  <li>Nimm das Gespräch offline ("Bitte kontaktiere uns direkt...")</li>
</ul>

<h3>Lernen</h3>
<p>Manchmal haben kritische Bewertungen recht. Nutze sie, um besser zu werden.</p>

<h2>Fake-Bewertungen: Finger weg!</h2>

<p>Gekaufte oder selbst geschriebene Bewertungen sind:</p>
<ul>
  <li>Illegal (unlauterer Wettbewerb)</li>
  <li>Erkennbar (Plattformen werden smarter)</li>
  <li>Rufschädigend, wenn sie auffliegen</li>
</ul>

<h2>Bewertungen nutzen</h2>

<h3>Auf der Website</h3>
<p>Zeige deine besten Bewertungen auf der Website. Testimonials wirken.</p>

<h3>In Social Media</h3>
<p>Teile Screenshots von Bewertungen (mit Erlaubnis) als Social Proof.</p>

<h3>Im Salon</h3>
<p>Ein Bildschirm mit rotierenden Bewertungen? Warum nicht.</p>

<h2>Die Magie der 5-Sterne-Erfahrung</h2>

<p>Am Ende ist die beste Strategie: Arbeit abliefern, die 5 Sterne verdient. Wenn jeder Kunde begeistert geht, kommen die Bewertungen von selbst.</p>

<h2>Fazit</h2>

<p>Bewertungsmanagement ist keine einmalige Aktion, sondern ein kontinuierlicher Prozess. Bitte aktiv um Feedback, mache es einfach, reagiere auf Kritik professionell – und liefere vor allem Arbeit, die begeistert.</p>
    `.trim(),
  },
  {
    title: 'Perfekte Fotos für Instagram: Ein Guide für Stylisten',
    slug: 'perfekte-fotos-instagram-stylisten',
    excerpt: 'Deine Arbeit ist großartig – aber deine Fotos zeigen es nicht? Lerne, wie du mit dem Smartphone professionelle Ergebnisse erzielst.',
    categorySlug: 'marketing',
    authorSlug: 'nicnoa-team',
    tagSlugs: ['instagram', 'social-media'],
    readingTime: 11,
    featuredImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=630&fit=crop',
    content: `
<p>Du hast gerade die beste Balayage deines Lebens gemacht – und dann zeigt das Foto... nichts davon. Frustrierend, oder? Gute Haare fotografieren ist eine Kunst. Hier lernst du sie.</p>

<h2>Warum Fotos so wichtig sind</h2>

<p>Instagram ist visuell. Dein Können zeigt sich in deinen Bildern. Ein schlechtes Foto eines tollen Schnitts ist verlorene Werbung. Ein gutes Foto hingegen:</p>
<ul>
  <li>Zeigt dein Können</li>
  <li>Zieht neue Follower an</li>
  <li>Überzeugt potenzielle Kunden</li>
  <li>Macht dich stolz</li>
</ul>

<h2>Equipment: Du brauchst weniger als du denkst</h2>

<h3>Smartphone</h3>
<p>Ein aktuelles iPhone oder Android-Flaggschiff reicht völlig. Du brauchst keine DSLR.</p>

<h3>Licht</h3>
<p>Das wichtigste überhaupt. Ein Ringlicht (ca. 50-100€) oder gutes Tageslicht machen den Unterschied.</p>

<h3>Hintergrund</h3>
<p>Ein neutraler, aufgeräumter Hintergrund. Idealerweise eine leere Wand oder ein mobiler Hintergrund.</p>

<h2>Lichtsetzung für Haare</h2>

<h3>Weiches, diffuses Licht</h3>
<p>Direktes Sonnenlicht oder harte Studiolampen erzeugen hässliche Schatten. Weiches Licht lässt Haare glänzen und schimmern.</p>

<h3>Lichtrichtung</h3>
<p>Von vorne-oben ist meist am schmeichelhaftesten. Seitenlicht kann Textur betonen, aber auch Probleme zeigen.</p>

<h3>Ringlichter</h3>
<p>Perfekt für Gesicht und Haare. Sie erzeugen den beliebten "Ring-Reflex" in den Augen und gleichmäßiges Licht.</p>

<blockquote>
"Das beste Foto entsteht, wenn das Haar UND die Kundin glänzen."
</blockquote>

<h2>Komposition und Perspektive</h2>

<h3>Vorher-Nachher</h3>
<p>Der Klassiker. Gleiche Position, gleiche Beleuchtung, gleicher Ausschnitt. Nur die Haare anders.</p>

<h3>Ausschnitte</h3>
<p>Nicht immer das ganze Gesicht zeigen. Hinterkopf, Seitenansicht, Details der Farbe – Variation ist gut.</p>

<h3>Regel der Drittel</h3>
<p>Teile das Bild gedanklich in 3x3 Felder. Platziere wichtige Elemente auf den Linien oder Schnittpunkten.</p>

<h3>Bewegung</h3>
<p>Ein leichtes Drehen des Kopfes, fliegende Haare – Bewegung macht Fotos lebendig.</p>

<h2>Smartphone-Kamera richtig nutzen</h2>

<h3>Portrait-Modus</h3>
<p>Erzeugt einen unscharfen Hintergrund, der die Haare in den Fokus rückt.</p>

<h3>Belichtung anpassen</h3>
<p>Tippe auf die Haare und ziehe den Regler hoch/runter. Zu dunkel ist schlimmer als zu hell.</p>

<h3>Zoom vermeiden</h3>
<p>Digitaler Zoom zerstört die Qualität. Geh lieber näher ran.</p>

<h3>Linse reinigen</h3>
<p>Klingt banal, aber eine Fingerabdruck-verschmierte Linse ruiniert jedes Foto.</p>

<h2>Bearbeitung</h2>

<h3>Empfohlene Apps</h3>
<ul>
  <li><strong>Lightroom Mobile:</strong> Professionell, kostenlose Version ausreichend</li>
  <li><strong>VSCO:</strong> Schöne Filter, einfache Bedienung</li>
  <li><strong>Snapseed:</strong> Mächtig und kostenlos</li>
</ul>

<h3>Was bearbeiten?</h3>
<ul>
  <li>Belichtung/Helligkeit</li>
  <li>Kontrast</li>
  <li>Sättigung (dezent!)</li>
  <li>Klarheit für mehr Textur</li>
  <li>Zuschnitt</li>
</ul>

<h3>Was nicht bearbeiten</h3>
<ul>
  <li>Haarfarbe komplett ändern (irreführend)</li>
  <li>Gesicht verzerren (Filter, die das Gesicht verändern)</li>
  <li>Zu viel glätten (sieht künstlich aus)</li>
</ul>

<h2>Praktische Tipps</h2>

<h3>Routine entwickeln</h3>
<p>Mache von jeder guten Arbeit Fotos. Es dauert 2 Minuten und lohnt sich.</p>

<h3>Erlaubnis einholen</h3>
<p>Frage immer, bevor du Fotos veröffentlichst. Manche Kunden wollen nicht auf Instagram.</p>

<h3>Geduld haben</h3>
<p>Die ersten Fotos werden nicht perfekt sein. Übung macht den Meister.</p>

<h2>Fazit</h2>

<p>Mit ein bisschen Wissen und Übung kannst du deine Arbeit endlich so zeigen, wie sie verdient. Gutes Licht, ein aufgeräumter Hintergrund und ein paar Grundregeln der Komposition – mehr braucht es nicht.</p>
    `.trim(),
  },
];

async function main() {
  console.log('🌱 Seeding more blog articles (Part 2)...')

  const authors = await prisma.blogAuthor.findMany()
  const categories = await prisma.blogCategory.findMany()
  const tags = await prisma.blogTag.findMany()

  for (const articleData of articles) {
    const author = authors.find((a) => a.slug === articleData.authorSlug)
    const category = categories.find((c) => c.slug === articleData.categorySlug)

    if (!author || !category) {
      console.log(`⚠️ Skipping "${articleData.title}" - missing author or category`)
      continue
    }

    const post = await prisma.blogPost.upsert({
      where: { slug: articleData.slug },
      update: { title: articleData.title, excerpt: articleData.excerpt, content: articleData.content, featuredImage: articleData.featuredImage, readingTime: articleData.readingTime },
      create: {
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        featuredImage: articleData.featuredImage,
        readingTime: articleData.readingTime,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        authorId: author.id,
        categoryId: category.id,
        metaTitle: articleData.title,
        metaDescription: articleData.excerpt,
      },
    })

    const postTags = tags.filter((t) => articleData.tagSlugs.includes(t.slug))
    for (const tag of postTags) {
      await prisma.blogPostTag.upsert({
        where: { postId_tagId: { postId: post.id, tagId: tag.id } },
        update: {},
        create: { postId: post.id, tagId: tag.id },
      })
    }

    console.log(`✅ Created: ${post.title}`)
  }

  console.log('🎉 Done!')
}

main()
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

