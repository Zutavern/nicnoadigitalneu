// Newsletter Builder - E-Mail HTML Rendering

import type { NewsletterBlock, NewsletterBranding, ListStyle } from './types'
import { EMAIL_STYLES, BLOCK_STYLES, FOOTER_LINKS, DEFAULT_PRIMARY_COLOR, SOCIAL_ICONS } from './constants'

/**
 * Rendert die Newsletter-Blöcke als E-Mail-kompatibles HTML
 */
export function renderNewsletterToHtml(
  blocks: NewsletterBlock[],
  branding: NewsletterBranding
): string {
  const primaryColor = branding.primaryColor || DEFAULT_PRIMARY_COLOR
  const contentHtml = blocks
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(block => renderBlock(block, primaryColor))
    .join('')

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Newsletter</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    a { text-decoration: none; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_STYLES.body.backgroundColor}; font-family: ${EMAIL_STYLES.body.fontFamily};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${EMAIL_STYLES.body.backgroundColor};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          ${renderHeader(branding, primaryColor)}
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              ${contentHtml || '<p style="color: #6b7280; text-align: center;">Keine Inhalte</p>'}
            </td>
          </tr>
          
          <!-- Footer -->
          ${renderFooter(branding, primaryColor)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Rendert den Header mit Logo oder Text-Logo
 * Das Logo wird aus den Platform-Settings (emailLogoUrl) geladen
 */
function renderHeader(branding: NewsletterBranding, primaryColor: string): string {
  const companyName = branding.companyName || 'NICNOA&CO.online'
  
  // Wenn ein Logo vorhanden ist, dieses verwenden
  // Sonst: Text-Logo mit NICNOA&CO.online Branding
  const logoContent = branding.logoUrl
    ? `<img src="${branding.logoUrl}" alt="${escapeHtml(companyName)}" style="max-height: 48px; width: auto; display: block; margin: 0 auto;">`
    : `<span style="font-size: 28px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff;">NICNOA</span><span style="font-size: 28px; font-weight: 700; letter-spacing: -0.025em; color: rgba(255,255,255,0.9);">&amp;CO.</span><span style="font-size: 28px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff;">online</span>`

  return `
    <tr>
      <td style="padding: 24px; text-align: center; background-color: ${primaryColor};">
        ${logoContent}
      </td>
    </tr>
  `
}

/**
 * Rendert den Footer mit Links und PFLICHT-Unsubscribe-Link (DSGVO)
 * WICHTIG: Keine doppelten "Alle Rechte vorbehalten" Texte!
 */
function renderFooter(branding: NewsletterBranding, primaryColor: string): string {
  const footerLinksHtml = FOOTER_LINKS
    .map(link => `<a href="${link.href}" style="color: #374151; text-decoration: none;">${link.label}</a>`)
    .join(' | ')

  // Copyright-Text: Dynamisches Jahr + Firmenname (NICNOA&CO.online als Standard)
  const currentYear = new Date().getFullYear()
  const companyDisplayName = branding.companyName || 'NICNOA&CO.online'
  const copyrightText = `© ${currentYear} ${companyDisplayName}. Alle Rechte vorbehalten.`

  return `
    <tr>
      <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; text-align: center;">
        <p style="color: #6b7280; font-size: 13px; line-height: 20px; margin: 0 0 12px;">
          ${footerLinksHtml}
        </p>
        <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0 0 12px;">
          ${copyrightText}
        </p>
        <!-- PFLICHT: Unsubscribe Link (DSGVO) -->
        <p style="color: #9ca3af; font-size: 11px; line-height: 16px; margin: 0;">
          Du möchtest keine E-Mails mehr erhalten? 
          <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #374151; text-decoration: underline;">Hier abmelden</a>
        </p>
      </td>
    </tr>
  `
}

/**
 * Rendert einen einzelnen Block
 */
function renderBlock(block: NewsletterBlock, primaryColor: string): string {
  switch (block.type) {
    case 'HEADING':
      return renderHeading(block)
    case 'PARAGRAPH':
      return renderParagraph(block)
    case 'BUTTON':
      return renderButton(block, primaryColor)
    case 'IMAGE':
      return renderImage(block)
    case 'DIVIDER':
      return renderDivider(block)
    case 'SPACER':
      return renderSpacer(block)
    case 'TWO_COLUMN':
      return renderTwoColumn(block, primaryColor)
    case 'THREE_COLUMN':
      return renderThreeColumn(block, primaryColor)
    case 'SOCIAL_LINKS':
      return renderSocialLinks(block, primaryColor)
    case 'QUOTE':
      return renderQuote(block, primaryColor)
    case 'LIST':
      return renderList(block, primaryColor)
    case 'VIDEO':
      return renderVideo(block, primaryColor)
    case 'PRODUCT_CARD':
      return renderProductCard(block, primaryColor)
    case 'COUPON':
      return renderCoupon(block, primaryColor)
    case 'PROFILE':
      return renderProfile(block, primaryColor)
    case 'UNSUBSCRIBE':
      return renderUnsubscribe(block, primaryColor)
    default:
      return ''
  }
}

function renderHeading(block: NewsletterBlock): string {
  const level = block.level || 1
  const align = block.align || 'left'
  const style = BLOCK_STYLES.heading[`h${level}` as keyof typeof BLOCK_STYLES.heading]
  
  return `
    <h${level} style="font-size: ${style.fontSize}; font-weight: ${style.fontWeight}; line-height: ${style.lineHeight}; margin: ${style.margin}; color: ${style.color}; text-align: ${align};">
      ${escapeHtml(block.text || '')}
    </h${level}>
  `
}

function renderParagraph(block: NewsletterBlock): string {
  const align = block.align || 'left'
  const style = BLOCK_STYLES.paragraph
  
  return `
    <p style="font-size: ${style.fontSize}; line-height: ${style.lineHeight}; margin: ${style.margin}; color: ${style.color}; text-align: ${align};">
      ${escapeHtml(block.content || '')}
    </p>
  `
}

function renderButton(block: NewsletterBlock, primaryColor: string): string {
  const align = block.align || 'center'
  const variant = block.buttonVariant || 'primary'
  const href = block.href || '#'
  const text = block.buttonText || 'Button'
  
  let buttonStyle = ''
  switch (variant) {
    case 'primary':
      buttonStyle = `display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; color: #ffffff; background-color: ${primaryColor};`
      break
    case 'secondary':
      buttonStyle = 'display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; color: #374151; background-color: #f3f4f6;'
      break
    case 'outline':
      buttonStyle = `display: inline-block; padding: 10px 22px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; border: 2px solid ${primaryColor}; color: ${primaryColor}; background-color: transparent;`
      break
  }
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td align="${align}">
          <a href="${escapeHtml(href)}" target="_blank" style="${buttonStyle}">
            ${escapeHtml(text)}
          </a>
        </td>
      </tr>
    </table>
  `
}

function renderImage(block: NewsletterBlock): string {
  if (!block.src) {
    return ''
  }
  
  const align = block.align || 'center'
  const width = block.imageWidth || 100
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td align="${align}">
          <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || '')}" style="max-width: ${width}%; height: auto; display: block;">
        </td>
      </tr>
    </table>
  `
}

function renderDivider(block: NewsletterBlock): string {
  const style = block.dividerStyle || 'solid'
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td style="border-top: 1px ${style} #e5e7eb;"></td>
      </tr>
    </table>
  `
}

function renderSpacer(block: NewsletterBlock): string {
  const size = block.spacerSize || 'MEDIUM'
  const height = BLOCK_STYLES.spacer[size].height
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="height: ${height};"></td>
      </tr>
    </table>
  `
}

function renderTwoColumn(block: NewsletterBlock, primaryColor: string): string {
  const widths = block.columnWidths || [50, 50]
  const childBlocks = block.childBlocks || []
  
  const leftBlocks = childBlocks
    .filter(b => b.columnIndex === 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const rightBlocks = childBlocks
    .filter(b => b.columnIndex === 1)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  
  const leftContent = leftBlocks.map(b => renderBlock(b, primaryColor)).join('')
  const rightContent = rightBlocks.map(b => renderBlock(b, primaryColor)).join('')
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td width="${widths[0]}%" valign="top" style="padding-right: 10px;">
          ${leftContent || ''}
        </td>
        <td width="${widths[1]}%" valign="top" style="padding-left: 10px;">
          ${rightContent || ''}
        </td>
      </tr>
    </table>
  `
}

function renderThreeColumn(block: NewsletterBlock, primaryColor: string): string {
  const widths = block.columnWidths || [33, 34, 33]
  const childBlocks = block.childBlocks || []
  
  const col1 = childBlocks.filter(b => b.columnIndex === 0).sort((a, b) => a.sortOrder - b.sortOrder)
  const col2 = childBlocks.filter(b => b.columnIndex === 1).sort((a, b) => a.sortOrder - b.sortOrder)
  const col3 = childBlocks.filter(b => b.columnIndex === 2).sort((a, b) => a.sortOrder - b.sortOrder)
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td width="${widths[0]}%" valign="top" style="padding-right: 8px;">
          ${col1.map(b => renderBlock(b, primaryColor)).join('')}
        </td>
        <td width="${widths[1]}%" valign="top" style="padding: 0 8px;">
          ${col2.map(b => renderBlock(b, primaryColor)).join('')}
        </td>
        <td width="${widths[2]}%" valign="top" style="padding-left: 8px;">
          ${col3.map(b => renderBlock(b, primaryColor)).join('')}
        </td>
      </tr>
    </table>
  `
}

function renderSocialLinks(block: NewsletterBlock, primaryColor: string): string {
  const socialLinks = block.socialLinks || []
  const align = block.align || 'center'
  const iconSize = block.socialIconSize || 'medium'
  
  const sizes = { small: 24, medium: 32, large: 40 }
  const size = sizes[iconSize]
  
  if (socialLinks.length === 0) {
    return ''
  }
  
  const iconsHtml = socialLinks.map(link => {
    const iconPath = SOCIAL_ICONS[link.platform as keyof typeof SOCIAL_ICONS] || ''
    return `
      <td style="padding: 0 6px;">
        <a href="${escapeHtml(link.url || '#')}" target="_blank" style="display: inline-block; width: ${size}px; height: ${size}px; background-color: ${primaryColor}; border-radius: 50%; text-decoration: none;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="${size}" height="${size}">
            <tr>
              <td align="center" valign="middle">
                <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="${iconPath}"/>
                </svg>
              </td>
            </tr>
          </table>
        </a>
      </td>
    `
  }).join('')
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td align="${align}">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              ${iconsHtml}
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

function renderQuote(block: NewsletterBlock, primaryColor: string): string {
  const quoteText = block.quoteText || ''
  const quoteAuthor = block.quoteAuthor || ''
  const quoteRole = block.quoteRole || ''
  const align = block.align || 'center'
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td style="padding: 20px 24px; background-color: #f9fafb; border-left: 4px solid ${primaryColor}; border-radius: 0 8px 8px 0; text-align: ${align};">
          <p style="font-size: 18px; font-style: italic; line-height: 1.6; color: #374151; margin: 0 0 12px;">
            &ldquo;${escapeHtml(quoteText)}&rdquo;
          </p>
          ${(quoteAuthor || quoteRole) ? `
            <p style="font-size: 14px; margin: 0;">
              ${quoteAuthor ? `<strong style="color: #111827;">${escapeHtml(quoteAuthor)}</strong>` : ''}
              ${quoteAuthor && quoteRole ? ' &bull; ' : ''}
              ${quoteRole ? `<span style="color: #6b7280;">${escapeHtml(quoteRole)}</span>` : ''}
            </p>
          ` : ''}
        </td>
      </tr>
    </table>
  `
}

function renderList(block: NewsletterBlock, primaryColor: string): string {
  const listItems = block.listItems || []
  const listStyle = block.listStyle || 'bullet'
  const align = block.align || 'left'
  
  if (listItems.length === 0) {
    return ''
  }
  
  const itemsHtml = listItems.map((item, idx) => {
    let prefix = ''
    switch (listStyle) {
      case 'bullet':
        prefix = '&bull;'
        break
      case 'number':
        prefix = `${idx + 1}.`
        break
      case 'check':
        prefix = `<span style="color: ${primaryColor};">&#10003;</span>`
        break
    }
    
    return `
      <tr>
        <td style="padding: 4px 0; vertical-align: top; width: 24px; text-align: left;">
          ${prefix}
        </td>
        <td style="padding: 4px 0; vertical-align: top; color: #374151;">
          ${escapeHtml(item)}
        </td>
      </tr>
    `
  }).join('')
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td align="${align}">
          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size: 16px; line-height: 1.6;">
            ${itemsHtml}
          </table>
        </td>
      </tr>
    </table>
  `
}

function renderVideo(block: NewsletterBlock, primaryColor: string): string {
  const thumbnailUrl = block.videoThumbnailUrl || ''
  const videoUrl = block.videoUrl || '#'
  const videoTitle = block.videoTitle || 'Video ansehen'
  const align = block.align || 'center'
  
  if (!thumbnailUrl) {
    // Fallback: Button statt Thumbnail
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
        <tr>
          <td align="${align}">
            <a href="${escapeHtml(videoUrl)}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; color: #ffffff; background-color: ${primaryColor};">
              &#9658; ${escapeHtml(videoTitle)}
            </a>
          </td>
        </tr>
      </table>
    `
  }
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td align="${align}">
          <a href="${escapeHtml(videoUrl)}" target="_blank" style="display: inline-block; position: relative; text-decoration: none;">
            <img src="${escapeHtml(thumbnailUrl)}" alt="${escapeHtml(videoTitle)}" style="max-width: 100%; height: auto; border-radius: 8px;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; background-color: ${primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <span style="color: #ffffff; font-size: 24px; margin-left: 4px;">&#9658;</span>
            </div>
          </a>
        </td>
      </tr>
    </table>
  `
}

function renderProductCard(block: NewsletterBlock, primaryColor: string): string {
  const productName = block.productName || 'Produktname'
  const productDescription = block.productDescription || ''
  const productPrice = block.productPrice || ''
  const productImageUrl = block.productImageUrl || ''
  const productButtonText = block.productButtonText || 'Jetzt kaufen'
  const productButtonUrl = block.productButtonUrl || '#'
  const align = block.align || 'center'
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td align="${align}">
          <table role="presentation" cellpadding="0" cellspacing="0" width="280" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            ${productImageUrl ? `
              <tr>
                <td>
                  <img src="${escapeHtml(productImageUrl)}" alt="${escapeHtml(productName)}" style="width: 100%; height: auto; display: block;">
                </td>
              </tr>
            ` : ''}
            <tr>
              <td style="padding: 16px;">
                <h4 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px;">${escapeHtml(productName)}</h4>
                ${productDescription ? `<p style="font-size: 14px; color: #6b7280; margin: 0 0 12px; line-height: 1.5;">${escapeHtml(productDescription)}</p>` : ''}
                ${productPrice ? `<p style="font-size: 20px; font-weight: 700; color: ${primaryColor}; margin: 0 0 16px;">${escapeHtml(productPrice)}</p>` : ''}
                <a href="${escapeHtml(productButtonUrl)}" target="_blank" style="display: inline-block; padding: 10px 20px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; color: #ffffff; background-color: ${primaryColor};">
                  ${escapeHtml(productButtonText)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

function renderCoupon(block: NewsletterBlock, primaryColor: string): string {
  const couponCode = block.couponCode || 'CODE'
  const couponDescription = block.couponDescription || ''
  const couponExpiry = block.couponExpiry || ''
  const align = block.align || 'center'
  
  // Hex to RGB for background opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129'
  }
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td align="${align}">
          <table role="presentation" cellpadding="0" cellspacing="0" style="border: 2px dashed ${primaryColor}; border-radius: 8px; background-color: rgba(${hexToRgb(primaryColor)}, 0.1);">
            <tr>
              <td style="padding: 20px; text-align: center;">
                <div style="display: inline-block; padding: 8px 16px; background-color: #ffffff; border-radius: 4px; margin-bottom: 12px;">
                  <span style="font-family: monospace; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: ${primaryColor};">
                    ${escapeHtml(couponCode)}
                  </span>
                </div>
                ${couponDescription ? `<p style="font-size: 14px; color: #374151; margin: 0 0 8px;">${escapeHtml(couponDescription)}</p>` : ''}
                ${couponExpiry ? `<p style="font-size: 12px; color: #6b7280; margin: 0;">Gültig bis: ${escapeHtml(couponExpiry)}</p>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

function renderProfile(block: NewsletterBlock, primaryColor: string): string {
  const profileImageUrl = block.profileImageUrl || ''
  const profileName = block.profileName || 'Name'
  const profileRole = block.profileRole || ''
  const profileDescription = block.profileDescription || ''
  const align = block.align || 'center'
  
  const initials = profileName.charAt(0).toUpperCase()
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td align="${align}">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align: center;">
                ${profileImageUrl ? `
                  <img src="${escapeHtml(profileImageUrl)}" alt="${escapeHtml(profileName)}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px;">
                ` : `
                  <div style="width: 80px; height: 80px; border-radius: 50%; background-color: ${primaryColor}; margin: 0 auto 12px; line-height: 80px; text-align: center;">
                    <span style="color: #ffffff; font-size: 32px; font-weight: 700;">${initials}</span>
                  </div>
                `}
                <h4 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">${escapeHtml(profileName)}</h4>
                ${profileRole ? `<p style="font-size: 14px; color: #6b7280; margin: 4px 0 0;">${escapeHtml(profileRole)}</p>` : ''}
                ${profileDescription ? `<p style="font-size: 14px; color: #374151; margin: 8px 0 0; line-height: 1.5; max-width: 280px;">${escapeHtml(profileDescription)}</p>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

/**
 * Rendert den Unsubscribe-Block mit Resend-Platzhalter
 */
function renderUnsubscribe(block: NewsletterBlock, primaryColor: string): string {
  const unsubscribeText = block.unsubscribeText || 'Du möchtest keine E-Mails mehr von uns erhalten?'
  const unsubscribeLinkText = block.unsubscribeLinkText || 'Hier abmelden'
  const align = block.align || 'center'

  // Verwende den Resend Unsubscribe-Platzhalter
  // {{{RESEND_UNSUBSCRIBE_URL}}} wird von Resend automatisch ersetzt
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td style="padding: 16px 0; border-top: 1px solid #e5e7eb; text-align: ${align};">
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">${escapeHtml(unsubscribeText)}</p>
          <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="font-size: 13px; color: ${primaryColor}; text-decoration: underline;">${escapeHtml(unsubscribeLinkText)}</a>
        </td>
      </tr>
    </table>
  `
}

/**
 * HTML-Escape für sichere Ausgabe
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
