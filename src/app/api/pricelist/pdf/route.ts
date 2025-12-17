import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put, head, del } from '@vercel/blob'
import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getTheme, getThemeCSS } from '@/lib/pricelist/themes'
import { getFont, FONTS } from '@/lib/pricelist/fonts'
import { formatPrice, SPACER_SIZE_CONFIGS } from '@/lib/pricelist/types'
import type { PriceBlockClient, PriceListClient } from '@/lib/pricelist/types'

// Vercel Serverless Function Konfiguration
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 Sekunden Timeout

// A4 Größe in Pixel bei 96 DPI
const A4_WIDTH = 794
const A4_HEIGHT = 1123

// mm zu px Konvertierung (96 DPI)
const MM_TO_PX = 3.7795275591

interface PDFRequest {
  priceList: PriceListClient
  blocks: PriceBlockClient[]
  backgroundBase64?: string
}

/**
 * Generiert einen Hash aus den Preislisten-Daten für Caching
 */
function generatePDFHash(priceList: PriceListClient, blocks: PriceBlockClient[], backgroundBase64?: string): string {
  const dataToHash = JSON.stringify({
    priceList: {
      id: priceList.id,
      name: priceList.name,
      theme: priceList.theme,
      fontFamily: priceList.fontFamily,
      showLogo: priceList.showLogo,
      showContact: priceList.showContact,
      columns: priceList.columns,
      paddingTop: priceList.paddingTop,
      paddingBottom: priceList.paddingBottom,
      paddingLeft: priceList.paddingLeft,
      paddingRight: priceList.paddingRight,
      contentScale: priceList.contentScale,
      contentOffsetX: priceList.contentOffsetX,
      contentOffsetY: priceList.contentOffsetY,
      backgroundUrl: priceList.backgroundUrl,
    },
    blocks: blocks.map(b => ({
      id: b.id,
      type: b.type,
      sortOrder: b.sortOrder,
      title: b.title,
      subtitle: b.subtitle,
      itemName: b.itemName,
      description: b.description,
      price: b.price,
      priceMax: b.priceMax,
      priceText: b.priceText,
      content: b.content,
      textAlign: b.textAlign,
      variants: b.variants,
    })),
    hasBackground: !!backgroundBase64,
  })
  
  return createHash('sha256').update(dataToHash).digest('hex').substring(0, 16)
}

/**
 * Startet Puppeteer basierend auf der Umgebung
 */
async function getBrowser() {
  const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL

  if (isLocal) {
    const puppeteer = await import('puppeteer')
    return puppeteer.default.launch({
      headless: true,
      defaultViewport: {
        width: A4_WIDTH,
        height: A4_HEIGHT,
        deviceScaleFactor: 2,
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  } else {
    // Vercel Serverless Environment
    const puppeteerCore = await import('puppeteer-core')
    const chromium = await import('@sparticuz/chromium')
    
    // Chromium für Lambda/Serverless optimieren
    chromium.default.setHeadlessMode = true
    chromium.default.setGraphicsMode = false
    
    const executablePath = await chromium.default.executablePath()
    console.log('Chromium executable path:', executablePath)
    
    return puppeteerCore.default.launch({
      args: [
        ...chromium.default.args,
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--single-process',
      ],
      defaultViewport: {
        width: A4_WIDTH,
        height: A4_HEIGHT,
        deviceScaleFactor: 2,
      },
      executablePath,
      headless: chromium.default.headless,
    })
  }
}

/**
 * POST /api/pricelist/pdf
 * Generiert ein PDF aus der Preisliste mit selektierbarem Text
 * Speichert das PDF in Vercel Blob für Caching
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body: PDFRequest = await request.json()
    const { priceList, blocks, backgroundBase64 } = body
    const forceRegenerate = request.nextUrl.searchParams.get('forceRegenerate') === 'true'

    if (!priceList || !blocks) {
      return NextResponse.json(
        { error: 'priceList und blocks sind erforderlich' },
        { status: 400 }
      )
    }

    // Hash für Caching generieren
    const pdfHash = generatePDFHash(priceList, blocks, backgroundBase64)
    const blobPath = `pricelists/${priceList.id}/${pdfHash}.pdf`

    // Prüfen ob gecachtes PDF existiert (nur wenn nicht forceRegenerate)
    if (!forceRegenerate) {
      try {
        const existingBlob = await head(blobPath)
        if (existingBlob) {
          console.log(`PDF cache hit: ${blobPath}`)
          
          // Gecachte URL zurückgeben
          return NextResponse.json({
            success: true,
            cached: true,
            url: existingBlob.url,
            hash: pdfHash,
          })
        }
      } catch {
        // Blob existiert nicht, wir generieren ein neues PDF
        console.log(`PDF cache miss: ${blobPath}`)
      }
    }

    // HTML generieren
    const html = generateHTML(priceList, blocks, backgroundBase64)

    // Browser starten
    const browser = await getBrowser()
    const page = await browser.newPage()
    
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    // PDF generieren
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    })

    await browser.close()

    // PDF in Vercel Blob speichern
    const blob = await put(blobPath, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: false,
    })

    console.log(`PDF saved to blob: ${blob.url}`)

    // Optional: PDF-URL in der Datenbank speichern
    try {
      await prisma.priceList.update({
        where: { id: priceList.id },
        data: { 
          // @ts-ignore - falls das Feld noch nicht im Schema ist
          lastPdfUrl: blob.url,
          // @ts-ignore
          lastPdfHash: pdfHash,
        },
      })
    } catch {
      // Ignorieren falls Felder nicht existieren
    }

    // URL zurückgeben (und PDF auch als Download anbieten)
    return NextResponse.json({
      success: true,
      cached: false,
      url: blob.url,
      hash: pdfHash,
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der PDF-Generierung', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/pricelist/pdf?id=xxx
 * Lädt ein bereits generiertes PDF
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const priceListId = request.nextUrl.searchParams.get('id')
    if (!priceListId) {
      return NextResponse.json({ error: 'id ist erforderlich' }, { status: 400 })
    }

    // Prüfen ob User Zugriff auf die Preisliste hat
    const priceList = await prisma.priceList.findFirst({
      where: { id: priceListId, userId: session.user.id },
      select: {
        id: true,
        name: true,
        // @ts-ignore
        lastPdfUrl: true,
        // @ts-ignore
        lastPdfHash: true,
      },
    })

    if (!priceList) {
      return NextResponse.json({ error: 'Preisliste nicht gefunden' }, { status: 404 })
    }

    // @ts-ignore
    if (!priceList.lastPdfUrl) {
      return NextResponse.json({ error: 'Kein PDF verfügbar' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      // @ts-ignore
      url: priceList.lastPdfUrl,
      // @ts-ignore
      hash: priceList.lastPdfHash,
    })

  } catch (error) {
    console.error('Error fetching PDF:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des PDFs' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pricelist/pdf?id=xxx
 * Löscht gecachte PDFs einer Preisliste
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const priceListId = request.nextUrl.searchParams.get('id')
    if (!priceListId) {
      return NextResponse.json({ error: 'id ist erforderlich' }, { status: 400 })
    }

    // Prüfen ob User Zugriff hat
    const priceList = await prisma.priceList.findFirst({
      where: { id: priceListId, userId: session.user.id },
    })

    if (!priceList) {
      return NextResponse.json({ error: 'Preisliste nicht gefunden' }, { status: 404 })
    }

    // PDF-URL aus DB löschen
    try {
      await prisma.priceList.update({
        where: { id: priceListId },
        data: {
          // @ts-ignore
          lastPdfUrl: null,
          // @ts-ignore
          lastPdfHash: null,
        },
      })
    } catch {
      // Ignorieren
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting PDF:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des PDFs' },
      { status: 500 }
    )
  }
}

/**
 * Generiert das vollständige HTML-Dokument für die PDF-Generierung
 */
function generateHTML(
  priceList: PriceListClient,
  blocks: PriceBlockClient[],
  backgroundBase64?: string
): string {
  const theme = getTheme(priceList.theme)
  const font = getFont(priceList.fontFamily)
  const cssVars = getThemeCSS(theme)

  // Google Fonts URLs für alle verwendeten Fonts
  const fontUrls = Object.values(FONTS)
    .filter(f => f.googleFont)
    .map(f => `family=${f.googleFont}`)
    .join('&')

  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontUrls}&display=swap`

  // Block-HTML generieren
  const blocksHTML = blocks
    .filter(b => !b.parentBlockId) // Nur Top-Level Blöcke
    .map(block => renderBlockToHTML(block, theme, blocks))
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${A4_WIDTH}, initial-scale=1.0">
  <link href="${googleFontsUrl}" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: ${A4_WIDTH}px;
      height: ${A4_HEIGHT}px;
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .page {
      width: ${A4_WIDTH}px;
      height: ${A4_HEIGHT}px;
      position: relative;
      overflow: hidden;
      ${cssVars}
    }
    
    .background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      z-index: 0;
    }
    
    .content {
      position: relative;
      z-index: 10;
      padding: 30px;
      height: 100%;
    }
    
    /* Typography */
    .header-font {
      font-family: var(--pl-header-font);
    }
    
    .body-font {
      font-family: var(--pl-body-font);
    }
    
    /* Section Header */
    .section-header {
      margin-bottom: 16px;
      margin-top: 24px;
    }
    
    .section-header:first-child {
      margin-top: 0;
    }
    
    .section-header h2 {
      font-family: var(--pl-header-font);
      font-size: var(--pl-header-size);
      font-weight: var(--pl-header-weight);
      letter-spacing: var(--pl-letter-spacing);
      color: var(--pl-primary);
      text-transform: ${theme.headerTransform};
    }
    
    .section-header .subtitle {
      font-family: var(--pl-body-font);
      font-size: var(--pl-subheader-size);
      color: var(--pl-muted);
      margin-top: 4px;
    }
    
    .section-underline {
      height: 2px;
      width: 48px;
      background-color: var(--pl-accent);
      margin-top: 8px;
    }
    
    /* Price Item */
    .price-item {
      padding: 6px 0;
    }
    
    .price-item-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    
    .price-item-name {
      flex: 1;
      font-family: var(--pl-body-font);
      font-size: var(--pl-body-size);
      color: var(--pl-text);
    }
    
    .price-item-dots {
      color: var(--pl-muted);
      margin: 0 4px;
    }
    
    .price-item-price {
      font-family: var(--pl-body-font);
      font-size: var(--pl-price-size);
      font-weight: 500;
      color: var(--pl-primary);
    }
    
    .price-item-description {
      font-family: var(--pl-body-font);
      font-size: 0.75rem;
      color: var(--pl-muted);
      margin-top: 2px;
      margin-left: 16px;
    }
    
    .price-item-qualifier {
      font-family: var(--pl-body-font);
      font-size: 0.75rem;
      font-style: italic;
      color: var(--pl-accent);
      margin-top: 2px;
    }
    
    /* Variants Grid */
    .variants-grid {
      display: grid;
      gap: 4px;
      margin-left: 16px;
    }
    
    .variant-item {
      text-align: center;
    }
    
    .variant-label {
      font-size: 0.75rem;
      color: var(--pl-muted);
      margin-bottom: 2px;
    }
    
    .variant-price {
      font-weight: 500;
      color: var(--pl-primary);
    }
    
    /* Text Block */
    .text-block {
      padding: 8px 0;
      font-family: var(--pl-body-font);
      font-size: var(--pl-body-size);
      color: var(--pl-muted);
      line-height: var(--pl-line-height);
    }
    
    /* Info Box */
    .info-box {
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: var(--pl-radius);
      font-family: var(--pl-body-font);
      font-size: 0.75rem;
      color: var(--pl-secondary);
    }
    
    .info-box.bordered {
      border: 1px solid var(--pl-accent);
    }
    
    .info-box.filled {
      background: rgba(0,0,0,0.05);
    }
    
    .info-box.subtle {
      border-left: 2px solid var(--pl-accent);
    }
    
    /* Divider */
    .divider {
      padding: 12px 0;
    }
    
    .divider-line {
      height: 1px;
      background-color: var(--pl-divider);
    }
    
    /* Spacer */
    .spacer-small { height: ${8 * MM_TO_PX}px; }
    .spacer-medium { height: ${16 * MM_TO_PX}px; }
    .spacer-large { height: ${32 * MM_TO_PX}px; }
    
    /* Image */
    .image-block {
      padding: 8px 0;
      display: flex;
      justify-content: center;
    }
    
    .image-block img {
      max-height: 96px;
      object-fit: contain;
    }
    
    /* Quote */
    .quote-block {
      padding: 12px 16px;
      border-left: 2px solid var(--pl-accent);
    }
    
    .quote-text {
      font-family: var(--pl-body-font);
      font-size: 0.875rem;
      font-style: italic;
      color: var(--pl-muted);
    }
    
    .quote-author {
      font-family: var(--pl-body-font);
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--pl-text);
      margin-top: 4px;
    }
    
    /* Badge */
    .badge-block {
      padding: 8px 0;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .badge.filled { background: var(--pl-primary); color: white; }
    .badge.outline { border: 2px solid var(--pl-primary); color: var(--pl-primary); }
    
    /* Contact Info */
    .contact-info {
      padding: 8px 0;
    }
    
    .contact-item {
      font-family: var(--pl-body-font);
      font-size: 0.75rem;
      color: var(--pl-text);
      margin: 4px 0;
    }
    
    /* Footer */
    .footer-block {
      padding: 12px 0;
      border-top: 1px solid var(--pl-divider);
      margin-top: 16px;
    }
    
    .footer-text {
      font-family: var(--pl-body-font);
      font-size: 0.65rem;
      color: var(--pl-muted);
      white-space: pre-line;
    }
    
    /* Column Layout */
    .column-container {
      display: flex;
      gap: 24px;
      padding: 8px 0;
    }
    
    .column {
      flex-shrink: 0;
    }
    
    /* Text Alignment */
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    
    .flex-center { justify-content: center; }
    .flex-end { justify-content: flex-end; }
    
    .underline-center { margin-left: auto; margin-right: auto; }
    .underline-right { margin-left: auto; }
    
    /* Logo */
    .logo-block {
      padding: 12px 0;
      display: flex;
      justify-content: center;
    }
    
    .logo-block img {
      height: 64px;
      object-fit: contain;
    }
    
    .logo-small img { height: 48px; }
    .logo-large img { height: 80px; }
    
    /* QR Code */
    .qr-block {
      padding: 12px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    
    .qr-code {
      width: 96px;
      height: 96px;
    }
    
    .qr-label {
      font-family: var(--pl-body-font);
      font-size: 0.65rem;
      color: var(--pl-muted);
    }
    
    /* Social Links */
    .social-links {
      padding: 8px 0;
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    
    .social-icon {
      font-size: 1.25rem;
    }
  </style>
</head>
<body>
  <div class="page">
    ${backgroundBase64 ? `<img src="${backgroundBase64}" class="background" />` : ''}
    <div class="content">
      ${priceList.showLogo ? `
        <div class="section-header text-center">
          <h1 style="font-family: var(--pl-header-font); font-size: 2rem; font-weight: 700; color: var(--pl-primary); letter-spacing: var(--pl-letter-spacing);">
            ${escapeHTML(priceList.name)}
          </h1>
        </div>
      ` : ''}
      ${blocksHTML}
    </div>
  </div>
</body>
</html>`
}

/**
 * Rendert einen einzelnen Block zu HTML
 */
function renderBlockToHTML(
  block: PriceBlockClient,
  theme: ReturnType<typeof getTheme>,
  allBlocks: PriceBlockClient[]
): string {
  const alignClass = block.textAlign ? `text-${block.textAlign}` : 'text-left'
  const flexAlignClass = block.textAlign === 'center' ? 'flex-center' : block.textAlign === 'right' ? 'flex-end' : ''
  const underlineAlignClass = block.textAlign === 'center' ? 'underline-center' : block.textAlign === 'right' ? 'underline-right' : ''

  switch (block.type) {
    case 'SECTION_HEADER':
      return `
        <div class="section-header ${alignClass}">
          <h2>${escapeHTML(block.title || '')}</h2>
          ${block.subtitle ? `<p class="subtitle">${escapeHTML(block.subtitle)}</p>` : ''}
          ${theme.sectionUnderline ? `<div class="section-underline ${underlineAlignClass}"></div>` : ''}
        </div>
      `

    case 'PRICE_ITEM':
      const hasVariants = block.variants && block.variants.length > 0
      if (hasVariants) {
        return `
          <div class="price-item ${alignClass}">
            <div class="price-item-name" style="font-weight: 500; margin-bottom: 4px;">${escapeHTML(block.itemName || '')}</div>
            <div class="variants-grid" style="grid-template-columns: repeat(${block.variants.length}, 1fr);">
              ${block.variants.map(v => `
                <div class="variant-item">
                  <div class="variant-label">${escapeHTML(v.label)}</div>
                  <div class="variant-price">${v.price.toFixed(0)} €</div>
                </div>
              `).join('')}
            </div>
            ${block.description ? `<p class="price-item-description">${escapeHTML(block.description)}</p>` : ''}
            ${block.qualifier ? `<p class="price-item-qualifier">${escapeHTML(block.qualifier)}</p>` : ''}
          </div>
        `
      }
      
      const priceText = formatPrice(block)
      return `
        <div class="price-item ${alignClass}">
          <div class="price-item-row ${flexAlignClass}">
            <span class="price-item-name">
              ${escapeHTML(block.itemName || '')}
              ${theme.priceAlignment === 'dotted' ? '<span class="price-item-dots">·····················</span>' : ''}
            </span>
            <span class="price-item-price">${priceText}</span>
          </div>
          ${block.description ? `<p class="price-item-description">${escapeHTML(block.description)}</p>` : ''}
          ${block.qualifier ? `<p class="price-item-qualifier">${escapeHTML(block.qualifier)}</p>` : ''}
        </div>
      `

    case 'TEXT':
      return `
        <div class="text-block ${alignClass}">
          ${escapeHTML(block.content || '')}
        </div>
      `

    case 'DIVIDER':
      return `
        <div class="divider">
          <div class="divider-line"></div>
        </div>
      `

    case 'SPACER':
      const spacerClass = block.spacerSize === 'SMALL' ? 'spacer-small' : 
                         block.spacerSize === 'LARGE' ? 'spacer-large' : 'spacer-medium'
      return `<div class="${spacerClass}"></div>`

    case 'IMAGE':
      if (!block.imageUrl) return ''
      return `
        <div class="image-block ${flexAlignClass}">
          <img src="${block.imageUrl}" alt="" />
        </div>
      `

    case 'INFO_BOX':
      const infoBoxClass = theme.infoBoxStyle === 'filled' ? 'filled' : 
                          theme.infoBoxStyle === 'bordered' ? 'bordered' : 'subtle'
      return `
        <div class="info-box ${infoBoxClass} ${alignClass}">
          ${escapeHTML(block.content || '')}
        </div>
      `

    case 'QUOTE':
      return `
        <div class="quote-block ${alignClass}">
          <p class="quote-text">"${escapeHTML(block.content || '')}"</p>
          ${block.title ? `<p class="quote-author">— ${escapeHTML(block.title)}</p>` : ''}
        </div>
      `

    case 'BADGE':
      const badgeClass = block.badgeStyle === 'outline' ? 'outline' : 'filled'
      return `
        <div class="badge-block ${alignClass}">
          <span class="badge ${badgeClass}">${escapeHTML(block.badgeText || 'Badge')}</span>
        </div>
      `

    case 'ICON_TEXT':
      return `
        <div class="price-item ${alignClass}">
          <div class="price-item-row ${flexAlignClass}">
            <span style="color: var(--pl-primary);">✓</span>
            <span class="price-item-name">${escapeHTML(block.content || '')}</span>
          </div>
        </div>
      `

    case 'CONTACT_INFO':
      return `
        <div class="contact-info ${alignClass}">
          ${block.phone ? `<p class="contact-item">📞 ${escapeHTML(block.phone)}</p>` : ''}
          ${block.email ? `<p class="contact-item">✉️ ${escapeHTML(block.email)}</p>` : ''}
          ${block.website ? `<p class="contact-item">🌐 ${escapeHTML(block.website)}</p>` : ''}
          ${block.address ? `<p class="contact-item">📍 ${escapeHTML(block.address)}</p>` : ''}
        </div>
      `

    case 'FOOTER':
      const footerAlignClass = block.textAlign || 'center'
      return `
        <div class="footer-block text-${footerAlignClass}">
          <p class="footer-text">${escapeHTML(block.footerText || '')}</p>
        </div>
      `

    case 'LOGO':
      if (!block.imageUrl) return ''
      const logoSizeClass = block.spacerSize === 'SMALL' ? 'logo-small' : 
                           block.spacerSize === 'LARGE' ? 'logo-large' : ''
      return `
        <div class="logo-block ${flexAlignClass} ${logoSizeClass}">
          <img src="${block.imageUrl}" alt="Logo" />
        </div>
      `

    case 'QR_CODE':
      if (!block.qrCodeUrl) return ''
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(block.qrCodeUrl)}`
      return `
        <div class="qr-block ${flexAlignClass}">
          <img src="${qrApiUrl}" alt="QR Code" class="qr-code" />
          ${block.qrCodeLabel ? `<span class="qr-label">${escapeHTML(block.qrCodeLabel)}</span>` : ''}
        </div>
      `

    case 'SOCIAL_LINKS':
      const socialIcons: Record<string, string> = {
        instagram: '📸',
        facebook: '👤',
        tiktok: '🎵',
        youtube: '▶️',
        twitter: '🐦',
        linkedin: '💼',
        pinterest: '📌',
      }
      return `
        <div class="social-links ${flexAlignClass}">
          ${(block.socialLinks || []).map(link => `
            <span class="social-icon">${socialIcons[link.platform] || '🔗'}</span>
          `).join('')}
        </div>
      `

    case 'TWO_COLUMN':
    case 'THREE_COLUMN':
      const columnCount = block.type === 'TWO_COLUMN' ? 2 : 3
      const defaultWidths = block.type === 'TWO_COLUMN' ? [50, 50] : [33.33, 33.33, 33.34]
      const widths = block.columnWidths || defaultWidths
      
      const childBlocks = allBlocks.filter(b => b.parentBlockId === block.id)
      
      const columnsHTML = Array.from({ length: columnCount }).map((_, idx) => {
        const colBlocks = childBlocks
          .filter(b => b.columnIndex === idx)
          .sort((a, b) => a.sortOrder - b.sortOrder)
        
        const colBlocksHTML = colBlocks
          .map(b => renderBlockToHTML(b, theme, allBlocks))
          .join('')
        
        return `<div class="column" style="width: ${widths[idx]}%;">${colBlocksHTML}</div>`
      }).join('')
      
      return `<div class="column-container">${columnsHTML}</div>`

    case 'PAGE_BREAK':
      return `
        <div class="page-break" style="page-break-after: always; break-after: page;"></div>
      `

    default:
      return ''
  }
}

/**
 * Escaped HTML-spezifische Zeichen
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
