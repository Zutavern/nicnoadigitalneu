import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
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

// GET - Hole Auth Page Konfiguration
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
    return NextResponse.json(
      { error: 'Fehler beim Laden der Auth-Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Update Auth Page Konfiguration
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    
    // Finde existierende Config
    const existing = await prisma.authPageConfig.findFirst()
    
    // Update oder Create
    const config = existing
      ? await prisma.authPageConfig.update({
          where: { id: existing.id },
          data: {
            layout: body.layout,
            formPosition: body.formPosition,
            backgroundColor: body.backgroundColor,
            
            loginImageUrl: body.loginImageUrl,
            loginImageAlt: body.loginImageAlt,
            loginImageOverlay: body.loginImageOverlay,
            loginTitle: body.loginTitle,
            loginSubtitle: body.loginSubtitle,
            loginCtaText: body.loginCtaText,
            loginCtaLink: body.loginCtaLink,
            
            showLoginFeatures: body.showLoginFeatures,
            loginFeature1Icon: body.loginFeature1Icon,
            loginFeature1Text: body.loginFeature1Text,
            loginFeature2Icon: body.loginFeature2Icon,
            loginFeature2Text: body.loginFeature2Text,
            loginFeature3Icon: body.loginFeature3Icon,
            loginFeature3Text: body.loginFeature3Text,
            
            registerImageUrl: body.registerImageUrl,
            registerImageAlt: body.registerImageAlt,
            registerImageOverlay: body.registerImageOverlay,
            registerTitle: body.registerTitle,
            registerSubtitle: body.registerSubtitle,
            registerCtaText: body.registerCtaText,
            registerCtaLink: body.registerCtaLink,
            
            showRegisterBenefits: body.showRegisterBenefits,
            registerBenefit1Icon: body.registerBenefit1Icon,
            registerBenefit1Text: body.registerBenefit1Text,
            registerBenefit2Icon: body.registerBenefit2Icon,
            registerBenefit2Text: body.registerBenefit2Text,
            registerBenefit3Icon: body.registerBenefit3Icon,
            registerBenefit3Text: body.registerBenefit3Text,
            
            showGoogleLogin: body.showGoogleLogin,
            showAppleLogin: body.showAppleLogin,
            showLinkedInLogin: body.showLinkedInLogin,
            showFacebookLogin: body.showFacebookLogin,
            
            showLogo: body.showLogo,
            logoPosition: body.logoPosition,
            
            loginMetaTitle: body.loginMetaTitle,
            loginMetaDescription: body.loginMetaDescription,
            registerMetaTitle: body.registerMetaTitle,
            registerMetaDescription: body.registerMetaDescription,
          }
        })
      : await prisma.authPageConfig.create({
          data: {
            id: 'default',
            layout: body.layout,
            formPosition: body.formPosition,
            backgroundColor: body.backgroundColor,
            
            loginImageUrl: body.loginImageUrl,
            loginImageAlt: body.loginImageAlt,
            loginImageOverlay: body.loginImageOverlay,
            loginTitle: body.loginTitle,
            loginSubtitle: body.loginSubtitle,
            loginCtaText: body.loginCtaText,
            loginCtaLink: body.loginCtaLink,
            
            showLoginFeatures: body.showLoginFeatures,
            loginFeature1Icon: body.loginFeature1Icon,
            loginFeature1Text: body.loginFeature1Text,
            loginFeature2Icon: body.loginFeature2Icon,
            loginFeature2Text: body.loginFeature2Text,
            loginFeature3Icon: body.loginFeature3Icon,
            loginFeature3Text: body.loginFeature3Text,
            
            registerImageUrl: body.registerImageUrl,
            registerImageAlt: body.registerImageAlt,
            registerImageOverlay: body.registerImageOverlay,
            registerTitle: body.registerTitle,
            registerSubtitle: body.registerSubtitle,
            registerCtaText: body.registerCtaText,
            registerCtaLink: body.registerCtaLink,
            
            showRegisterBenefits: body.showRegisterBenefits,
            registerBenefit1Icon: body.registerBenefit1Icon,
            registerBenefit1Text: body.registerBenefit1Text,
            registerBenefit2Icon: body.registerBenefit2Icon,
            registerBenefit2Text: body.registerBenefit2Text,
            registerBenefit3Icon: body.registerBenefit3Icon,
            registerBenefit3Text: body.registerBenefit3Text,
            
            showGoogleLogin: body.showGoogleLogin,
            showAppleLogin: body.showAppleLogin,
            showLinkedInLogin: body.showLinkedInLogin,
            showFacebookLogin: body.showFacebookLogin,
            
            showLogo: body.showLogo,
            logoPosition: body.logoPosition,
            
            loginMetaTitle: body.loginMetaTitle,
            loginMetaDescription: body.loginMetaDescription,
            registerMetaTitle: body.registerMetaTitle,
            registerMetaDescription: body.registerMetaDescription,
          }
        })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating auth page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Auth-Konfiguration' },
      { status: 500 }
    )
  }
}


