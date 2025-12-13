import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default Auth Page Config
const defaultConfig = {
  layout: 'split',
  formPosition: 'left',
  backgroundColor: 'dark',
  
  // Login
  loginImageUrl: null,
  loginImageAlt: null,
  loginImageOverlay: 0,
  loginTitle: 'Anmelden',
  loginSubtitle: 'Willkommen zurück! Melden Sie sich an, um fortzufahren.',
  loginCtaText: 'Noch kein Konto?',
  loginCtaLink: 'Jetzt registrieren',
  
  showLoginFeatures: true,
  loginFeature1Icon: 'scissors',
  loginFeature1Text: 'Termine verwalten',
  loginFeature2Icon: 'briefcase',
  loginFeature2Text: 'Stuhlvermietung optimieren',
  loginFeature3Icon: 'bar-chart-3',
  loginFeature3Text: 'Umsätze analysieren',
  
  // Register
  registerImageUrl: null,
  registerImageAlt: null,
  registerImageOverlay: 0,
  registerTitle: 'Konto erstellen',
  registerSubtitle: 'Starten Sie jetzt und revolutionieren Sie Ihr Salon-Management.',
  registerCtaText: 'Bereits ein Konto?',
  registerCtaLink: 'Jetzt anmelden',
  
  showRegisterBenefits: true,
  registerBenefit1Icon: 'check-circle',
  registerBenefit1Text: '14 Tage kostenlos testen',
  registerBenefit2Icon: 'credit-card',
  registerBenefit2Text: 'Keine Kreditkarte erforderlich',
  registerBenefit3Icon: 'shield',
  registerBenefit3Text: 'DSGVO-konform & sicher',
  
  // Social Login
  showGoogleLogin: true,
  showAppleLogin: false,
  showLinkedInLogin: true,
  showFacebookLogin: true,
  
  // Branding
  showLogo: true,
  logoPosition: 'form',
  
  // SEO
  loginMetaTitle: null,
  loginMetaDescription: null,
  registerMetaTitle: null,
  registerMetaDescription: null,
}

// GET - Öffentliche Route für Auth-Seiten
export async function GET() {
  try {
    let config = await prisma.authPageConfig.findFirst()
    
    // Wenn keine Config existiert, erstelle Default
    if (!config) {
      config = await prisma.authPageConfig.create({
        data: {
          id: 'default',
          ...defaultConfig,
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching auth page config:', error)
    // Im Fehlerfall gebe Default zurück
    return NextResponse.json(defaultConfig)
  }
}


