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
    title: 'Salon-Events: So machst du aus Kunden Fans',
    slug: 'salon-events-kunden-fans',
    excerpt: 'Events im Salon sind mehr als Marketing – sie schaffen unvergessliche Erlebnisse. Hier sind die besten Ideen.',
    categorySlug: 'marketing',
    authorSlug: 'daniel-zutavern',
    tagSlugs: ['kundengewinnung', 'salonmanagement'],
    readingTime: 10,
    featuredImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop',
    content: `
<p>Ein Salonbesuch kann mehr sein als ein Termin – er kann ein Erlebnis sein. Events im Salon stärken die Kundenbindung, generieren Aufmerksamkeit und machen einfach Spaß. Hier erfährst du, wie du unvergessliche Salon-Events planst.</p>

<h2>Warum Salon-Events so wirkungsvoll sind</h2>

<p>In einer Welt voller digitaler Interaktionen sind reale Erlebnisse wertvoller denn je. Ein gelungenes Event:</p>
<ul>
  <li>Schafft emotionale Verbindung zu deiner Marke</li>
  <li>Generiert Content für Social Media</li>
  <li>Bringt Neukunden durch Mundpropaganda</li>
  <li>Differenziert dich von der Konkurrenz</li>
  <li>Macht dein Team stolz</li>
</ul>

<h2>Event-Ideen für jeden Anlass</h2>

<h3>1. Launch-Partys</h3>
<p>Neue Produktlinie, neuer Look, neuer Mitarbeiter – alles Gründe zu feiern. Lade deine besten Kunden ein, biete Prosecco und kleine Treatments an.</p>

<h3>2. Styling-Workshops</h3>
<p>Zeige deinen Kundinnen, wie sie ihre Frisur zu Hause stylen können. Interaktiv, lehrreich und ein super Kundenbindungstool.</p>

<h3>3. Girls Night Out</h3>
<p>Abend-Event nur für Frauen. Sekt, Snacks, Styling-Sessions, vielleicht ein Gastredner (Visagist, Modeblogger).</p>

<h3>4. Charity-Events</h3>
<p>Spende einen Teil des Umsatzes an einen guten Zweck. Gut fürs Karma, gut fürs Image.</p>

<h3>5. Saisonale Specials</h3>
<p>Frühlings-Refresh, Sommer-Glow, Herbst-Verwöhntag, Weihnachts-Special. Der Kalender bietet viele Anlässe.</p>

<blockquote>
"Ein Event muss nicht groß sein, um großartig zu sein. Es muss nur echt sein."
</blockquote>

<h2>Planung: Step by Step</h2>

<h3>6 Wochen vorher</h3>
<ul>
  <li>Konzept und Datum festlegen</li>
  <li>Budget planen</li>
  <li>Ggf. Partner einbeziehen (Caterer, Brands)</li>
</ul>

<h3>4 Wochen vorher</h3>
<ul>
  <li>Einladungen versenden (E-Mail, Social Media, persönlich)</li>
  <li>Dekoration und Materialien bestellen</li>
  <li>Team briefen</li>
</ul>

<h3>1 Woche vorher</h3>
<ul>
  <li>Reminder an Gäste</li>
  <li>Letzte Vorbereitungen</li>
  <li>Ablauf durchsprechen</li>
</ul>

<h3>Am Tag</h3>
<ul>
  <li>Früh da sein, alles vorbereiten</li>
  <li>Für Fotos und Videos sorgen</li>
  <li>Genießen!</li>
</ul>

<h2>Budget-freundliche Tipps</h2>

<ul>
  <li>Kooperationen mit Brands – viele stellen kostenlos Produkte</li>
  <li>Kunden können Freundinnen mitbringen – mehr Gäste, kein Extra-Aufwand</li>
  <li>Selfmade Deko kann charming wirken</li>
  <li>Finger-Food statt Catering</li>
</ul>

<h2>Nach dem Event</h2>

<h3>Fotos und Videos teilen</h3>
<p>Der Content-Goldmine! Stories, Posts, Reels – nutze alles.</p>

<h3>Dankeschön senden</h3>
<p>Ein kurzes "Danke, dass du da warst!" per E-Mail oder persönlich.</p>

<h3>Feedback sammeln</h3>
<p>Was hat gefallen? Was können wir besser machen?</p>

<h2>Fazit</h2>

<p>Salon-Events sind eine Investition in Beziehungen. Sie müssen nicht perfekt sein – sie müssen von Herzen kommen. Starte klein, lerne und wachse. Deine Kunden werden es lieben.</p>
    `.trim(),
  },
  {
    title: 'Stressmanagement für Salonbesitzer: So bleibst du gesund',
    slug: 'stressmanagement-salonbesitzer-gesund',
    excerpt: 'Als Salonbesitzer trägst du viel Verantwortung. Lerne, wie du mit dem Druck umgehst und gesund bleibst.',
    categorySlug: 'karriere',
    authorSlug: 'nico-schneider',
    tagSlugs: ['selbststaendigkeit', 'salonmanagement'],
    readingTime: 12,
    featuredImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=630&fit=crop',
    content: `
<p>Kunden, Mitarbeiter, Finanzen, Marketing, Termine – als Salonbesitzer hast du tausend Bälle in der Luft. Das kann überwältigend sein. Hier erfährst du, wie du den Stress managst, bevor er dich managt.</p>

<h2>Warum Salonbesitzer besonders gefährdet sind</h2>

<p>Die Kombination aus körperlicher Arbeit, emotionaler Belastung durch Kundenkontakt und unternehmerischer Verantwortung macht den Job besonders fordernd. Dazu kommen:</p>
<ul>
  <li>Unregelmäßige Arbeitszeiten</li>
  <li>Schwer planbare Einnahmen</li>
  <li>Verantwortung für Mitarbeiter</li>
  <li>Hoher Konkurrenzdruck</li>
  <li>Keine Trennung zwischen Arbeit und Privat</li>
</ul>

<h2>Warnsignale erkennen</h2>

<h3>Körperliche Symptome</h3>
<ul>
  <li>Chronische Müdigkeit</li>
  <li>Kopfschmerzen, Verspannungen</li>
  <li>Schlafprobleme</li>
  <li>Häufige Infekte</li>
</ul>

<h3>Emotionale Symptome</h3>
<ul>
  <li>Gereiztheit, Ungeduld</li>
  <li>Gefühl der Überforderung</li>
  <li>Zynismus</li>
  <li>Motivationsverlust</li>
</ul>

<h3>Verhaltenssymptome</h3>
<ul>
  <li>Vernachlässigung von Hobbys und Freunden</li>
  <li>Erhöhter Alkohol- oder Koffeinkonsum</li>
  <li>Prokrastination</li>
  <li>Fehler häufen sich</li>
</ul>

<blockquote>
"Du kannst aus einem leeren Becher nicht einschenken. Fülle zuerst deinen eigenen."
</blockquote>

<h2>Sofort-Strategien bei akutem Stress</h2>

<h3>Atempause</h3>
<p>Die 4-7-8 Technik: 4 Sekunden einatmen, 7 Sekunden halten, 8 Sekunden ausatmen. Dreimal wiederholen. Funktioniert sofort.</p>

<h3>Körperliche Bewegung</h3>
<p>Kurz rausgehen, um den Block laufen, Treppen steigen. Bewegung baut Stresshormone ab.</p>

<h3>Perspektivwechsel</h3>
<p>"Wird das in einem Jahr noch wichtig sein?" Oft relativiert diese Frage den akuten Stress.</p>

<h2>Langfristige Prävention</h2>

<h3>1. Grenzen setzen</h3>
<p>Definiere deine Arbeitszeiten und halte sie ein. Kein E-Mail-Checken nach Feierabend. Kein Telefonieren im Urlaub.</p>

<h3>2. Delegieren lernen</h3>
<p>Du musst nicht alles selbst machen. Vertraue deinem Team. Investiere in Einarbeitung – das zahlt sich aus.</p>

<h3>3. Nein sagen</h3>
<p>Nicht jeder Kunde, nicht jedes Projekt, nicht jede Anfrage verdient dein Ja. Ein klares Nein ist besser als ein halbherziges Ja.</p>

<h3>4. Routinen etablieren</h3>
<p>Morgen- und Abendroutinen geben Struktur und Kontrolle zurück. Sie müssen nicht lang sein – 15 Minuten reichen.</p>

<h3>5. Bewegung und Ernährung</h3>
<p>Regelmäßiger Sport reduziert Stress nachweislich. Gute Ernährung gibt Energie. Beides vernachlässigen wir oft als Erste.</p>

<h3>6. Soziale Kontakte pflegen</h3>
<p>Zeit mit Menschen verbringen, die nichts mit deinem Business zu tun haben. Familie, Freunde, Hobbys.</p>

<h2>Professionelle Hilfe</h2>

<p>Manchmal reichen Selbsthilfe-Strategien nicht. Das ist okay. Ein Coach oder Therapeut kann helfen bei:</p>
<ul>
  <li>Anhaltender Erschöpfung</li>
  <li>Angst oder Depression</li>
  <li>Beziehungsproblemen durch die Arbeit</li>
  <li>Gefühl des Ausgebranntseins</li>
</ul>

<h2>Fazit</h2>

<p>Dein Salon braucht dich gesund. Stressmanagement ist keine Schwäche – es ist Führungsstärke. Investiere in dich selbst, setze Grenzen und hole dir Hilfe, wenn nötig. Du hast es verdient.</p>
    `.trim(),
  },
  {
    title: 'Haarpflege-Beratung: So verkaufst du, ohne zu verkaufen',
    slug: 'haarpflege-beratung-verkaufen',
    excerpt: 'Produktverkauf muss nicht unangenehm sein. Lerne, wie du durch ehrliche Beratung mehr verkaufst – und deine Kunden glücklich machst.',
    categorySlug: 'salon-tipps',
    authorSlug: 'nicnoa-team',
    tagSlugs: ['kundengewinnung', 'salonmanagement'],
    readingTime: 9,
    featuredImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=630&fit=crop',
    content: `
<p>Viele Stylisten fühlen sich unwohl beim Produktverkauf. Sie wollen nicht aufdringlich wirken. Dabei ist Produktberatung ein Service – kein Sales-Pitch. Hier erfährst du, wie du authentisch berätst und dabei mehr verkaufst.</p>

<h2>Warum Produktverkauf wichtig ist</h2>

<ul>
  <li>Zusätzliche Einnahmequelle (Margen von 30-50%)</li>
  <li>Kunden können dein Ergebnis zu Hause erhalten</li>
  <li>Du zeigst Expertise</li>
  <li>Vertrauensaufbau durch ehrliche Beratung</li>
</ul>

<h2>Das Mindset ändern: Von Verkaufen zu Helfen</h2>

<p>Du verkaufst nicht – du löst ein Problem. Deine Kundin hat trockene Haare? Du hast die Lösung. Das ist Service, nicht Sales.</p>

<h3>Der Unterschied</h3>
<ul>
  <li><strong>Verkaufen:</strong> "Dieses Öl ist gerade im Angebot."</li>
  <li><strong>Helfen:</strong> "Ich merke, dass deine Spitzen sehr trocken sind. Mit diesem Öl würden sie viel geschmeidiger werden."</li>
</ul>

<blockquote>
"Verkaufen ist, wenn du jemandem etwas gibst, das er nicht braucht. Beraten ist, wenn du ihm gibst, was er braucht – und er es vielleicht noch nicht weiß."
</blockquote>

<h2>Während der Behandlung</h2>

<h3>Erklären, was du tust</h3>
<p>"Ich benutze jetzt dieses Leave-in, weil es perfekt für coloriertes Haar ist." – Du zeigst Expertise und machst neugierig.</p>

<h3>Fragen stellen</h3>
<p>"Wie pflegst du deine Haare zu Hause?" – Öffnet das Gespräch ohne Verkaufsdruck.</p>

<h3>Produkte anfassen lassen</h3>
<p>Menschen kaufen, was sie berührt haben. Lass die Kundin das Produkt in der Hand halten, riechen, ausprobieren.</p>

<h2>Die richtige Empfehlung</h2>

<h3>Nicht zu viel auf einmal</h3>
<p>Überfordere nicht mit 5 Produkten. Ein oder zwei gezielte Empfehlungen sind effektiver.</p>

<h3>Das Wichtigste zuerst</h3>
<p>Welches Produkt macht den größten Unterschied? Damit anfangen.</p>

<h3>Ehrlich bleiben</h3>
<p>Wenn ein Produkt nicht passt, sag es. Deine Kundin wird es dir danken – und beim nächsten Mal vertrauen.</p>

<h2>Nach der Behandlung</h2>

<h3>Zusammenfassen</h3>
<p>"Für zu Hause würde ich dir das Shampoo und die Maske empfehlen. Damit bleibt die Farbe länger frisch."</p>

<h3>Nicht drängen</h3>
<p>Ein "Überleg es dir" ist besser als ein "Du musst das kaufen". Kein Druck.</p>

<h3>Probe mitgeben</h3>
<p>Wenn möglich, eine kleine Probe mitgeben. Die Kundin testet, ist begeistert, kauft beim nächsten Mal.</p>

<h2>Was, wenn die Kundin Nein sagt?</h2>

<p>Das ist völlig okay. Ein Nein heute ist kein Nein für immer. Respektiere die Entscheidung, sei weiterhin freundlich. Die Beziehung ist wichtiger als der Verkauf.</p>

<h2>Team motivieren</h2>

<ul>
  <li>Schulungen zu Produkten (Wissen macht sicher)</li>
  <li>Provision oder Bonussystem</li>
  <li>Vorleben: Wenn du es tust, tun sie es auch</li>
</ul>

<h2>Fazit</h2>

<p>Produktberatung ist ein Geschenk an deine Kunden – nicht an deinen Geldbeutel. Wenn du mit dieser Einstellung berätst, wirst du mehr verkaufen, als du denkst. Und deine Kunden werden es dir danken.</p>
    `.trim(),
  },
  {
    title: 'Urlaubsvertretung organisieren: So läuft dein Salon auch ohne dich',
    slug: 'urlaubsvertretung-salon-organisieren',
    excerpt: 'Du hast Urlaub verdient – aber der Salon muss weiterlaufen. So organisierst du die perfekte Vertretung.',
    categorySlug: 'business',
    authorSlug: 'daniel-zutavern',
    tagSlugs: ['salonmanagement'],
    readingTime: 8,
    featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=630&fit=crop',
    content: `
<p>Als Salonbesitzer oder selbstständiger Stylist ist Urlaub kompliziert. Wer kümmert sich um die Kunden? Wer beantwortet Anfragen? Hier ist dein Guide für sorgenfreie Auszeiten.</p>

<h2>Warum Urlaub wichtig ist</h2>

<p>Spoiler: Du brauchst ihn. Burnout ist real, und du bist niemandem geholfen, wenn du ausbrennst. Regelmäßige Pausen:</p>
<ul>
  <li>Verbessern deine Kreativität</li>
  <li>Stärken deine Gesundheit</li>
  <li>Geben dir Perspektive</li>
  <li>Zeigen deinem Team, dass es möglich ist</li>
</ul>

<h2>Vorbereitung: Wochen im Voraus</h2>

<h3>Kunden informieren</h3>
<p>Je früher, desto besser. Per E-Mail, Social Media, Aushang im Salon. Biete Termine vor oder nach dem Urlaub an.</p>

<h3>Vertretung organisieren</h3>
<p>Wer übernimmt was?</p>
<ul>
  <li>Tagesgeschäft (Kunden, Termine)</li>
  <li>Notfälle (Rohrbruch, Mitarbeiter-Ausfall)</li>
  <li>Finanzen (Zahlungen, Lieferanten)</li>
  <li>Kommunikation (E-Mails, Social Media)</li>
</ul>

<h3>Team briefen</h3>
<p>Klare Verantwortlichkeiten. Schriftlich festhalten. Fragen klären, bevor du gehst.</p>

<h2>Während des Urlaubs</h2>

<h3>Wirklich abschalten</h3>
<p>Kein ständiges E-Mail-Checken. Ein kurzer morgendlicher Check reicht – wenn überhaupt.</p>

<h3>Erreichbarkeit klar kommunizieren</h3>
<p>"Ich bin nur in echten Notfällen erreichbar" – und definiere, was ein Notfall ist.</p>

<h3>Vertrauen</h3>
<p>Du hast dein Team geschult. Vertraue ihnen. Mikromanagement aus der Ferne macht nur alle wahnsinnig.</p>

<blockquote>
"Dein Salon überlebt eine Woche ohne dich. Deine Gesundheit vielleicht nicht eine weitere Woche ohne Pause."
</blockquote>

<h2>Für Solo-Stylisten</h2>

<h3>Option 1: Schließen</h3>
<p>Manchmal ist das die einfachste Lösung. Kunden verstehen das. Hauptsache, sie wissen es früh genug.</p>

<h3>Option 2: Vertretung</h3>
<p>Kollege aus einem anderen Salon, der deine Kunden übernimmt? Netzwerk nutzen!</p>

<h3>Option 3: Teilschließung</h3>
<p>Keine neuen Termine, aber vorbereitete Automatisierungen (Booking-Tool mit Info, Auto-Responder).</p>

<h2>Nach dem Urlaub</h2>

<h3>Sanfter Wiedereinstieg</h3>
<p>Plane den ersten Tag nicht komplett voll. Zeit fürs Aufholen.</p>

<h3>Debriefing</h3>
<p>Was ist passiert? Was lief gut? Was können wir besser machen beim nächsten Mal?</p>

<h3>Danke sagen</h3>
<p>An alle, die übernommen haben. Ein kleines Dankeschön geht weit.</p>

<h2>Fazit</h2>

<p>Urlaub ist kein Luxus – er ist Notwendigkeit. Mit der richtigen Planung läuft dein Salon auch ohne dich. Und du kommst erholt und motiviert zurück. Win-win.</p>
    `.trim(),
  },
  {
    title: 'Lokales SEO für Salons: So wirst du bei Google gefunden',
    slug: 'lokales-seo-salons-google',
    excerpt: 'Wenn jemand "Friseur in meiner Nähe" googelt, willst du ganz oben stehen. So optimierst du deine lokale Sichtbarkeit.',
    categorySlug: 'marketing',
    authorSlug: 'nico-schneider',
    tagSlugs: ['digitalisierung', 'kundengewinnung'],
    readingTime: 11,
    featuredImage: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&h=630&fit=crop',
    content: `
<p>Die meisten Salonkunden finden ihren Friseur online – oft bei einer Google-Suche. Lokales SEO entscheidet, ob du in den Ergebnissen auftauchst oder in der digitalen Versenkung verschwindest. Hier erfährst du, wie du sichtbar wirst.</p>

<h2>Was ist lokales SEO?</h2>

<p>SEO steht für Search Engine Optimization – Suchmaschinenoptimierung. Lokales SEO fokussiert sich auf geografische Suchen wie "Friseur Berlin Mitte" oder "Colorist in meiner Nähe".</p>

<h2>Google Business Profile: Dein wichtigstes Tool</h2>

<p>Das Google Business Profile (ehemals Google My Business) ist der Schlüssel zu lokaler Sichtbarkeit. Es ist kostenlos und extrem wichtig.</p>

<h3>Profil optimieren</h3>
<ul>
  <li><strong>Vollständige Infos:</strong> Name, Adresse, Telefon, Website, Öffnungszeiten</li>
  <li><strong>Kategorie:</strong> "Friseursalon" als Hauptkategorie, ggf. Unterkategorien</li>
  <li><strong>Beschreibung:</strong> Keywordreich, aber natürlich (z.B. "Friseur in München Schwabing für Balayage und Colorationen")</li>
  <li><strong>Fotos:</strong> Professionelle Bilder vom Salon, Team, Arbeiten</li>
  <li><strong>Dienstleistungen:</strong> Alle Services auflisten mit Preisen</li>
</ul>

<h3>Regelmäßig aktualisieren</h3>
<p>Google liebt aktive Profile. Poste Updates, teile Bilder, antworte auf Bewertungen.</p>

<blockquote>
"Dein Google Business Profile ist oft der erste Eindruck – mach ihn perfekt."
</blockquote>

<h2>Bewertungen: Der Turbo</h2>

<p>Mehr und bessere Bewertungen = höheres Ranking. So bekommst du sie:</p>
<ul>
  <li>Aktiv darum bitten (siehe unser Artikel zu Bewertungsmanagement)</li>
  <li>Auf alle Bewertungen antworten</li>
  <li>Negative Bewertungen professionell handhaben</li>
</ul>

<h2>Website optimieren</h2>

<h3>Lokale Keywords</h3>
<p>Verwende "Friseur + Stadt/Stadtteil" auf deiner Website:</p>
<ul>
  <li>Im Seitentitel</li>
  <li>In Überschriften</li>
  <li>Im Text (natürlich, nicht übertrieben)</li>
  <li>In Bild-Alt-Texten</li>
</ul>

<h3>NAP-Konsistenz</h3>
<p>NAP = Name, Adresse, Phone. Diese Infos müssen überall identisch sein – Website, Google, Social Media, Branchenbücher.</p>

<h3>Mobile-Optimierung</h3>
<p>Die meisten lokalen Suchen passieren auf dem Handy. Deine Website muss mobil perfekt funktionieren.</p>

<h3>Schnelle Ladezeiten</h3>
<p>Google straft langsame Websites ab. Bilder komprimieren, gutes Hosting nutzen.</p>

<h2>Lokale Verzeichnisse</h2>

<p>Trage dich in relevante Verzeichnisse ein:</p>
<ul>
  <li>Yelp</li>
  <li>Das Örtliche</li>
  <li>Gelbe Seiten</li>
  <li>Branchenspezifische Portale (Treatwell, etc.)</li>
  <li>Lokale Stadtportale</li>
</ul>

<h2>Social Media Signale</h2>

<p>Aktive Social-Media-Präsenz mit lokalen Hashtags und Check-ins unterstützt dein lokales SEO indirekt.</p>

<h2>Content-Marketing</h2>

<p>Ein Blog mit lokalen Themen ("Die besten Haarpflegetipps für Hamburger Winter") kann lokale Suchen anziehen.</p>

<h2>Messen und Verbessern</h2>

<h3>Google Business Insights</h3>
<p>Zeigt dir, wie Leute dein Profil finden und was sie tun.</p>

<h3>Google Search Console</h3>
<p>Zeigt, für welche Suchanfragen deine Website erscheint.</p>

<h3>Lokales Ranking prüfen</h3>
<p>Suche inkognito nach "Friseur + deine Stadt" und schau, wo du stehst.</p>

<h2>Fazit</h2>

<p>Lokales SEO ist keine Raketenwissenschaft, aber es braucht Aufmerksamkeit. Ein optimiertes Google Business Profile, gute Bewertungen und eine lokalisierte Website sind die Basics. Investiere die Zeit – die Neukunden werden kommen.</p>
    `.trim(),
  },
];

async function main() {
  console.log('🌱 Seeding final blog articles (Part 3)...')

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
        publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
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

  console.log('🎉 All 20 articles seeded!')
}

main()
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

