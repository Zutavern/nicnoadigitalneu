import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 20 lustige, originelle Fehlermeldungen pro Fehlertyp - Friseur/Salon-Thema
const errorMessages = {
  '404': [
    'Diese Seite wurde leider von einem zu eifrigen Stylisten weggeschnitten! ✂️',
    '404? Das ist wie ein Termin, der einfach nicht erscheint. Wir kennen das!',
    'Diese Seite ist gerade beim Friseur. Sie kommt gleich wieder!',
    'Ups! Diese Seite hat sich einen neuen Look verpasst und ist umgezogen.',
    'Diese Seite ist wie eine verschwundene Haarspange - unauffindbar!',
    'Hier war mal eine Seite, aber sie wurde föhngetrocknet und ist davongeflogen 💨',
    'Diese URL hat ihren Termin verpasst. Typisch Montag!',
    'Seite nicht gefunden - vermutlich beim Strähnchen-Marathon.',
    'Diese Seite macht gerade eine Haarkur und ist nicht verfügbar.',
    '404 - Unsere Schere hat hier versehentlich zu viel abgeschnitten!',
    'Diese Seite ist wie ein guter Stuhlmieter - gerade woanders beschäftigt.',
    'Ups! Hier ist nur Haarspray-Nebel. Die Seite ist verdampft.',
    'Diese URL braucht dringend einen neuen Schnitt - sie existiert nicht mehr.',
    'Seite vermisst! Zuletzt gesehen: beim Lockenwickeln.',
    'Diese Seite hat sich in den Salon-Keller verirrt. Wir suchen!',
    '404 - Selbst unser bester Stylist kann diese Frisur... äh, Seite nicht retten.',
    'Diese Seite wurde ausgebürstet und ist jetzt weg.',
    'Hier sollte eine Seite sein, aber sie ist beim Afterwork-Drink.',
    'Diese URL hat Spliss bekommen und musste entfernt werden.',
    'Seite nicht gefunden - sie ist wahrscheinlich unter einem Haufen Haare begraben.',
  ],
  '500': [
    'Oh nein! Unser Server hat einen schlechten Haartag. Wir arbeiten daran!',
    'Unser Server ist gerade beim Glätten - manchmal gibt es Kurzschlüsse! ⚡',
    '500? Das ist wie wenn die Schere klemmt. Wir beheben das sofort!',
    'Unser Server hat sich einen Knoten gemacht. Wir kämmen das gerade aus!',
    'Der Föhn hat unseren Server überhitzt. Kurze Abkühlpause!',
    'Unser Server hat zu viel Haarspray abbekommen und ist benebelt.',
    '500 - Der Server braucht eine Intensiv-Kur. Dauert nicht lange!',
    'Technischer Haarausfall! Wir transplantieren gerade neue Bytes.',
    'Unser Server hat einen Farbunfall. Wir waschen das aus!',
    'Serverprobleme - wie ein verstopfter Abfluss voller Haare.',
    'Unser digitaler Stuhl ist gerade zusammengebrochen. Reparatur läuft!',
    '500 - Der Server macht gerade eine Dauerwelle durch.',
    'Ups! Unsere Serverfarbe ist ausgelaufen. Techniker ist informiert!',
    'Der Server hat sich beim Rasieren geschnitten. Erste Hilfe!',
    'Systemfehler - wie wenn der Lockenstab den Geist aufgibt.',
    'Unser Server braucht dringend einen Termin beim IT-Friseur.',
    '500 - Die digitalen Strähnen haben sich verheddert.',
    'Server überlastet - zu viele Termine auf einmal gebucht!',
    'Technische Spliss-Probleme. Wir schneiden das raus!',
    'Unser Server macht gerade Inventur im Produktregal.',
  ],
  '403': [
    'Hey! Diese Seite ist nur für VIP-Kunden. Bist du schon Stammkunde? 💎',
    '403? Dieser Bereich ist wie der Privatraum im Salon - nur für Auserwählte!',
    'Zutritt verboten - hier werden gerade Promi-Frisuren gestylt.',
    'Diese Seite ist reserviert wie unser bester Stuhl am Samstag.',
    'Kein Zugang! Hier ist die geheime Rezeptur für perfekte Locken.',
    '403 - Du brauchst den goldenen Kamm, um hier reinzukommen!',
    'Diese Seite ist wie ein exklusiver Salon - nur mit Einladung.',
    'Stopp! Hier dürfen nur zertifizierte Stuhlmieter rein.',
    'Zugang verweigert - dieser Bereich ist für Salon-Besitzer reserviert.',
    'Diese Seite ist hinter dem VIP-Vorhang. Premium-Abo nötig!',
    '403 - Hier werden Betriebsgeheimnisse aufbewahrt (und Scheren).',
    'Kein Zutritt ohne Terminkarte! Bitte am Empfang melden.',
    'Diese Seite ist wie der Tresor mit den teuren Produkten - verschlossen.',
    'Zugang nur für registrierte Stylisten. Bist du einer?',
    '403 - Hier ist der Mitarbeiterbereich. Kunden bitte draußen warten.',
    'Diese Seite erfordert den geheimen Handshake der Friseur-Gilde.',
    'Verbotener Bereich - hier lagern wir das gute Shampoo!',
    'Kein Zugang! Hier wird gerade ein Meisterwerk kreiert.',
    '403 - Diese Tür öffnet sich nur mit dem richtigen Passwort.',
    'Reservierter Bereich - wie ein gebuchter Termin.',
  ],
  '401': [
    'Hey! Du musst dich erst anmelden, bevor du hier rein kannst! 🔐',
    '401? Wir kennen dich noch nicht - bitte erst registrieren!',
    'Ohne Login kein Styling! Bitte melde dich an.',
    'Diese Seite braucht deine Kundenkarte. Bitte einloggen!',
    'Wer bist du? Unser System kennt dich nicht. Ab zur Anmeldung!',
    '401 - Bitte stell dich vor, bevor du unseren Salon betrittst.',
    'Anmeldung erforderlich - wie ein Termin im echten Salon.',
    'Ohne Termin kein Service! Bitte erst einloggen.',
    'Unbekannter Gast! Registriere dich und werde Teil der Familie.',
    '401 - Dein Name steht nicht auf der Liste. Noch nicht.',
    'Login vergessen? Passiert den Besten beim frühen Morgentermin!',
    'Diese Seite öffnet sich nur mit deinem persönlichen Schlüssel.',
    'Wir brauchen deine Daten - für den perfekten Service!',
    '401 - Bitte zeig uns deinen Mitgliedsausweis (Login).',
    'Ohne Anmeldung kein Zutritt - wie bei einem exklusiven Event.',
    'Dein Browser hat vergessen, wer du bist. Bitte erneut anmelden.',
    'Authentifizierung erforderlich - wir wollen wissen, wem wir die Haare schneiden!',
    '401 - Bitte klingel an und sag uns deinen Namen.',
    'Unbekannter Besucher! Melde dich an für das volle Erlebnis.',
    'Diese Seite ist wie ein Privatraum - erst anklopfen (einloggen)!',
  ],
}

export async function POST() {
  try {
    let created = 0
    let updated = 0
    let skipped = 0

    for (const [errorType, messages] of Object.entries(errorMessages)) {
      for (let i = 0; i < messages.length; i++) {
        const id = `${errorType}-${i}`
        
        try {
          // Prüfe ob bereits existiert
          const existing = await prisma.errorMessage.findUnique({
            where: { id },
          })

          if (existing) {
            // Update nur wenn Nachricht anders ist
            if (existing.message !== messages[i]) {
              await prisma.errorMessage.update({
                where: { id },
                data: {
                  message: messages[i],
                  isActive: true,
                },
              })
              updated++
            } else {
              skipped++
            }
          } else {
            await prisma.errorMessage.create({
              data: {
                id,
                errorType,
                message: messages[i],
                isActive: true,
                sortOrder: i,
              },
            })
            created++
          }
        } catch (err) {
          console.error(`Error processing ${id}:`, err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ Error messages seeded!`,
      stats: {
        created,
        updated,
        skipped,
        total: created + updated + skipped,
      },
    })
  } catch (error) {
    console.error('Error seeding error messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed error messages' },
      { status: 500 }
    )
  }
}

// GET zum Abrufen aller Fehlermeldungen
export async function GET() {
  try {
    const messages = await prisma.errorMessage.findMany({
      orderBy: [{ errorType: 'asc' }, { sortOrder: 'asc' }],
    })

    const grouped = messages.reduce((acc, msg) => {
      if (!acc[msg.errorType]) {
        acc[msg.errorType] = []
      }
      acc[msg.errorType].push(msg)
      return acc
    }, {} as Record<string, typeof messages>)

    return NextResponse.json({
      success: true,
      total: messages.length,
      byType: {
        '401': grouped['401']?.length || 0,
        '403': grouped['403']?.length || 0,
        '404': grouped['404']?.length || 0,
        '500': grouped['500']?.length || 0,
      },
      messages: grouped,
    })
  } catch (error) {
    console.error('Error fetching error messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch error messages' },
      { status: 500 }
    )
  }
}





