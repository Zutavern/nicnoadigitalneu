import { prisma } from '@/lib/prisma'
import type { MediaUsage } from './types'

/**
 * Prüft, wo eine Medien-Datei verwendet wird
 * Durchsucht alle relevanten Tabellen nach der URL
 */
export async function findMediaUsages(url: string): Promise<MediaUsage[]> {
  const usages: MediaUsage[] = []

  try {
    // 1. Blog Posts - Featured Image
    const blogPosts = await prisma.blogPost.findMany({
      where: { featuredImage: url },
      select: { id: true, title: true },
    })
    for (const post of blogPosts) {
      usages.push({
        type: 'BLOG_POST',
        entityType: 'Blog-Artikel',
        entityId: post.id,
        entityName: post.title,
        field: 'featuredImage',
      })
    }
  } catch (e) {
    console.warn('Error checking blog posts:', e)
  }

  try {
    // 2. Blog Authors - Avatar
    const blogAuthors = await prisma.blogAuthor.findMany({
      where: { avatar: url },
      select: { id: true, name: true },
    })
    for (const author of blogAuthors) {
      usages.push({
        type: 'BLOG_AUTHOR',
        entityType: 'Blog-Autor',
        entityId: author.id,
        entityName: author.name,
        field: 'avatar',
      })
    }
  } catch (e) {
    console.warn('Error checking blog authors:', e)
  }

  try {
    // 3. Print Materials - Background Images
    const printMaterialsFront = await prisma.printMaterial.findMany({
      where: { frontBackgroundUrl: url },
      select: { id: true, name: true },
    })
    for (const pm of printMaterialsFront) {
      usages.push({
        type: 'PRINT_MATERIAL',
        entityType: 'Drucksache',
        entityId: pm.id,
        entityName: pm.name,
        field: 'frontBackgroundUrl',
      })
    }
  } catch (e) {
    console.warn('Error checking print materials front:', e)
  }

  try {
    const printMaterialsBack = await prisma.printMaterial.findMany({
      where: { backBackgroundUrl: url },
      select: { id: true, name: true },
    })
    for (const pm of printMaterialsBack) {
      usages.push({
        type: 'PRINT_MATERIAL',
        entityType: 'Drucksache',
        entityId: pm.id,
        entityName: pm.name,
        field: 'backBackgroundUrl',
      })
    }
  } catch (e) {
    console.warn('Error checking print materials back:', e)
  }

  try {
    // 4. Print Blocks - Images
    const printBlocks = await prisma.printBlock.findMany({
      where: { imageUrl: url },
      select: { 
        id: true, 
        printMaterial: { 
          select: { id: true, name: true } 
        } 
      },
    })
    for (const block of printBlocks) {
      usages.push({
        type: 'PRINT_BLOCK',
        entityType: 'Drucksachen-Block',
        entityId: block.id,
        entityName: block.printMaterial?.name || 'Unbekannt',
        field: 'imageUrl',
      })
    }
  } catch (e) {
    console.warn('Error checking print blocks:', e)
  }

  try {
    // 5. User Avatars
    const users = await prisma.user.findMany({
      where: { image: url },
      select: { id: true, name: true, email: true },
    })
    for (const user of users) {
      usages.push({
        type: 'USER_AVATAR',
        entityType: 'Benutzer-Avatar',
        entityId: user.id,
        entityName: user.name || user.email,
        field: 'image',
      })
    }
  } catch (e) {
    console.warn('Error checking user avatars:', e)
  }

  try {
    // 6. Salon - Images (Array im Salon Modell)
    const salonsWithImage = await prisma.salon.findMany({
      where: { images: { has: url } },
      select: { id: true, name: true },
    })
    for (const salon of salonsWithImage) {
      usages.push({
        type: 'SALON_BRANDING',
        entityType: 'Salon-Bild',
        entityId: salon.id,
        entityName: salon.name,
        field: 'images',
      })
    }
  } catch (e) {
    console.warn('Error checking salon images:', e)
  }

  try {
    // 7. StylistProfile - Branding Logo
    const stylistProfiles = await prisma.stylistProfile.findMany({
      where: { brandingLogoUrl: url },
      select: { 
        id: true, 
        user: { select: { name: true, email: true } } 
      },
    })
    for (const profile of stylistProfiles) {
      usages.push({
        type: 'STYLIST_BRANDING',
        entityType: 'Stylist-Logo',
        entityId: profile.id,
        entityName: profile.user?.name || profile.user?.email || 'Stylist',
        field: 'brandingLogoUrl',
      })
    }
  } catch (e) {
    console.warn('Error checking stylist branding:', e)
  }

  try {
    // 8. StylistProfile - Portfolio Images
    const stylistPortfolios = await prisma.stylistProfile.findMany({
      where: { portfolio: { has: url } },
      select: { 
        id: true, 
        user: { select: { name: true, email: true } } 
      },
    })
    for (const profile of stylistPortfolios) {
      usages.push({
        type: 'STYLIST_BRANDING',
        entityType: 'Stylist-Portfolio',
        entityId: profile.id,
        entityName: profile.user?.name || profile.user?.email || 'Stylist',
        field: 'portfolio',
      })
    }
  } catch (e) {
    console.warn('Error checking stylist portfolios:', e)
  }

  try {
    // 9. Platform Settings - Logo
    const platformLogo = await prisma.platformSettings.findFirst({
      where: { logoUrl: url },
      select: { id: true },
    })
    if (platformLogo) {
      usages.push({
        type: 'OTHER',
        entityType: 'Plattform-Logo',
        entityId: platformLogo.id,
        entityName: 'Plattform-Einstellungen',
        field: 'logoUrl',
      })
    }
  } catch (e) {
    console.warn('Error checking platform settings:', e)
  }

  try {
    // 10. Pricelist Backgrounds
    const pricelistBackgrounds = await prisma.pricelistBackground.findMany({
      where: { url: url },
      select: { id: true, filename: true },
    })
    for (const bg of pricelistBackgrounds) {
      usages.push({
        type: 'OTHER',
        entityType: 'Preislisten-Hintergrund',
        entityId: bg.id,
        entityName: bg.filename,
        field: 'url',
      })
    }
  } catch (e) {
    console.warn('Error checking pricelist backgrounds:', e)
  }

  try {
    // 11. Social Media Posts
    const socialPosts = await prisma.socialMediaPost.findMany({
      where: { mediaUrl: url },
      select: { id: true, content: true },
    })
    for (const post of socialPosts) {
      usages.push({
        type: 'SOCIAL_POST',
        entityType: 'Social Media Post',
        entityId: post.id,
        entityName: post.content?.substring(0, 50) || 'Post',
        field: 'mediaUrl',
      })
    }
  } catch (e) {
    console.warn('Error checking social media posts:', e)
  }

  return usages
}

/**
 * Prüft, ob eine Medien-Datei verwendet wird
 */
export async function isMediaInUse(url: string): Promise<boolean> {
  const usages = await findMediaUsages(url)
  return usages.length > 0
}

/**
 * Zählt die Verwendungen einer Medien-Datei
 */
export async function countMediaUsages(url: string): Promise<number> {
  const usages = await findMediaUsages(url)
  return usages.length
}

/**
 * Entfernt alle Referenzen auf eine Medien-URL aus der Datenbank
 * Wird aufgerufen bevor ein Bild gelöscht wird, um "broken images" zu vermeiden
 */
export async function removeMediaReferences(url: string): Promise<{ removed: number; errors: string[] }> {
  let removed = 0
  const errors: string[] = []

  // 1. Blog Posts - Featured Image -> null setzen
  try {
    const result = await prisma.blogPost.updateMany({
      where: { featuredImage: url },
      data: { featuredImage: null },
    })
    removed += result.count
  } catch (e) {
    errors.push(`BlogPost: ${e}`)
  }

  // 2. Blog Authors - Avatar -> null setzen
  try {
    const result = await prisma.blogAuthor.updateMany({
      where: { avatar: url },
      data: { avatar: null },
    })
    removed += result.count
  } catch (e) {
    errors.push(`BlogAuthor: ${e}`)
  }

  // 3. Print Materials - Background URLs -> null setzen
  try {
    const resultFront = await prisma.printMaterial.updateMany({
      where: { frontBackgroundUrl: url },
      data: { frontBackgroundUrl: null },
    })
    removed += resultFront.count
  } catch (e) {
    errors.push(`PrintMaterial front: ${e}`)
  }

  try {
    const resultBack = await prisma.printMaterial.updateMany({
      where: { backBackgroundUrl: url },
      data: { backBackgroundUrl: null },
    })
    removed += resultBack.count
  } catch (e) {
    errors.push(`PrintMaterial back: ${e}`)
  }

  // 4. Print Blocks - Image URL -> null setzen
  try {
    const result = await prisma.printBlock.updateMany({
      where: { imageUrl: url },
      data: { imageUrl: null },
    })
    removed += result.count
  } catch (e) {
    errors.push(`PrintBlock: ${e}`)
  }

  // 5. User Avatars -> null setzen
  try {
    const result = await prisma.user.updateMany({
      where: { image: url },
      data: { image: null },
    })
    removed += result.count
  } catch (e) {
    errors.push(`User: ${e}`)
  }

  // 6. Salon - Images Array -> URL aus Array entfernen
  try {
    const salons = await prisma.salon.findMany({
      where: { images: { has: url } },
      select: { id: true, images: true },
    })
    for (const salon of salons) {
      const newImages = salon.images.filter(img => img !== url)
      await prisma.salon.update({
        where: { id: salon.id },
        data: { images: newImages },
      })
      removed++
    }
  } catch (e) {
    errors.push(`Salon images: ${e}`)
  }

  // 7. StylistProfile - Branding Logo -> null setzen
  try {
    const result = await prisma.stylistProfile.updateMany({
      where: { brandingLogoUrl: url },
      data: { brandingLogoUrl: null },
    })
    removed += result.count
  } catch (e) {
    errors.push(`StylistProfile branding: ${e}`)
  }

  // 8. StylistProfile - Portfolio Array -> URL aus Array entfernen
  try {
    const profiles = await prisma.stylistProfile.findMany({
      where: { portfolio: { has: url } },
      select: { id: true, portfolio: true },
    })
    for (const profile of profiles) {
      const newPortfolio = profile.portfolio.filter(img => img !== url)
      await prisma.stylistProfile.update({
        where: { id: profile.id },
        data: { portfolio: newPortfolio },
      })
      removed++
    }
  } catch (e) {
    errors.push(`StylistProfile portfolio: ${e}`)
  }

  // 9. Platform Settings - Logo -> null setzen
  try {
    const result = await prisma.platformSettings.updateMany({
      where: { logoUrl: url },
      data: { logoUrl: null },
    })
    removed += result.count
  } catch (e) {
    errors.push(`PlatformSettings: ${e}`)
  }

  // 10. Pricelist Backgrounds -> Eintrag löschen (da URL der Primärinhalt ist)
  try {
    const result = await prisma.pricelistBackground.deleteMany({
      where: { url: url },
    })
    removed += result.count
  } catch (e) {
    errors.push(`PricelistBackground: ${e}`)
  }

  // 11. Social Media Posts - Media URL -> null setzen
  try {
    const result = await prisma.socialMediaPost.updateMany({
      where: { mediaUrl: url },
      data: { mediaUrl: null },
    })
    removed += result.count
  } catch (e) {
    errors.push(`SocialMediaPost: ${e}`)
  }

  return { removed, errors }
}
