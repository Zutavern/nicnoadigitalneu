/**
 * Social Media Platform Image Formats
 * 
 * Definiert optimale Bildgrößen für jede Plattform
 */

export interface ImageFormat {
  width: number
  height: number
  ratio: string
  name: string
  description: string
}

export interface PlatformFormats {
  default: string // Name des Standard-Formats
  formats: Record<string, ImageFormat>
}

/**
 * Plattform-spezifische Bildformate
 */
export const PLATFORM_IMAGE_FORMATS: Record<string, PlatformFormats> = {
  INSTAGRAM: {
    default: 'feed_square',
    formats: {
      feed_square: {
        width: 1080,
        height: 1080,
        ratio: '1:1',
        name: 'Feed Quadrat',
        description: 'Klassisches Instagram Format',
      },
      feed_portrait: {
        width: 1080,
        height: 1350,
        ratio: '4:5',
        name: 'Feed Portrait',
        description: 'Optimales Format für mehr Sichtbarkeit',
      },
      feed_landscape: {
        width: 1080,
        height: 566,
        ratio: '1.91:1',
        name: 'Feed Landscape',
        description: 'Horizontales Bild',
      },
      story: {
        width: 1080,
        height: 1920,
        ratio: '9:16',
        name: 'Story / Reel',
        description: 'Vollbild für Stories und Reels',
      },
    },
  },
  
  FACEBOOK: {
    default: 'feed',
    formats: {
      feed: {
        width: 1200,
        height: 630,
        ratio: '1.91:1',
        name: 'Feed Post',
        description: 'Standard Facebook Post',
      },
      square: {
        width: 1200,
        height: 1200,
        ratio: '1:1',
        name: 'Quadrat',
        description: 'Quadratisches Bild',
      },
      story: {
        width: 1080,
        height: 1920,
        ratio: '9:16',
        name: 'Story',
        description: 'Facebook Story Format',
      },
      cover: {
        width: 820,
        height: 312,
        ratio: '2.63:1',
        name: 'Cover Photo',
        description: 'Seiten-Titelbild',
      },
    },
  },
  
  LINKEDIN: {
    default: 'post',
    formats: {
      post: {
        width: 1200,
        height: 628,
        ratio: '1.91:1',
        name: 'Post',
        description: 'Standard LinkedIn Post',
      },
      square: {
        width: 1200,
        height: 1200,
        ratio: '1:1',
        name: 'Quadrat',
        description: 'Quadratisches Bild',
      },
      portrait: {
        width: 628,
        height: 1200,
        ratio: '1:1.91',
        name: 'Portrait',
        description: 'Vertikales Bild',
      },
      article: {
        width: 744,
        height: 400,
        ratio: '1.86:1',
        name: 'Artikel',
        description: 'LinkedIn Artikel Header',
      },
    },
  },
  
  TWITTER: {
    default: 'post',
    formats: {
      post: {
        width: 1200,
        height: 675,
        ratio: '16:9',
        name: 'Tweet',
        description: 'Standard Tweet Bild',
      },
      post_wide: {
        width: 1200,
        height: 600,
        ratio: '2:1',
        name: 'Tweet Breit',
        description: 'Breites Tweet Bild',
      },
      square: {
        width: 1200,
        height: 1200,
        ratio: '1:1',
        name: 'Quadrat',
        description: 'Quadratisches Bild',
      },
      card: {
        width: 800,
        height: 418,
        ratio: '1.91:1',
        name: 'Card',
        description: 'Twitter Card Vorschau',
      },
    },
  },
  
  TIKTOK: {
    default: 'post',
    formats: {
      post: {
        width: 1080,
        height: 1920,
        ratio: '9:16',
        name: 'Video / Foto',
        description: 'Standard TikTok Format',
      },
    },
  },
  
  YOUTUBE: {
    default: 'community',
    formats: {
      community: {
        width: 1280,
        height: 720,
        ratio: '16:9',
        name: 'Community Post',
        description: 'YouTube Community Tab',
      },
      thumbnail: {
        width: 1280,
        height: 720,
        ratio: '16:9',
        name: 'Thumbnail',
        description: 'Video Thumbnail',
      },
      banner: {
        width: 2560,
        height: 1440,
        ratio: '16:9',
        name: 'Kanal Banner',
        description: 'YouTube Kanal Banner',
      },
    },
  },
  
  PINTEREST: {
    default: 'pin',
    formats: {
      pin: {
        width: 1000,
        height: 1500,
        ratio: '2:3',
        name: 'Pin',
        description: 'Standard Pinterest Pin',
      },
      pin_long: {
        width: 1000,
        height: 2100,
        ratio: '1:2.1',
        name: 'Langer Pin',
        description: 'Langer Pinterest Pin',
      },
      square: {
        width: 1000,
        height: 1000,
        ratio: '1:1',
        name: 'Quadrat',
        description: 'Quadratischer Pin',
      },
    },
  },
  
  THREADS: {
    default: 'post',
    formats: {
      post: {
        width: 1080,
        height: 1080,
        ratio: '1:1',
        name: 'Post',
        description: 'Standard Threads Post',
      },
      portrait: {
        width: 1080,
        height: 1350,
        ratio: '4:5',
        name: 'Portrait',
        description: 'Vertikales Bild',
      },
    },
  },
}

/**
 * Holt das Standard-Format für eine Plattform
 */
export function getDefaultFormat(platform: string): ImageFormat | null {
  const platformConfig = PLATFORM_IMAGE_FORMATS[platform]
  if (!platformConfig) return null
  
  return platformConfig.formats[platformConfig.default] || null
}

/**
 * Holt alle Formate für eine Plattform
 */
export function getPlatformFormats(platform: string): Record<string, ImageFormat> {
  return PLATFORM_IMAGE_FORMATS[platform]?.formats || {}
}

/**
 * Berechnet die Aspect Ratio als Dezimalzahl
 */
export function getAspectRatio(format: ImageFormat): number {
  return format.width / format.height
}

/**
 * Findet das passende Format für gegebene Dimensionen
 */
export function findMatchingFormat(
  platform: string, 
  width: number, 
  height: number
): { formatKey: string; format: ImageFormat } | null {
  const formats = getPlatformFormats(platform)
  const targetRatio = width / height
  
  let bestMatch: { formatKey: string; format: ImageFormat } | null = null
  let smallestDiff = Infinity
  
  for (const [key, format] of Object.entries(formats)) {
    const formatRatio = getAspectRatio(format)
    const diff = Math.abs(formatRatio - targetRatio)
    
    if (diff < smallestDiff) {
      smallestDiff = diff
      bestMatch = { formatKey: key, format }
    }
  }
  
  return bestMatch
}

/**
 * AI-Bild Prompt-Anpassungen pro Plattform
 */
export const PLATFORM_STYLE_HINTS: Record<string, string> = {
  INSTAGRAM: 'Aesthetic, visually appealing, Instagram-worthy, high quality photography style',
  FACEBOOK: 'Engaging, clear, community-focused, professional but approachable',
  LINKEDIN: 'Professional, business-appropriate, clean and modern design',
  TWITTER: 'Eye-catching, concise visual that works at smaller sizes',
  TIKTOK: 'Trendy, vibrant, dynamic, mobile-first vertical format',
  YOUTUBE: 'Click-worthy thumbnail style, high contrast, readable text overlay',
  PINTEREST: 'Pinterest aesthetic, inspirational, beautiful composition, vertical format',
  THREADS: 'Clean, modern, conversational style similar to Instagram',
}

/**
 * AI-Prompt-Suffix für Bild-Generierung
 */
export function getAIPromptSuffix(platform: string, format: ImageFormat): string {
  const styleHint = PLATFORM_STYLE_HINTS[platform] || ''
  return `${styleHint}. Image dimensions: ${format.width}x${format.height} pixels (${format.ratio} aspect ratio).`
}

