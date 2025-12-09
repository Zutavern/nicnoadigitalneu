import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Umfangreiche Artikel mit viel Content
const articles = [
  {
    title: 'Der ultimative Guide zur Salongestaltung: So schaffst du eine Wohlfühlatmosphäre',
    slug: 'ultimativer-guide-salongestaltung',
    excerpt: 'Die richtige Salongestaltung ist entscheidend für den Erfolg deines Salons. Lerne, wie du eine einladende Atmosphäre schaffst, die Kunden begeistert.',
    categorySlug: 'salon-tipps',
    authorSlug: 'daniel-zutavern',
    tagSlugs: ['salonmanagement'],
    readingTime: 12,
    featuredImage: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&h=630&fit=crop',
    content: `
<p>Die Gestaltung deines Salons ist mehr als nur Dekoration – sie ist ein wesentlicher Teil deiner Markenidentität und beeinflusst maßgeblich, wie sich Kunden bei dir fühlen. In diesem umfassenden Guide zeigen wir dir, wie du einen Salon gestaltest, der nicht nur schön aussieht, sondern auch funktional ist und deine Kunden immer wieder zurückkommen lässt.</p>

<h2>Warum die Salongestaltung so wichtig ist</h2>

<p>Studien zeigen, dass Kunden innerhalb der ersten sieben Sekunden einen Eindruck von einem Geschäft bilden. Dieser erste Eindruck basiert fast ausschließlich auf der visuellen Wahrnehmung. Ein gut gestalteter Salon kann:</p>

<ul>
  <li>Die Verweildauer der Kunden erhöhen</li>
  <li>Die Zahlungsbereitschaft steigern</li>
  <li>Weiterempfehlungen fördern</li>
  <li>Die Mitarbeiterzufriedenheit verbessern</li>
  <li>Deine Markenidentität stärken</li>
</ul>

<h2>Die Grundlagen: Farben und ihre Wirkung</h2>

<p>Farben haben einen enormen Einfluss auf unsere Stimmung und unser Wohlbefinden. Bei der Wahl deiner Farbpalette solltest du folgende psychologische Effekte berücksichtigen:</p>

<h3>Warme Farbtöne</h3>
<p>Warme Farben wie Beige, Creme und sanfte Erdtöne schaffen eine einladende, gemütliche Atmosphäre. Sie eignen sich besonders für Salons, die Entspannung und Wohlbefinden in den Vordergrund stellen.</p>

<h3>Kühle Farbtöne</h3>
<p>Blau und Grün wirken beruhigend und professionell. Sie sind ideal für moderne Salons, die einen clean Look anstreben. Achte jedoch darauf, nicht zu kalt zu wirken – kombiniere sie mit warmen Akzenten.</p>

<h3>Akzentfarben</h3>
<p>Setze gezielt Akzente mit kräftigen Farben. Gold, Kupfer oder ein sattes Grün können bestimmte Bereiche hervorheben und für visuelle Spannung sorgen.</p>

<h2>Beleuchtung: Das A und O</h2>

<p>Die richtige Beleuchtung ist im Salon absolut entscheidend – sowohl für deine Arbeit als auch für das Wohlbefinden deiner Kunden.</p>

<h3>Arbeitslicht</h3>
<p>An den Arbeitsplätzen brauchst du helles, neutrales Licht (5000-6000 Kelvin), das Farben naturgetreu wiedergibt. LED-Panels oder Tageslichtlampen sind hier die beste Wahl. Achte darauf, dass das Licht schattenfrei ist.</p>

<h3>Ambientebeleuchtung</h3>
<p>Im Wartebereich und den Entspannungszonen darf das Licht wärmer und gedimmter sein (2700-3000 Kelvin). Indirekte Beleuchtung schafft eine angenehme Atmosphäre.</p>

<h3>Akzentbeleuchtung</h3>
<p>Nutze Spots oder LED-Streifen, um bestimmte Bereiche wie Produktregale oder Kunstwerke in Szene zu setzen.</p>

<blockquote>
"Die perfekte Beleuchtung ist die, die man nicht bewusst wahrnimmt – aber sofort vermisst, wenn sie fehlt."
</blockquote>

<h2>Möbel und Ausstattung</h2>

<p>Bei der Wahl deiner Möbel musst du Ästhetik und Funktionalität in Einklang bringen.</p>

<h3>Frisierstühle</h3>
<p>Investiere in hochwertige Frisierstühle. Sie sind das Herzstück deines Salons und werden täglich stundenlang benutzt. Achte auf Ergonomie für dich und Komfort für deine Kunden.</p>

<h3>Waschplätze</h3>
<p>Ein bequemer Waschplatz mit verstellbarer Kopfstütze ist für das Kundenerlebnis essentiell. Viele Kunden nennen die Haarwäsche als Highlight ihres Salonbesuchs.</p>

<h3>Wartebereiche</h3>
<p>Bequeme Sitzgelegenheiten, aktuelle Magazine, WLAN und vielleicht ein Getränkeangebot machen das Warten angenehm.</p>

<h2>Der Empfangsbereich: Der erste Eindruck zählt</h2>

<p>Der Empfangsbereich ist das Erste, was Kunden sehen. Er sollte einladend, professionell und markenkonform gestaltet sein.</p>

<ul>
  <li>Ein aufgeräumter, gut organisierter Empfangstresen</li>
  <li>Klare Wegführung in den Salon</li>
  <li>Produkte schön präsentiert, aber nicht aufdringlich</li>
  <li>Frische Blumen oder Pflanzen für Lebendigkeit</li>
</ul>

<h2>Akustik nicht vergessen</h2>

<p>Ein oft unterschätzter Aspekt ist die Akustik. Zu viel Hall macht Gespräche anstrengend und lässt den Salon ungemütlich wirken. Teppiche, Vorhänge, Polstermöbel und akustische Deckenplatten können hier Abhilfe schaffen.</p>

<h2>Fazit: Dein Salon als Erlebnis</h2>

<p>Die perfekte Salongestaltung ist eine Investition, die sich mehrfach auszahlt. Nimm dir Zeit für die Planung, hole dir bei Bedarf professionelle Beratung und denke immer daran: Dein Salon ist deine Bühne. Gestalte sie so, dass du und deine Kunden sich jeden Tag aufs Neue wohlfühlen.</p>
    `.trim(),
  },
  {
    title: 'Kundenbindung im Salon: 15 Strategien, die wirklich funktionieren',
    slug: 'kundenbindung-salon-strategien',
    excerpt: 'Stammkunden sind das Fundament eines erfolgreichen Salons. Entdecke 15 bewährte Strategien zur nachhaltigen Kundenbindung.',
    categorySlug: 'business',
    authorSlug: 'nico-schneider',
    tagSlugs: ['kundengewinnung', 'salonmanagement'],
    readingTime: 14,
    featuredImage: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&h=630&fit=crop',
    content: `
<p>Es kostet fünfmal mehr, einen neuen Kunden zu gewinnen, als einen bestehenden zu halten. Trotzdem fokussieren sich viele Salons vor allem auf Neukundengewinnung. In diesem Artikel zeigen wir dir 15 erprobte Strategien, um deine Kunden langfristig an dich zu binden.</p>

<h2>Warum Kundenbindung so wichtig ist</h2>

<p>Stammkunden sind der heilige Gral jedes Salons. Sie:</p>

<ul>
  <li>Kommen regelmäßig und planbar</li>
  <li>Geben im Schnitt mehr aus als Neukunden</li>
  <li>Empfehlen dich weiter</li>
  <li>Sind weniger preissensibel</li>
  <li>Geben ehrliches Feedback</li>
</ul>

<h2>Strategie 1: Erstelle Kundenprofile</h2>

<p>Führe detaillierte Kundenprofile in deinem System. Notiere nicht nur Farbformeln und Schnitte, sondern auch persönliche Details: Beruf, Hobbys, Familie, Urlaube. Diese Informationen helfen dir, persönliche Gespräche zu führen und zeigen deinen Kunden, dass du dich für sie interessierst.</p>

<h3>Was gehört ins Kundenprofil?</h3>
<ul>
  <li>Technische Daten (Formeln, Behandlungen)</li>
  <li>Persönliche Vorlieben (Gesprächsthemen, Getränke)</li>
  <li>Wichtige Ereignisse (Geburtstag, Jahrestage)</li>
  <li>Feedback und Zufriedenheit</li>
</ul>

<h2>Strategie 2: Konsistente Qualität liefern</h2>

<p>Der wichtigste Faktor für Kundenbindung ist ganz simpel: Liefere konstant gute Arbeit. Kunden wollen wissen, was sie erwartet. Überraschungen sind gut – aber nur positive.</p>

<h2>Strategie 3: Terminbestätigungen und Erinnerungen</h2>

<p>Automatische Terminerinnerungen per SMS oder E-Mail reduzieren No-Shows und zeigen Professionalität. Füge eine persönliche Note hinzu: "Wir freuen uns auf dich, [Name]!"</p>

<h2>Strategie 4: Follow-up nach dem Besuch</h2>

<p>Melde dich 2-3 Tage nach dem Besuch bei deinen Kunden. Frage, ob sie mit dem Ergebnis zufrieden sind und ob die Pflege zu Hause funktioniert. Das zeigt Engagement und gibt dir wertvolles Feedback.</p>

<blockquote>
"Der wahre Test für Kundenservice ist nicht der Moment des Kaufs, sondern der Moment danach." – Shep Hyken
</blockquote>

<h2>Strategie 5: Treueprogramme</h2>

<p>Ein gut durchdachtes Treueprogramm belohnt regelmäßige Besuche. Das kann ein klassisches Stempelkarten-System sein oder ein digitales Punktesystem. Wichtig: Die Belohnungen müssen attraktiv und erreichbar sein.</p>

<h2>Strategie 6: Exklusive Vorteile für Stammkunden</h2>

<p>Gib deinen treuesten Kunden das Gefühl, etwas Besonderes zu sein:</p>
<ul>
  <li>Bevorzugte Terminvergabe</li>
  <li>Exklusive Vorab-Infos zu neuen Trends</li>
  <li>Spezielle Events nur für Stammkunden</li>
  <li>Kleine Überraschungen (Samples, Upgrades)</li>
</ul>

<h2>Strategie 7: Personalisierte Kommunikation</h2>

<p>Newsletter und Angebote sollten relevant sein. Segmentiere deine Kundenliste und sende gezielte Nachrichten basierend auf den Interessen und der Historie.</p>

<h2>Strategie 8: Geburtstaggrüße</h2>

<p>Ein Geburtstag ist die perfekte Gelegenheit, sich in Erinnerung zu rufen. Sende eine persönliche Nachricht – idealerweise mit einem kleinen Geschenk oder Rabatt.</p>

<h2>Strategie 9: Beschwerden als Chance</h2>

<p>Unzufriedene Kunden, deren Beschwerden professionell gelöst werden, werden oft zu den loyalsten Stammkunden. Nimm Kritik ernst, reagiere schnell und großzügig.</p>

<h2>Strategie 10: Weiterbildung zeigen</h2>

<p>Teile deine Weiterbildungen mit deinen Kunden. Ob neuer Schnittkurs, Farbtraining oder Trend-Workshop – deine Kunden sollen wissen, dass du am Ball bleibst.</p>

<h2>Strategie 11: Online-Buchung anbieten</h2>

<p>Eine einfache Online-Buchungsmöglichkeit erhöht die Wiederbuchungsrate. Kunden können bequem von zu Hause buchen, auch außerhalb der Öffnungszeiten.</p>

<h2>Strategie 12: Empfehlungsprogramm</h2>

<p>Belohne Kunden, die neue Kunden bringen. Win-win: Der Empfehlende bekommt eine Belohnung, der Neue einen Anreiz.</p>

<h2>Strategie 13: Social Media Engagement</h2>

<p>Interagiere mit deinen Kunden auf Social Media. Like ihre Beiträge, antworte auf Kommentare, teile Transformationen (mit Erlaubnis). Das verlängert die Kundenbeziehung über den Salonbesuch hinaus.</p>

<h2>Strategie 14: Produktempfehlungen</h2>

<p>Beraten, nicht verkaufen. Wenn du Produkte empfiehlst, tue es, weil sie dem Kunden helfen – nicht weil du Provision willst. Diese Ehrlichkeit zahlt sich langfristig aus.</p>

<h2>Strategie 15: Kontinuierlich verbessern</h2>

<p>Frage regelmäßig nach Feedback und setze es um. Kunden merken, wenn du zuhörst und dich entwickelst.</p>

<h2>Fazit</h2>

<p>Kundenbindung ist kein einmaliges Projekt, sondern eine kontinuierliche Aufgabe. Fange mit 2-3 Strategien an und baue sie nach und nach aus. Der Schlüssel liegt in der Authentizität: Deine Kunden merken, ob du es ernst meinst.</p>
    `.trim(),
  },
  {
    title: 'Work-Life-Balance als Stylist: So vermeidest du Burnout',
    slug: 'work-life-balance-stylist-burnout',
    excerpt: 'Der Beruf des Stylisten ist körperlich und emotional fordernd. Lerne, wie du deine Gesundheit schützt und langfristig motiviert bleibst.',
    categorySlug: 'karriere',
    authorSlug: 'nicnoa-team',
    tagSlugs: ['selbststaendigkeit', 'weiterbildung'],
    readingTime: 11,
    featuredImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&h=630&fit=crop',
    content: `
<p>Lange Tage, ständiges Stehen, emotionale Gespräche und der Druck, immer kreativ zu sein – der Beruf des Stylisten fordert mehr, als viele denken. Immer mehr Friseur*innen berichten von Erschöpfung und Burnout. In diesem Artikel erfährst du, wie du vorbeugen kannst.</p>

<h2>Die besondere Belastung im Friseurberuf</h2>

<p>Als Stylist*in bist du gleichzeitig Handwerker*in, Psycholog*in, Künstler*in und Unternehmer*in. Diese Vielfalt macht den Beruf wunderbar – aber auch anspruchsvoll.</p>

<h3>Körperliche Belastung</h3>
<ul>
  <li>6-10 Stunden Stehen pro Tag</li>
  <li>Einseitige Bewegungen und Haltungen</li>
  <li>Kontakt mit Chemikalien</li>
  <li>Laute Umgebung (Föhn, Musik, Gespräche)</li>
</ul>

<h3>Emotionale Belastung</h3>
<ul>
  <li>Ständige Interaktion mit Menschen</li>
  <li>Kunden erzählen oft von Problemen</li>
  <li>Druck, immer gut gelaunt zu sein</li>
  <li>Kritik und Beschwerden</li>
</ul>

<h2>Warnsignale erkennen</h2>

<p>Burnout entwickelt sich schleichend. Achte auf diese Warnzeichen:</p>

<ul>
  <li>Chronische Müdigkeit, auch nach dem Wochenende</li>
  <li>Zunehmende Gereiztheit und Ungeduld</li>
  <li>Zynismus gegenüber Kunden oder dem Beruf</li>
  <li>Schlafprobleme</li>
  <li>Häufigere Krankheiten</li>
  <li>Verlust der Kreativität und Motivation</li>
</ul>

<blockquote>
"Burnout ist nicht das Ergebnis zu viel Arbeit, sondern zu wenig Erholung." – Arianna Huffington
</blockquote>

<h2>Strategien für mehr Balance</h2>

<h3>1. Grenzen setzen</h3>
<p>Lerne, Nein zu sagen. Du musst nicht jeden Sonderwunsch erfüllen, nicht jeden Termin annehmen, nicht rund um die Uhr erreichbar sein. Kommuniziere deine Grenzen klar und freundlich.</p>

<h3>2. Pausen ernst nehmen</h3>
<p>Eine echte Pause ist keine verschwendete Zeit. Verbringe deine Mittagspause nicht im Salon, sondern geh kurz raus, atme durch, iss in Ruhe. Dein Körper und dein Geist brauchen diese Erholung.</p>

<h3>3. Körperpflege priorisieren</h3>
<p>Investiere in gute Arbeitsschuhe, mache regelmäßig Dehnübungen, gönne dir Massagen. Dein Körper ist dein Kapital – behandle ihn entsprechend.</p>

<h3>4. Emotionale Hygiene</h3>
<p>Du bist nicht für die Probleme deiner Kunden verantwortlich. Lerne, zuzuhören ohne alles aufzunehmen. Entwickle Rituale, um nach der Arbeit abzuschalten.</p>

<h3>5. Hobbys außerhalb des Salons</h3>
<p>Pflege Interessen, die nichts mit Haaren zu tun haben. Sport, Musik, Kochen, Natur – alles, was dir Freude macht und dich auf andere Gedanken bringt.</p>

<h3>6. Soziale Kontakte</h3>
<p>Verbringe Zeit mit Menschen außerhalb deines Berufsumfelds. Freundschaften und Familie geben dir Rückhalt und Perspektive.</p>

<h3>7. Weiterbildung als Motivation</h3>
<p>Neue Techniken zu lernen kann die Freude am Beruf neu entfachen. Suche dir Kurse, die dich wirklich interessieren – nicht nur solche, die du "machen musst".</p>

<h3>8. Finanzielle Sicherheit</h3>
<p>Finanzielle Sorgen sind ein enormer Stressfaktor. Baue dir ein finanzielles Polster auf und sorge vor. Das gibt dir ein Gefühl von Kontrolle und Sicherheit.</p>

<h2>Dein persönlicher Energiehaushalt</h2>

<p>Denke an deine Energie wie an ein Bankkonto. Manche Aktivitäten und Menschen kosten Energie (Auszahlungen), andere geben dir Energie (Einzahlungen). Achte darauf, dass dein Konto im Plus bleibt.</p>

<h3>Was kostet Energie?</h3>
<ul>
  <li>Schwierige Kunden</li>
  <li>Überstunden</li>
  <li>Konflikte</li>
  <li>Schlafmangel</li>
</ul>

<h3>Was gibt Energie?</h3>
<ul>
  <li>Erfolgreiche Transformationen</li>
  <li>Dankbare Kunden</li>
  <li>Kreative Arbeit</li>
  <li>Gute Gespräche mit Kollegen</li>
  <li>Bewegung und Natur</li>
</ul>

<h2>Wann professionelle Hilfe suchen</h2>

<p>Wenn die Warnsignale anhalten, zögere nicht, professionelle Hilfe zu suchen. Burnout ist eine ernste Erkrankung, die behandelt werden sollte. Ein Gespräch mit einem Therapeuten oder Coach kann der erste Schritt zur Besserung sein.</p>

<h2>Fazit</h2>

<p>Work-Life-Balance ist keine Luxus, sondern eine Notwendigkeit – besonders in einem so fordernden Beruf wie dem unseren. Nimm dir die Zeit, auf dich zu achten. Nur wenn es dir gut geht, kannst du auch für deine Kunden da sein.</p>
    `.trim(),
  },
  {
    title: 'Die Kunst der Beratung: Wie du das Vertrauen deiner Kunden gewinnst',
    slug: 'kunst-der-beratung-kundenvertrauen',
    excerpt: 'Eine gute Beratung ist der Schlüssel zu zufriedenen Kunden. Lerne die Techniken, die Top-Stylisten verwenden.',
    categorySlug: 'salon-tipps',
    authorSlug: 'daniel-zutavern',
    tagSlugs: ['kundengewinnung', 'salonmanagement'],
    readingTime: 13,
    featuredImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=630&fit=crop',
    content: `
<p>Die Beratung vor der Behandlung ist oft wichtiger als die Behandlung selbst. In diesen wenigen Minuten entscheidet sich, ob der Kunde zufrieden sein wird – und ob er wiederkommt. In diesem Guide erfährst du, wie du zum Beratungsprofi wirst.</p>

<h2>Warum Beratung so entscheidend ist</h2>

<p>Viele Stylisten unterschätzen die Beratung und wollen direkt "zur Sache kommen". Dabei passieren hier die meisten Fehler, die zu Unzufriedenheit führen:</p>

<ul>
  <li>Missverständnisse über das gewünschte Ergebnis</li>
  <li>Unrealistische Erwartungen des Kunden</li>
  <li>Fehlende Information über Pflegeaufwand</li>
  <li>Nicht berücksichtigte Haarbeschaffenheit</li>
</ul>

<h2>Die drei Phasen einer perfekten Beratung</h2>

<h3>Phase 1: Zuhören und Verstehen</h3>

<p>Beginne mit offenen Fragen und höre wirklich zu. Nicht nur, was der Kunde sagt, sondern auch, was er meint.</p>

<p>Gute Eröffnungsfragen:</p>
<ul>
  <li>"Was möchtest du heute verändern?"</li>
  <li>"Was gefällt dir an deiner aktuellen Frisur? Was stört dich?"</li>
  <li>"Wie viel Zeit hast du morgens für deine Haare?"</li>
  <li>"Hast du Bilder, die dir gefallen?"</li>
</ul>

<p>Achte auf Körpersprache und Tonfall. Manchmal sagen Kunden "kürzer ist okay", meinen aber eigentlich "bloß nicht zu kurz". Frage im Zweifel nach.</p>

<h3>Phase 2: Analyse und Einschätzung</h3>

<p>Nach dem Zuhören kommt deine Expertise ins Spiel. Analysiere:</p>

<ul>
  <li>Haarstruktur und -qualität</li>
  <li>Gesichtsform und Proportionen</li>
  <li>Hautton und Typ</li>
  <li>Lifestyle und Pflegebereitschaft</li>
  <li>Vorgeschichte (Colorationen, Behandlungen)</li>
</ul>

<p>Sei ehrlich, aber diplomatisch. Wenn ein Wunsch nicht umsetzbar ist, erkläre warum und biete Alternativen an.</p>

<h3>Phase 3: Empfehlung und Abstimmung</h3>

<p>Präsentiere deine Empfehlung klar und verständlich. Nutze den Spiegel, um zu zeigen, was du meinst. Bei Farbberatung: Arbeite mit Farbkarten und echten Beispielen.</p>

<p>Wichtig: Stelle sicher, dass ihr euch einig seid, bevor du beginnst. Fasse noch einmal zusammen: "Okay, also wir machen... Bist du damit happy?"</p>

<blockquote>
"Die beste Frisur ist die, die der Kunde selbst jeden Tag stylen kann."
</blockquote>

<h2>Kommunikationstechniken für Profis</h2>

<h3>Aktives Zuhören</h3>
<p>Zeige, dass du zuhörst: Nicken, Blickkontakt, kurze Bestätigungen ("verstehe", "ja"). Wiederhole das Gesagte in eigenen Worten: "Wenn ich dich richtig verstehe, möchtest du..."</p>

<h3>Die Sandwich-Methode</h3>
<p>Wenn du etwas Kritisches sagen musst, verpacke es zwischen Positivem:</p>
<ul>
  <li>"Deine Haare haben eine tolle Struktur." (positiv)</li>
  <li>"Allerdings ist die Vorschädigung durch das Blondieren zu stark für..." (kritisch)</li>
  <li>"Aber wir können stattdessen... und das wird großartig aussehen." (positiv)</li>
</ul>

<h3>Visuelle Hilfsmittel</h3>
<p>Ein Bild sagt mehr als tausend Worte. Nutze:</p>
<ul>
  <li>Pinterest und Instagram für Inspiration</li>
  <li>Vorher-Nachher-Bilder eigener Arbeiten</li>
  <li>Farbkarten und Muster</li>
  <li>Apps zur Frisurensimulation</li>
</ul>

<h2>Schwierige Situationen meistern</h2>

<h3>Der unentschlossene Kunde</h3>
<p>Hilf durch konkrete Fragen: "Magst du es lieber pflegeleicht oder darf es aufwendiger sein?" Biete maximal zwei bis drei Optionen an – zu viele verwirren.</p>

<h3>Der Referenzbild-Kunde</h3>
<p>Wenn ein Kunde mit einem Promi-Foto kommt, erkläre: "Das ist ein wunderschöner Look. Lass uns schauen, wie wir das für deine Haarstruktur/Gesichtsform anpassen können."</p>

<h3>Der Angst-Kunde</h3>
<p>Manche Kunden haben schlechte Erfahrungen gemacht. Nimm dir extra Zeit, erkläre jeden Schritt und hole regelmäßig Feedback ein: "Bist du noch dabei? Gefällt dir die Richtung?"</p>

<h2>Die Beratung dokumentieren</h2>

<p>Notiere nach jedem Kunden die wichtigsten Punkte:</p>
<ul>
  <li>Was wurde besprochen und gemacht</li>
  <li>Welche Produkte wurden empfohlen</li>
  <li>Besondere Wünsche oder Bedenken</li>
  <li>Termin für den nächsten Besuch</li>
</ul>

<h2>Fazit</h2>

<p>Eine gute Beratung erfordert Zeit, Übung und echtes Interesse am Kunden. Sie ist keine lästige Pflicht, sondern die Basis für Zufriedenheit – auf beiden Seiten. Investiere in diese Fähigkeit, und deine Kundenbewertungen werden es dir danken.</p>
    `.trim(),
  },
  {
    title: 'Buchhaltung für Stylisten: Ein Anfänger-Guide',
    slug: 'buchhaltung-stylisten-guide',
    excerpt: 'Buchhaltung muss nicht kompliziert sein. Lerne die Grundlagen, die jeder selbstständige Stylist kennen sollte.',
    categorySlug: 'business',
    authorSlug: 'nico-schneider',
    tagSlugs: ['finanzen', 'selbststaendigkeit'],
    readingTime: 15,
    featuredImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    content: `
<p>Für viele kreative Menschen ist Buchhaltung ein Albtraum. Aber keine Sorge: Mit dem richtigen System und etwas Disziplin wird sie zum Kinderspiel. In diesem Guide erklären wir dir alles, was du als selbstständiger Stylist über Buchhaltung wissen musst.</p>

<h2>Warum Buchhaltung wichtig ist</h2>

<p>Eine ordentliche Buchhaltung ist nicht nur gesetzliche Pflicht – sie ist auch dein bester Freund für:</p>

<ul>
  <li>Überblick über deine finanzielle Situation</li>
  <li>Steuerliche Optimierung</li>
  <li>Businessplanung und Wachstum</li>
  <li>Kreditanträge und Finanzierungen</li>
  <li>Ruhe und Sicherheit</li>
</ul>

<h2>Die Grundlagen: Einnahmen-Überschuss-Rechnung (EÜR)</h2>

<p>Als Kleingewerbetreibender oder Freiberufler führst du in der Regel eine EÜR. Das Prinzip ist einfach:</p>

<p><strong>Einnahmen - Ausgaben = Gewinn (oder Verlust)</strong></p>

<p>Das Geld zählt, wenn es fließt – also wenn du es erhältst (Einnahme) oder zahlst (Ausgabe). Für die EÜR brauchst du keine doppelte Buchführung.</p>

<h2>Was du aufbewahren musst</h2>

<h3>10 Jahre aufbewahren:</h3>
<ul>
  <li>Rechnungen (selbst ausgestellt)</li>
  <li>Buchungsbelege</li>
  <li>Jahresabschlüsse</li>
  <li>Inventarlisten</li>
</ul>

<h3>6 Jahre aufbewahren:</h3>
<ul>
  <li>Geschäftsbriefe (gesendet und empfangen)</li>
  <li>Angebote und Auftragsbestätigungen</li>
</ul>

<h2>Dein Buchhaltungssystem einrichten</h2>

<h3>Schritt 1: Geschäftskonto eröffnen</h3>
<p>Trenne private und geschäftliche Finanzen konsequent. Das macht die Buchhaltung viel einfacher und schützt dich bei Prüfungen.</p>

<h3>Schritt 2: Belegorganisation</h3>
<p>Entwickle ein System für deine Belege. Digital ist praktisch: Fotografiere Quittungen mit dem Handy und speichere sie in einer Cloud mit klarer Ordnerstruktur (z.B. nach Monat/Kategorie).</p>

<h3>Schritt 3: Buchhaltungssoftware</h3>
<p>Investiere in eine gute Buchhaltungssoftware. Empfehlenswerte Optionen:</p>
<ul>
  <li>lexoffice – sehr benutzerfreundlich</li>
  <li>sevDesk – gutes Preis-Leistungs-Verhältnis</li>
  <li>Debitoor – gut für Einsteiger</li>
  <li>SumUp – wenn du auch deren Kassensystem nutzt</li>
</ul>

<blockquote>
"Jede gesparte Stunde bei der Buchhaltung ist eine Stunde mehr für das, was du liebst."
</blockquote>

<h2>Typische Ausgaben als Stylist</h2>

<p>Diese Kosten kannst du als Betriebsausgaben absetzen:</p>

<h3>Direkte Kosten</h3>
<ul>
  <li>Stuhlmiete</li>
  <li>Produkte und Materialien</li>
  <li>Werkzeuge und Equipment</li>
  <li>Berufsbekleidung</li>
</ul>

<h3>Betriebskosten</h3>
<ul>
  <li>Software und Apps</li>
  <li>Telefon und Internet</li>
  <li>Werbung und Marketing</li>
  <li>Versicherungen (berufsbezogen)</li>
  <li>Weiterbildung und Kurse</li>
  <li>Fahrtkosten zu Kunden</li>
</ul>

<h2>Rechnungen richtig schreiben</h2>

<p>Eine ordnungsgemäße Rechnung muss enthalten:</p>

<ul>
  <li>Deinen vollständigen Namen und Anschrift</li>
  <li>Name und Anschrift des Kunden</li>
  <li>Deine Steuernummer oder USt-ID</li>
  <li>Rechnungsdatum</li>
  <li>Fortlaufende Rechnungsnummer</li>
  <li>Leistungsbeschreibung</li>
  <li>Leistungszeitraum oder -datum</li>
  <li>Nettobetrag, Steuersatz, Steuerbetrag, Bruttobetrag</li>
</ul>

<h2>Kleinunternehmerregelung – ja oder nein?</h2>

<p>Mit der Kleinunternehmerregelung (§19 UStG) musst du keine Umsatzsteuer ausweisen, wenn dein Jahresumsatz unter 22.000€ liegt. Vorteile:</p>

<ul>
  <li>Weniger Bürokratie</li>
  <li>Günstigere Preise für Privatkunden</li>
</ul>

<p>Nachteile:</p>
<ul>
  <li>Kein Vorsteuerabzug (wichtig bei hohen Investitionen)</li>
  <li>Bei Wachstum muss gewechselt werden</li>
</ul>

<h2>Steuern: Was kommt auf dich zu?</h2>

<h3>Einkommensteuer</h3>
<p>Auf deinen Gewinn zahlst du Einkommensteuer. Der Steuersatz steigt progressiv mit dem Einkommen. Lege etwa 25-30% deines Gewinns für Steuern zurück.</p>

<h3>Umsatzsteuer</h3>
<p>Falls du nicht Kleinunternehmer bist: 19% auf deine Leistungen, die du quartalsweise ans Finanzamt abführst.</p>

<h3>Gewerbesteuer</h3>
<p>Fällt erst ab einem Gewinn von ca. 24.500€ an und variiert je nach Gemeinde.</p>

<h2>Tipps für die Praxis</h2>

<h3>Wöchentliche Routine</h3>
<p>Nimm dir jeden Sonntag 15 Minuten Zeit, um Belege zu sortieren und Einnahmen einzutragen. So stapelt sich nichts.</p>

<h3>Monatliche Routine</h3>
<p>Einmal im Monat: Kontoauszüge abgleichen, offene Rechnungen prüfen, Überblick verschaffen.</p>

<h3>Quartalsweise</h3>
<p>Umsatzsteuer-Voranmeldung (falls relevant), Gewinn-Check, ggf. Steuerrücklagen anpassen.</p>

<h2>Wann zum Steuerberater?</h2>

<p>Ein Steuerberater lohnt sich, wenn:</p>
<ul>
  <li>Dein Umsatz wächst und die Situation komplexer wird</li>
  <li>Du investieren möchtest (Steueroptimierung)</li>
  <li>Du keine Zeit/Lust hast, dich selbst darum zu kümmern</li>
  <li>Du Mitarbeiter einstellen willst</li>
</ul>

<h2>Fazit</h2>

<p>Buchhaltung ist kein Hexenwerk. Mit dem richtigen System, regelmäßigen Routinen und – falls nötig – professioneller Hilfe bekommst du sie in den Griff. Und der Überblick über deine Finanzen ist unbezahlbar.</p>
    `.trim(),
  },
];

async function main() {
  console.log('🌱 Seeding additional blog articles...')

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
      update: {
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        featuredImage: articleData.featuredImage,
        readingTime: articleData.readingTime,
      },
      create: {
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        featuredImage: articleData.featuredImage,
        readingTime: articleData.readingTime,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
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

  console.log('🎉 Done! Created', articles.length, 'articles')
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

