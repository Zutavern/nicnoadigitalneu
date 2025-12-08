import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use DIRECT_DATABASE_URL for direct TCP connection (not the HTTP-based prisma+postgres:// URL)
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const errorMessages = {
  '404': [
    'Hey, wir schneiden gerade Haare. Deshalb ist unser Server langsam.',
    'Haben wir aber keine Batterie mehr, weil wir sie für unseren Rasierer gebraucht haben?',
    'Diese Seite wurde leider von einem zu eifrigen Stylisten weggeschnitten! ✂️',
    '404? Das ist wie ein Termin, der einfach nicht erscheint. Wir kennen das!',
    'Diese Seite ist gerade beim Friseur. Sie kommt gleich wieder!',
    'Ups! Diese Seite hat sich einen neuen Look verpasst und ist umgezogen.',
    '404 - Wir haben überall gesucht, aber diese Seite ist wie eine verschwundene Schere.',
    'Diese Seite ist gerade auf Kaffeepause. Komm später wieder! ☕',
    '404? Das ist wie ein Stuhl, der gerade gemietet ist - nicht verfügbar!',
    'Diese Seite wurde leider von einem Haarschnitt mitgenommen. Wir suchen sie!',
    '404 - Selbst unsere besten Stylisten können diese Seite nicht finden.',
    'Diese Seite ist gerade beim Farben. Sie braucht noch etwas Zeit!',
    '404? Das ist wie ein Termin, der einfach nicht erscheint. Wir kennen das!',
    'Diese Seite hat sich einen neuen Look verpasst und ist umgezogen.',
    'Ups! Diese Seite ist gerade beim Friseur. Sie kommt gleich wieder!',
    '404 - Wir haben überall gesucht, aber diese Seite ist wie eine verschwundene Schere.',
    'Diese Seite ist gerade auf Kaffeepause. Komm später wieder! ☕',
    '404? Das ist wie ein Stuhl, der gerade gemietet ist - nicht verfügbar!',
    'Diese Seite wurde leider von einem Haarschnitt mitgenommen. Wir suchen sie!',
    '404 - Selbst unsere besten Stylisten können diese Seite nicht finden.',
  ],
  '500': [
    'Oh nein! Unser Server hat einen schlechten Haartag. Wir arbeiten daran!',
    'Unser Server ist gerade beim Glätten - manchmal gibt es statische Aufladung!',
    '500? Das ist wie wenn die Schere klemmt. Wir beheben das sofort!',
    'Unser Server hat sich einen Knoten gemacht. Wir kämmen das gerade aus!',
    'Ups! Unser Server ist gerade beim Föhnen und hat einen Kurzschluss verursacht.',
    '500 - Unser Server braucht dringend eine Haarkur. Wir kümmern uns darum!',
    'Unser Server hat gerade eine schlechte Frisur bekommen. Wir stylen ihn neu!',
    '500? Das ist wie wenn die Farbe nicht hält. Wir mischen gerade eine neue!',
    'Unser Server ist gerade beim Schneiden und hat sich geschnitten. Ouch!',
    '500 - Unser Server braucht eine Pause. Selbst die besten Stylisten brauchen das!',
    'Unser Server hat gerade einen Haarschnitt bekommen und sieht jetzt anders aus.',
    '500? Das ist wie wenn der Föhn kaputt geht. Wir reparieren das sofort!',
    'Unser Server ist gerade beim Locken und hat sich verheddert.',
    '500 - Unser Server braucht dringend eine Massage. Wir kümmern uns darum!',
    'Unser Server hat gerade eine neue Frisur bekommen und braucht Zeit zum Eingewöhnen.',
    '500? Das ist wie wenn die Schere stumpf wird. Wir schärfen sie gerade!',
    'Unser Server ist gerade beim Färben und hat einen Fleck gemacht.',
    '500 - Unser Server braucht eine neue Batterie. Wir wechseln sie gerade!',
    'Unser Server hat gerade einen Termin verpasst. Wir holen das nach!',
    '500? Das ist wie wenn der Stuhl wackelt. Wir reparieren das sofort!',
  ],
  '403': [
    'Hey! Diese Seite ist nur für VIP-Kunden. Bist du schon Stammkunde?',
    '403? Das ist wie ein Stuhl, der nur für Premium-Mitglieder reserviert ist!',
    'Diese Seite ist gerade beim Friseur und nimmt keine neuen Termine an.',
    'Ups! Du brauchst einen speziellen Haarschnitt, um hier reinzukommen!',
    '403 - Diese Seite ist wie ein exklusiver Salon. Du brauchst eine Einladung!',
    'Diese Seite ist nur für unsere besten Stylisten. Bist du einer?',
    '403? Das ist wie ein Termin, der nur für Stammkunden verfügbar ist!',
    'Diese Seite ist gerade voll. Komm später wieder!',
    'Ups! Diese Seite ist wie ein Stuhl, der gerade gemietet ist.',
    '403 - Diese Seite ist nur für unsere Premium-Mitglieder. Upgrade doch!',
    'Diese Seite ist gerade beim Färben und nimmt keine neuen Termine an.',
    '403? Das ist wie ein exklusiver Salon. Du brauchst eine Einladung!',
    'Diese Seite ist nur für unsere besten Stylisten. Bist du einer?',
    '403 - Diese Seite ist wie ein Termin, der nur für Stammkunden verfügbar ist!',
    'Diese Seite ist gerade voll. Komm später wieder!',
    'Ups! Diese Seite ist wie ein Stuhl, der gerade gemietet ist.',
    '403 - Diese Seite ist nur für unsere Premium-Mitglieder. Upgrade doch!',
    'Diese Seite ist gerade beim Färben und nimmt keine neuen Termine an.',
    '403? Das ist wie ein exklusiver Salon. Du brauchst eine Einladung!',
    'Diese Seite ist nur für unsere besten Stylisten. Bist du einer?',
  ],
  '401': [
    'Hey! Du musst dich erst anmelden, bevor du hier rein kannst!',
    '401? Das ist wie ein Termin ohne Anmeldung. Bitte melde dich an!',
    'Diese Seite braucht deine Anmeldedaten. Wie ein Salon, der deinen Namen braucht!',
    'Ups! Du musst dich erst einloggen, bevor du hier rein kannst!',
    '401 - Diese Seite ist wie ein exklusiver Salon. Du brauchst eine Anmeldung!',
    'Diese Seite kennt dich noch nicht. Bitte melde dich an!',
    '401? Das ist wie ein Termin ohne Reservierung. Bitte melde dich an!',
    'Diese Seite braucht deine Anmeldedaten. Wie ein Salon, der deinen Namen braucht!',
    'Ups! Du musst dich erst einloggen, bevor du hier rein kannst!',
    '401 - Diese Seite ist wie ein exklusiver Salon. Du brauchst eine Anmeldung!',
    'Diese Seite kennt dich noch nicht. Bitte melde dich an!',
    '401? Das ist wie ein Termin ohne Reservierung. Bitte melde dich an!',
    'Diese Seite braucht deine Anmeldedaten. Wie ein Salon, der deinen Namen braucht!',
    'Ups! Du musst dich erst einloggen, bevor du hier rein kannst!',
    '401 - Diese Seite ist wie ein exklusiver Salon. Du brauchst eine Anmeldung!',
    'Diese Seite kennt dich noch nicht. Bitte melde dich an!',
    '401? Das ist wie ein Termin ohne Reservierung. Bitte melde dich an!',
    'Diese Seite braucht deine Anmeldedaten. Wie ein Salon, der deinen Namen braucht!',
    'Ups! Du musst dich erst einloggen, bevor du hier rein kannst!',
    '401 - Diese Seite ist wie ein exklusiver Salon. Du brauchst eine Anmeldung!',
  ],
}

async function main() {
  console.log('🌱 Seeding error messages...')

  for (const [errorType, messages] of Object.entries(errorMessages)) {
    for (let i = 0; i < messages.length; i++) {
      // Prüfe ob bereits existiert
      const existing = await prisma.errorMessage.findUnique({
        where: { id: `${errorType}-${i}` },
      })

      if (existing) {
        await prisma.errorMessage.update({
          where: { id: `${errorType}-${i}` },
          data: {
            message: messages[i],
            isActive: true,
          },
        })
      } else {
        await prisma.errorMessage.create({
          data: {
            id: `${errorType}-${i}`,
            errorType,
            message: messages[i],
            isActive: true,
            sortOrder: i,
          },
        })
      }
    }
  }

  console.log('✅ Error messages seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

