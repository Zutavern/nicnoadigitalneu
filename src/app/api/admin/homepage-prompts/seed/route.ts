import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PromptData {
  pageType: string
  targetRole: 'STYLIST' | 'SALON_OWNER' | 'BOTH'
  category: string
  title: string
  prompt: string
  description?: string
  icon?: string
}

// ============================================
// STARTSEITE (home) - 20 Prompts
// ============================================
const homePrompts: PromptData[] = [
  // Hero
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Hero',
    title: 'Hero modernisieren',
    prompt: 'Gestalte den Hero-Bereich modern mit Vollbild-Hintergrundbild, großer Headline, Subline und prominentem Call-to-Action Button. Nutze eine ansprechende Farbüberlagerung.',
    icon: 'Sparkles'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Hero',
    title: 'Video-Hero',
    prompt: 'Ersetze das Hintergrundbild durch ein Hintergrundvideo mit dunklem Overlay und animiertem Text. Das Video soll autoplayed und geloopt sein.',
    icon: 'Video'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Hero',
    title: 'Split-Screen Hero',
    prompt: 'Teile den Hero in zwei Hälften: links ein großes, hochwertiges Bild, rechts Text mit Headline, Beschreibung und CTA-Button auf farbigem Hintergrund.',
    icon: 'LayoutPanelLeft'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Hero',
    title: 'Minimalistischer Hero',
    prompt: 'Reduziere den Hero auf das Wesentliche: nur große Headline, kurzer Untertitel und Button auf weißem Hintergrund. Fokus auf Typografie.',
    icon: 'Minus'
  },
  // Header
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Header',
    title: 'Header vergrößern',
    prompt: 'Mache den Header größer mit Logo links, Navigation mittig zentriert und CTA-Button rechts. Füge einen Hover-Effekt für die Navigation hinzu.',
    icon: 'PanelTop'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Header',
    title: 'Sticky Header',
    prompt: 'Implementiere einen Header der beim Scrollen oben fixiert bleibt und seine Hintergrundfarbe von transparent zu weiß wechselt.',
    icon: 'Pin'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Header',
    title: 'Transparenter Header',
    prompt: 'Mache den Header komplett transparent mit weißer Schrift, der beim Scrollen einen weißen Hintergrund mit dunkler Schrift bekommt.',
    icon: 'Ghost'
  },
  // Layout
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Layout',
    title: 'Magazin-Layout',
    prompt: 'Strukturiere die Seite wie ein modernes Magazin mit verschiedenen Spaltenbreiten, großen Bildern und übersichtlichen Textblöcken.',
    icon: 'Newspaper'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Layout',
    title: 'Bento-Grid',
    prompt: 'Erstelle ein modernes Bento-Grid Layout mit unterschiedlich großen Kacheln für verschiedene Inhalte wie Bilder, Text und CTAs.',
    icon: 'Grid3x3'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Layout',
    title: 'Asymmetrisches Layout',
    prompt: 'Gestalte die Seite asymmetrisch mit versetzten Elementen, dynamischen Abständen und kreativem Einsatz von Weißraum.',
    icon: 'Shuffle'
  },
  // Testimonials
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Testimonials',
    title: 'Kundenbewertungen',
    prompt: 'Füge einen Testimonials-Bereich mit 3 Kundenbewertungen hinzu. Jede Bewertung hat Profilbild, Name, Text und 5-Sterne-Rating.',
    icon: 'Star'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Testimonials',
    title: 'Testimonial-Slider',
    prompt: 'Erstelle einen automatischen Slider mit Kundenstimmen. Zeige Profilbild, Bewertungstext und Namen mit Fade-Animationen.',
    icon: 'GalleryHorizontal'
  },
  // Services
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Services',
    title: 'Service-Highlights',
    prompt: 'Zeige 3-4 Haupt-Services als Karten mit passenden Icons, kurzer Beschreibung und Startpreis. Füge Hover-Effekte hinzu.',
    icon: 'Scissors'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Services',
    title: 'Services mit Bildern',
    prompt: 'Präsentiere Services mit großen Beispielbildern, Hover-Overlay mit Servicenamen und Kurzbeschreibung.',
    icon: 'Image'
  },
  // CTA
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'CTA',
    title: 'Terminbuchung prominent',
    prompt: 'Mache den Termin-buchen Button größer und auffälliger mit Animation. Füge einen zweiten CTA-Bereich in der Seitenmitte hinzu.',
    icon: 'CalendarCheck'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'CTA',
    title: 'Floating CTA',
    prompt: 'Füge einen schwebenden Termin-Button hinzu der immer am unteren rechten Rand sichtbar bleibt und beim Hover größer wird.',
    icon: 'Move'
  },
  // Galerie
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Galerie',
    title: 'Mini-Portfolio',
    prompt: 'Füge eine kleine Galerie mit 4-6 der besten Arbeitsbeispiele auf der Startseite hinzu. Mit Hover-Effekt und Link zur vollständigen Galerie.',
    icon: 'Images'
  },
  // Social
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Social',
    title: 'Instagram-Feed',
    prompt: 'Integriere einen Instagram-Feed-Bereich mit den letzten 6 Posts als Bild-Grid. Füge einen "Folgen auf Instagram" Button hinzu.',
    icon: 'Instagram'
  },
  // Animation
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Animation',
    title: 'Scroll-Animationen',
    prompt: 'Füge subtile Einblende-Animationen hinzu die beim Scrollen ausgelöst werden. Elemente sollen von unten einsliden.',
    icon: 'Wand2'
  },
  {
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Animation',
    title: 'Parallax-Effekte',
    prompt: 'Implementiere Parallax-Scrolling für Hintergrundbilder und bestimmte Elemente. Der Effekt soll subtil und elegant sein.',
    icon: 'Layers'
  }
]

// ============================================
// ÜBER MICH / ÜBER UNS - 15 Prompts
// ============================================
const aboutPrompts: PromptData[] = [
  {
    pageType: 'ueber-mich',
    targetRole: 'STYLIST',
    category: 'Bio',
    title: 'Persönliche Geschichte',
    prompt: 'Erstelle einen emotionalen Über-mich-Bereich mit meiner Geschichte, warum ich Friseur geworden bin und meiner Philosophie zum Haarstyling.',
    icon: 'User'
  },
  {
    pageType: 'ueber-uns',
    targetRole: 'SALON_OWNER',
    category: 'Bio',
    title: 'Salon-Geschichte',
    prompt: 'Erzähle die Geschichte unseres Salons: Gründung, Entwicklung, Vision. Mit Bildern vom Anfang bis heute.',
    icon: 'Building'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Bio',
    title: 'Timeline',
    prompt: 'Zeige meinen Werdegang als vertikale Timeline mit Jahren, Stationen und kurzen Beschreibungen. Visuell ansprechend mit Icons.',
    icon: 'History'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Bio',
    title: 'Zwei-Spalten Bio',
    prompt: 'Teile den Bereich in zwei Spalten: links ein großes, professionelles Porträtfoto, rechts Text mit Fakten und persönlichem Statement.',
    icon: 'LayoutPanelLeft'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Qualifikationen',
    title: 'Zertifikate anzeigen',
    prompt: 'Füge einen Bereich für Zertifikate und Ausbildungen hinzu mit Logos der Anbieter, Jahreszahlen und kurzen Beschreibungen.',
    icon: 'Award'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Qualifikationen',
    title: 'Expertise-Badges',
    prompt: 'Erstelle visuelle Badges für Spezialisierungen wie Balayage, Brautstyling, Colorationen, Herrenschnitte etc.',
    icon: 'BadgeCheck'
  },
  {
    pageType: 'ueber-uns',
    targetRole: 'SALON_OWNER',
    category: 'Team',
    title: 'Team-Karten',
    prompt: 'Zeige alle Teammitglieder als Karten mit Foto, Name, Position, kurzer Bio und Social-Links.',
    icon: 'Users'
  },
  {
    pageType: 'ueber-uns',
    targetRole: 'SALON_OWNER',
    category: 'Team',
    title: 'Team-Slider',
    prompt: 'Erstelle einen horizontalen Slider durch das Team mit großen Bildern und ausführlichen Bios bei Klick oder Hover.',
    icon: 'GalleryHorizontal'
  },
  {
    pageType: 'ueber-uns',
    targetRole: 'SALON_OWNER',
    category: 'Team',
    title: 'Team-Grid',
    prompt: 'Präsentiere das Team in einem eleganten 3-Spalten Grid mit Hover-Effekten die mehr Infos anzeigen.',
    icon: 'Grid3x3'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Philosophie',
    title: 'Werte-Sektion',
    prompt: 'Füge einen Bereich mit 3-4 Kernwerten hinzu, jeweils mit Icon, Titel und kurzer Beschreibung. Z.B. Qualität, Kreativität, Kundenservice.',
    icon: 'Heart'
  },
  {
    pageType: 'ueber-uns',
    targetRole: 'SALON_OWNER',
    category: 'Philosophie',
    title: 'Vision & Mission',
    prompt: 'Erstelle zwei separate, visuell ansprechende Boxen für Vision und Mission Statement des Salons.',
    icon: 'Target'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Galerie',
    title: 'Hinter den Kulissen',
    prompt: 'Füge eine Galerie mit authentischen Fotos vom Arbeitsplatz, Team-Events und Momenten hinter den Kulissen hinzu.',
    icon: 'Camera'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Zahlen',
    title: 'Statistiken',
    prompt: 'Zeige beeindruckende Zahlen: Jahre Erfahrung, zufriedene Kunden, Ausbildungen, Wettbewerbe. Mit animierten Countdowns.',
    icon: 'TrendingUp'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Awards',
    title: 'Auszeichnungen',
    prompt: 'Präsentiere gewonnene Awards und Wettbewerbe mit Logos, Jahreszahlen und kurzen Beschreibungen in einem Grid.',
    icon: 'Trophy'
  },
  {
    pageType: 'ueber-mich',
    targetRole: 'BOTH',
    category: 'Quote',
    title: 'Persönliches Zitat',
    prompt: 'Füge ein großes, inspirierendes persönliches Zitat als visuelles Stilmittel hinzu. Mit eleganter Typografie.',
    icon: 'Quote'
  }
]

// ============================================
// PORTFOLIO / GALERIE - 12 Prompts
// ============================================
const portfolioPrompts: PromptData[] = [
  {
    pageType: 'portfolio',
    targetRole: 'BOTH',
    category: 'Grid',
    title: 'Masonry-Grid',
    prompt: 'Erstelle eine Masonry-Galerie mit unterschiedlich großen Bildern und eleganten Hover-Effekten die den Titel anzeigen.',
    icon: 'LayoutGrid'
  },
  {
    pageType: 'galerie',
    targetRole: 'BOTH',
    category: 'Grid',
    title: 'Gleichmäßiges Grid',
    prompt: 'Zeige alle Bilder in einem sauberen 3x3 oder 4x4 Grid mit gleichen Abständen und einheitlichen Größen.',
    icon: 'Grid3x3'
  },
  {
    pageType: 'portfolio',
    targetRole: 'BOTH',
    category: 'Filter',
    title: 'Kategorie-Filter',
    prompt: 'Füge Filter-Buttons hinzu um nach Kategorien zu sortieren: Damen, Herren, Farbe, Schnitt, Styling. Mit Animation beim Filtern.',
    icon: 'Filter'
  },
  {
    pageType: 'galerie',
    targetRole: 'BOTH',
    category: 'Lightbox',
    title: 'Bild-Lightbox',
    prompt: 'Implementiere eine elegante Lightbox die Bilder beim Klick groß anzeigt mit Vor/Zurück-Navigation und Schließen-Button.',
    icon: 'Maximize'
  },
  {
    pageType: 'portfolio',
    targetRole: 'BOTH',
    category: 'Vorher/Nachher',
    title: 'Vorher/Nachher Slider',
    prompt: 'Erstelle interaktive Vorher/Nachher Vergleiche mit einem Slider den man ziehen kann um die Transformation zu sehen.',
    icon: 'SplitSquareHorizontal'
  },
  {
    pageType: 'portfolio',
    targetRole: 'BOTH',
    category: 'Vorher/Nachher',
    title: 'Flip-Karten',
    prompt: 'Zeige Vorher/Nachher als Karten die sich beim Hover oder Klick umdrehen und das Ergebnis zeigen.',
    icon: 'FlipHorizontal'
  },
  {
    pageType: 'galerie',
    targetRole: 'BOTH',
    category: 'Video',
    title: 'Video-Integration',
    prompt: 'Füge Videos zwischen den Bildern hinzu mit Auto-Play beim Hover und Mute-Option. Videos im gleichen Grid-Format.',
    icon: 'Video'
  },
  {
    pageType: 'portfolio',
    targetRole: 'BOTH',
    category: 'Beschreibung',
    title: 'Bild-Beschriftungen',
    prompt: 'Füge zu jedem Bild eine elegante Beschriftung hinzu mit angewandter Technik, verwendeten Produkten und kurzer Beschreibung.',
    icon: 'Text'
  },
  {
    pageType: 'portfolio',
    targetRole: 'BOTH',
    category: 'Featured',
    title: 'Highlight-Arbeiten',
    prompt: 'Hebe 3-4 der besten Arbeiten besonders hervor mit größerer Darstellung und detaillierter Beschreibung am Seitenanfang.',
    icon: 'Star'
  },
  {
    pageType: 'galerie',
    targetRole: 'BOTH',
    category: 'Kategorien',
    title: 'Kategorie-Seiten',
    prompt: 'Unterteile die Galerie in klar getrennte Bereiche für verschiedene Haar-Typen und Styles mit eigenen Überschriften.',
    icon: 'FolderOpen'
  },
  {
    pageType: 'galerie',
    targetRole: 'BOTH',
    category: 'Performance',
    title: 'Lazy-Loading',
    prompt: 'Implementiere Lazy-Loading für die Bilder damit sie erst geladen werden wenn sie ins Sichtfeld scrollen.',
    icon: 'Loader'
  },
  {
    pageType: 'galerie',
    targetRole: 'BOTH',
    category: 'Performance',
    title: 'Infinite Scroll',
    prompt: 'Ersetze die Pagination durch Infinite Scroll für nahtloses Durchstöbern der Galerie ohne Seitenwechsel.',
    icon: 'ArrowDownCircle'
  }
]

// ============================================
// LEISTUNGEN / PREISE - 15 Prompts
// ============================================
const servicesPrompts: PromptData[] = [
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Preisliste',
    title: 'Übersichtliche Preisliste',
    prompt: 'Erstelle eine klar strukturierte Preisliste mit Kategorien: Damen, Herren, Kinder, Spezialbehandlungen. Jeder Service mit Preis und kurzer Beschreibung.',
    icon: 'List'
  },
  {
    pageType: 'preise',
    targetRole: 'SALON_OWNER',
    category: 'Preisliste',
    title: 'Preistabelle',
    prompt: 'Zeige Preise in einer eleganten Tabelle mit Service-Namen, Beschreibung, Dauer und Preis in übersichtlichen Spalten.',
    icon: 'Table'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Preisliste',
    title: 'Preis-Karten',
    prompt: 'Präsentiere jeden Service als einzelne Karte mit passendem Icon, Beschreibung, Dauer und Preis. Hover-Effekt für Details.',
    icon: 'CreditCard'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Kategorien',
    title: 'Tab-Navigation',
    prompt: 'Organisiere Services in Tabs: Schneiden, Färben, Styling, Pflege. Jeder Tab zeigt nur die relevanten Services.',
    icon: 'FolderKanban'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Kategorien',
    title: 'Akkordeon',
    prompt: 'Verwende ein Akkordeon-Layout zum Ein- und Ausklappen der Kategorien. Standardmäßig ist die erste Kategorie geöffnet.',
    icon: 'ChevronDown'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Pakete',
    title: 'Paket-Angebote',
    prompt: 'Erstelle 3 Pakete (Basic, Premium, Luxus) mit unterschiedlichen Leistungen und Preisen. Das Premium-Paket visuell hervorheben.',
    icon: 'Package'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Pakete',
    title: 'Highlight-Paket',
    prompt: 'Hebe ein empfohlenes Paket visuell besonders hervor mit "Beliebteste Wahl" Badge, anderer Farbe und Größe.',
    icon: 'Gem'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Details',
    title: 'Service-Details',
    prompt: 'Füge zu jedem Service eine ausklappbare Detailbeschreibung hinzu mit Informationen zu Ablauf, Dauer und inkludierten Leistungen.',
    icon: 'Info'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Details',
    title: 'Zeitangaben',
    prompt: 'Zeige die ungefähre Dauer jedes Services mit Uhr-Icon an. Format: ca. 30 Min., ca. 1-2 Std.',
    icon: 'Clock'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Bilder',
    title: 'Services mit Bildern',
    prompt: 'Füge zu jeder Kategorie oder jedem Service ein passendes Beispielbild hinzu das das Ergebnis zeigt.',
    icon: 'Image'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Badges',
    title: 'Beliebte Services',
    prompt: 'Markiere die beliebtesten Services mit einem "Bestseller" oder "Beliebt" Badge neben dem Namen.',
    icon: 'Flame'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Badges',
    title: 'Neue Services',
    prompt: 'Hebe neue Angebote mit einem auffälligen "NEU" Badge hervor und positioniere sie prominent.',
    icon: 'Sparkles'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'Rabatt',
    title: 'Angebote anzeigen',
    prompt: 'Zeige aktuelle Rabatte und Sonderangebote prominent am Seitenanfang in einem farbigen Banner.',
    icon: 'Percent'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'CTA',
    title: 'Terminbuchung',
    prompt: 'Füge nach jeder Kategorie oder am Seitenende einen deutlichen "Jetzt Termin buchen" Button hinzu.',
    icon: 'CalendarPlus'
  },
  {
    pageType: 'leistungen',
    targetRole: 'BOTH',
    category: 'FAQ',
    title: 'Häufige Fragen',
    prompt: 'Füge einen FAQ-Bereich am Seitenende hinzu mit häufig gestellten Fragen zu Preisen, Dauer und Services.',
    icon: 'HelpCircle'
  }
]

// ============================================
// KONTAKT - 12 Prompts
// ============================================
const contactPrompts: PromptData[] = [
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Formular',
    title: 'Kontaktformular erweitern',
    prompt: 'Erweitere das Kontaktformular um Felder für gewünschten Service (Dropdown), bevorzugte Uhrzeit und eine Nachricht.',
    icon: 'FormInput'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Formular',
    title: 'Mehrstufiges Formular',
    prompt: 'Erstelle ein mehrstufiges Formular: 1. Service wählen, 2. Wunschtermin, 3. Kontaktdaten. Mit Fortschrittsanzeige.',
    icon: 'ListOrdered'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Formular',
    title: 'Floating Labels',
    prompt: 'Verwende moderne Floating Labels für ein elegantes Formular-Design. Label schwebt nach oben wenn Feld aktiv.',
    icon: 'Tag'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Karte',
    title: 'Google Maps',
    prompt: 'Füge eine interaktive Google Map mit Standort-Marker und Zoom-Funktionen hinzu. Mit Link zu Google Maps Navigation.',
    icon: 'Map'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Karte',
    title: 'Stilisierte Karte',
    prompt: 'Integriere eine Karte im Graustufen-Look passend zum Design mit farbigem Marker für den Standort.',
    icon: 'MapPin'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Info',
    title: 'Kontakt-Karten',
    prompt: 'Zeige Adresse, Telefon und E-Mail als separate Karten mit Icons. Telefon und E-Mail sind klickbar.',
    icon: 'Contact'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Info',
    title: 'Öffnungszeiten',
    prompt: 'Präsentiere die Öffnungszeiten übersichtlich in einer Tabelle oder Liste. Aktueller Tag hervorgehoben.',
    icon: 'Clock'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Info',
    title: 'Anfahrt',
    prompt: 'Füge eine Anfahrtsbeschreibung hinzu mit ÖPNV-Anbindung, Parkplatz-Infos und Wegbeschreibung.',
    icon: 'Navigation'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Social',
    title: 'Social Media Links',
    prompt: 'Füge große, auffällige Social-Media-Buttons für Instagram, Facebook und TikTok hinzu mit Hover-Effekten.',
    icon: 'Share2'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Social',
    title: 'WhatsApp-Button',
    prompt: 'Füge einen WhatsApp-Kontakt-Button hinzu für schnelle Anfragen. Klick öffnet WhatsApp mit vordefiniertem Text.',
    icon: 'MessageCircle'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'Layout',
    title: 'Zwei-Spalten',
    prompt: 'Teile die Seite in zwei Spalten: links Kontaktinfos, Öffnungszeiten und Karte, rechts das Kontaktformular.',
    icon: 'LayoutPanelLeft'
  },
  {
    pageType: 'kontakt',
    targetRole: 'BOTH',
    category: 'CTA',
    title: 'Termin-CTA',
    prompt: 'Füge einen prominenten "Jetzt Termin vereinbaren" Button am Seitenanfang hinzu der zum Formular scrollt.',
    icon: 'CalendarCheck'
  }
]

// ============================================
// TEAM - 8 Prompts (nur Salon)
// ============================================
const teamPrompts: PromptData[] = [
  {
    pageType: 'team',
    targetRole: 'SALON_OWNER',
    category: 'Layout',
    title: 'Team-Grid',
    prompt: 'Zeige alle Stylisten in einem eleganten Grid mit Hover-Effekten. Bei Hover erscheint Overlay mit Kurz-Bio und Spezialisierungen.',
    icon: 'Grid3x3'
  },
  {
    pageType: 'team',
    targetRole: 'SALON_OWNER',
    category: 'Layout',
    title: 'Karussell',
    prompt: 'Erstelle einen horizontalen Slider durch das Team mit großen Profilbildern, Namen und Spezialisierung.',
    icon: 'GalleryHorizontal'
  },
  {
    pageType: 'team',
    targetRole: 'SALON_OWNER',
    category: 'Details',
    title: 'Ausführliche Profile',
    prompt: 'Erweitere jedes Profil um Spezialisierungen, Jahre Erfahrung, Ausbildungen und persönliches Statement.',
    icon: 'FileUser'
  },
  {
    pageType: 'team',
    targetRole: 'SALON_OWNER',
    category: 'Details',
    title: 'Klappbare Bios',
    prompt: 'Mache die ausführlichen Bios ausklappbar um die Seite übersichtlich zu halten. Klick auf Name öffnet Details.',
    icon: 'ChevronDown'
  },
  {
    pageType: 'team',
    targetRole: 'SALON_OWNER',
    category: 'Buchung',
    title: 'Direkte Buchung',
    prompt: 'Füge zu jedem Teammitglied einen "Bei [Name] buchen" Button hinzu der zur Terminbuchung führt.',
    icon: 'CalendarPlus'
  },
  {
    pageType: 'team',
    targetRole: 'SALON_OWNER',
    category: 'Qualifikation',
    title: 'Badges',
    prompt: 'Zeige Zertifikate und Spezialisierungen als farbige Badges unter jedem Namen. Z.B. Balayage, Brautstyling.',
    icon: 'BadgeCheck'
  },
  {
    pageType: 'team',
    targetRole: 'SALON_OWNER',
    category: 'Social',
    title: 'Persönliche Socials',
    prompt: 'Füge Instagram-Links zu jedem Teammitglied hinzu mit Icon. Optional auch andere Social-Media-Profile.',
    icon: 'Instagram'
  },
  {
    pageType: 'team',
    targetRole: 'SALON_OWNER',
    category: 'Highlight',
    title: 'Salon-Inhaber',
    prompt: 'Hebe den Salon-Inhaber visuell als erstes und größtes Profil hervor mit ausführlicherer Beschreibung.',
    icon: 'Crown'
  }
]

// ============================================
// IMPRESSUM - 6 Prompts
// ============================================
const impressumPrompts: PromptData[] = [
  {
    pageType: 'impressum',
    targetRole: 'BOTH',
    category: 'Layout',
    title: 'Übersichtliches Layout',
    prompt: 'Strukturiere das Impressum übersichtlich mit klaren Überschriften, guten Abständen und lesbarer Typografie.',
    icon: 'FileText'
  },
  {
    pageType: 'impressum',
    targetRole: 'BOTH',
    category: 'Layout',
    title: 'Zwei-Spalten',
    prompt: 'Teile die Seite auf Desktop in zwei Spalten: Impressum links, Datenschutz rechts für bessere Übersicht.',
    icon: 'LayoutPanelLeft'
  },
  {
    pageType: 'impressum',
    targetRole: 'BOTH',
    category: 'Navigation',
    title: 'Tab-Navigation',
    prompt: 'Verwende Tabs für Impressum, Datenschutz und AGB um zwischen den rechtlichen Texten zu wechseln.',
    icon: 'FolderKanban'
  },
  {
    pageType: 'impressum',
    targetRole: 'BOTH',
    category: 'Design',
    title: 'Ansprechend gestalten',
    prompt: 'Mache die rechtlichen Seiten visuell ansprechender mit dezenten Design-Elementen, Icons und besserer Typografie.',
    icon: 'Palette'
  },
  {
    pageType: 'impressum',
    targetRole: 'BOTH',
    category: 'Kontakt',
    title: 'Kontakt-Box',
    prompt: 'Füge eine deutlich sichtbare Kontakt-Box für Datenschutz-Anfragen hinzu mit E-Mail-Adresse.',
    icon: 'Mail'
  },
  {
    pageType: 'impressum',
    targetRole: 'BOTH',
    category: 'Navigation',
    title: 'Zurück-Navigation',
    prompt: 'Füge einen deutlichen "Zurück zur Startseite" Button am Seitenanfang und -ende hinzu.',
    icon: 'ArrowLeft'
  }
]

// ============================================
// ALLGEMEINE PROMPTS (alle Seiten) - 18 Prompts
// ============================================
const generalPrompts: PromptData[] = [
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Farben',
    title: 'Hauptfarbe ändern',
    prompt: 'Ändere die Hauptfarbe der Seite zu einem warmen Goldton und passe alle Buttons, Links und Akzente entsprechend an.',
    icon: 'Palette'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Farben',
    title: 'Dunkler Modus',
    prompt: 'Erstelle eine Dark-Mode Version der Seite mit dunklem Hintergrund (#121212), hellen Texten und angepassten Akzentfarben.',
    icon: 'Moon'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Farben',
    title: 'Goldakzente',
    prompt: 'Füge elegante Goldakzente (#D4AF37) zu Überschriften, Buttons und dekorativen Elementen hinzu.',
    icon: 'Gem'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Farben',
    title: 'Pastell-Palette',
    prompt: 'Verwende eine sanfte Pastell-Farbpalette mit Rosa, Lavendel und Mintgrün für ein feminines Design.',
    icon: 'Flower'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Schrift',
    title: 'Größere Überschriften',
    prompt: 'Mache alle Überschriften 20% größer und verwende eine mutigere, auffälligere Schriftart für mehr Präsenz.',
    icon: 'Type'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Schrift',
    title: 'Elegante Schrift',
    prompt: 'Verwende eine elegante Serifenschrift wie Playfair Display für Überschriften. Fließtext bleibt Sans-Serif.',
    icon: 'Underline'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Schrift',
    title: 'Moderne Schrift',
    prompt: 'Verwende eine cleane, moderne Sans-Serif Schrift wie Inter oder Montserrat durchgehend für ein zeitgemäßes Design.',
    icon: 'ALargeSmall'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Abstände',
    title: 'Mehr Weißraum',
    prompt: 'Erhöhe die Abstände zwischen allen Sektionen für ein luftigeres, moderneres Design mit mehr Weißraum.',
    icon: 'Expand'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Abstände',
    title: 'Kompakter',
    prompt: 'Reduziere die Abstände für eine kompaktere Darstellung mit weniger Scrollen.',
    icon: 'Shrink'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Mobile',
    title: 'Mobile optimieren',
    prompt: 'Optimiere die Seite für Smartphones: größere Touch-Targets, bessere Lesbarkeit, angepasste Navigation.',
    icon: 'Smartphone'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Bilder',
    title: 'Bilder größer',
    prompt: 'Mache alle Bilder auf der Seite größer und prominenter. Nutze mehr Platz für visuelle Elemente.',
    icon: 'ImagePlus'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Bilder',
    title: 'Bilder rund',
    prompt: 'Gib allen Bildern abgerundete Ecken (16px Radius) oder mache Profilbilder kreisförmig.',
    icon: 'Circle'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Animation',
    title: 'Mehr Animationen',
    prompt: 'Füge mehr Einblende- und Hover-Animationen für ein dynamischeres, interaktiveres Gefühl hinzu.',
    icon: 'Wand2'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Animation',
    title: 'Weniger Animationen',
    prompt: 'Reduziere Animationen auf ein Minimum für ein ruhigeres, professionelleres Erscheinungsbild.',
    icon: 'Pause'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Buttons',
    title: 'Buttons auffälliger',
    prompt: 'Mache alle Buttons größer, farbiger mit deutlichen Hover-Effekten und Schatten für mehr Klick-Anreiz.',
    icon: 'MousePointerClick'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Footer',
    title: 'Footer erweitern',
    prompt: 'Erweitere den Footer um Newsletter-Anmeldung, Social Links, Sitemap und Öffnungszeiten.',
    icon: 'PanelBottom'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'Footer',
    title: 'Minimaler Footer',
    prompt: 'Reduziere den Footer auf das Wesentliche: nur Copyright, wichtige Links und Social Icons in einer Zeile.',
    icon: 'Minus'
  },
  {
    pageType: 'all',
    targetRole: 'BOTH',
    category: 'SEO',
    title: 'Meta-Daten optimieren',
    prompt: 'Optimiere Title und Description für bessere Suchmaschinen-Ergebnisse. Füge strukturierte Daten hinzu.',
    icon: 'Search'
  }
]

// Alle Prompts zusammenführen
const allPrompts: PromptData[] = [
  ...homePrompts,
  ...aboutPrompts,
  ...portfolioPrompts,
  ...servicesPrompts,
  ...contactPrompts,
  ...teamPrompts,
  ...impressumPrompts,
  ...generalPrompts
]

/**
 * POST /api/admin/homepage-prompts/seed
 * Seeded alle Homepage-Prompts
 */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    console.log('🌱 Seeding Homepage Prompts...')
    console.log(`📊 ${allPrompts.length} Prompts werden eingefügt...`)

    // Bestehende Prompts löschen
    await prisma.homepagePrompt.deleteMany({})
    console.log('🗑️  Bestehende Prompts gelöscht')

    // Prompts mit sortOrder einfügen
    let sortOrder = 0
    const createdPrompts = []

    for (const promptData of allPrompts) {
      const prompt = await prisma.homepagePrompt.create({
        data: {
          ...promptData,
          sortOrder: sortOrder++
        }
      })
      createdPrompts.push(prompt)
    }

    console.log(`✅ ${createdPrompts.length} Prompts erfolgreich erstellt!`)

    // Statistiken
    const stats = {
      total: createdPrompts.length,
      byPageType: {} as Record<string, number>,
      byTargetRole: {} as Record<string, number>
    }

    createdPrompts.forEach(p => {
      stats.byPageType[p.pageType] = (stats.byPageType[p.pageType] || 0) + 1
      stats.byTargetRole[p.targetRole] = (stats.byTargetRole[p.targetRole] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      message: `${createdPrompts.length} Prompts erfolgreich erstellt`,
      stats
    })
  } catch (error) {
    console.error('❌ Fehler beim Seeding:', error)
    return NextResponse.json(
      { error: 'Fehler beim Seeding der Prompts' },
      { status: 500 }
    )
  }
}



