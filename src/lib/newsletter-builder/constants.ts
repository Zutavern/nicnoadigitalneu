// Newsletter Builder Constants

// E-Mail Styling Constants (für E-Mail-Client-Kompatibilität)
export const EMAIL_STYLES = {
  // Container
  body: {
    backgroundColor: '#f4f4f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    margin: '40px auto',
    maxWidth: '600px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  // Header
  header: {
    padding: '24px',
    textAlign: 'center' as const,
  },
  // Content
  content: {
    padding: '32px 40px',
  },
  // Footer
  footer: {
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
    padding: '24px 40px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 16px',
  },
  footerLinks: {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 12px',
  },
  footerLink: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
  copyright: {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0',
  },
  // Text Logo
  textLogoMain: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.025em',
    color: '#ffffff',
  },
  textLogoAmp: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.025em',
  },
} as const

// Block-spezifische Styles
export const BLOCK_STYLES = {
  heading: {
    h1: {
      fontSize: '28px',
      fontWeight: '700',
      lineHeight: '1.2',
      margin: '0 0 16px',
      color: '#111827',
    },
    h2: {
      fontSize: '22px',
      fontWeight: '600',
      lineHeight: '1.3',
      margin: '0 0 12px',
      color: '#111827',
    },
    h3: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.4',
      margin: '0 0 8px',
      color: '#111827',
    },
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 16px',
    color: '#374151',
  },
  button: {
    primary: {
      display: 'inline-block',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600',
      textDecoration: 'none',
      borderRadius: '6px',
      color: '#ffffff',
    },
    secondary: {
      display: 'inline-block',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600',
      textDecoration: 'none',
      borderRadius: '6px',
      color: '#374151',
      backgroundColor: '#f3f4f6',
    },
    outline: {
      display: 'inline-block',
      padding: '10px 22px',
      fontSize: '16px',
      fontWeight: '600',
      textDecoration: 'none',
      borderRadius: '6px',
      border: '2px solid',
      backgroundColor: 'transparent',
    },
  },
  divider: {
    solid: {
      borderTop: '1px solid #e5e7eb',
      margin: '16px 0',
    },
    dashed: {
      borderTop: '1px dashed #e5e7eb',
      margin: '16px 0',
    },
    dotted: {
      borderTop: '1px dotted #e5e7eb',
      margin: '16px 0',
    },
  },
  spacer: {
    SMALL: { height: '16px' },
    MEDIUM: { height: '32px' },
    LARGE: { height: '48px' },
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto 16px',
  },
  // Neue Block-Styles
  list: {
    container: {
      margin: '0 0 16px',
      padding: '0',
    },
    item: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#374151',
      margin: '0 0 8px',
      paddingLeft: '8px',
    },
    bullet: {
      listStyleType: 'disc',
      paddingLeft: '20px',
    },
    number: {
      listStyleType: 'decimal',
      paddingLeft: '20px',
    },
    check: {
      listStyleType: 'none',
      paddingLeft: '0',
    },
  },
  quote: {
    container: {
      padding: '20px 24px',
      margin: '16px 0',
      backgroundColor: '#f9fafb',
      borderLeft: '4px solid',
      borderRadius: '0 8px 8px 0',
    },
    text: {
      fontSize: '18px',
      fontStyle: 'italic',
      lineHeight: '1.6',
      color: '#374151',
      margin: '0 0 12px',
    },
    author: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
      margin: '0',
    },
    role: {
      fontSize: '13px',
      color: '#6b7280',
      margin: '0',
    },
  },
  video: {
    container: {
      position: 'relative' as const,
      margin: '16px 0',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    thumbnail: {
      width: '100%',
      height: 'auto',
      display: 'block',
    },
    playButton: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '64px',
      height: '64px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '50%',
    },
  },
  productCard: {
    container: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      margin: '16px 0',
    },
    image: {
      width: '100%',
      height: 'auto',
      display: 'block',
    },
    content: {
      padding: '16px',
    },
    name: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 8px',
    },
    description: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0 0 12px',
      lineHeight: '1.5',
    },
    price: {
      fontSize: '20px',
      fontWeight: '700',
      margin: '0 0 16px',
    },
  },
  coupon: {
    container: {
      backgroundColor: '#f0fdf4',
      border: '2px dashed',
      borderRadius: '8px',
      padding: '20px',
      margin: '16px 0',
      textAlign: 'center' as const,
    },
    code: {
      fontSize: '24px',
      fontWeight: '700',
      letterSpacing: '2px',
      fontFamily: 'monospace',
      padding: '8px 16px',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      display: 'inline-block',
      margin: '0 0 12px',
    },
    description: {
      fontSize: '14px',
      color: '#374151',
      margin: '0 0 8px',
    },
    expiry: {
      fontSize: '12px',
      color: '#6b7280',
      margin: '0',
    },
  },
  profile: {
    container: {
      textAlign: 'center' as const,
      padding: '16px',
      margin: '16px 0',
    },
    image: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      margin: '0 auto 12px',
      objectFit: 'cover' as const,
    },
    name: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 4px',
    },
    role: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0 0 8px',
    },
    description: {
      fontSize: '14px',
      color: '#374151',
      lineHeight: '1.5',
      margin: '0',
    },
  },
  socialLinks: {
    container: {
      margin: '16px 0',
      textAlign: 'center' as const,
    },
    icon: {
      small: { width: '24px', height: '24px', margin: '0 6px' },
      medium: { width: '32px', height: '32px', margin: '0 8px' },
      large: { width: '40px', height: '40px', margin: '0 10px' },
    },
  },
} as const

// Footer Links für E-Mails
export const FOOTER_LINKS = [
  { label: 'Datenschutz', href: 'https://www.nicnoa.online/datenschutz' },
  { label: 'Impressum', href: 'https://www.nicnoa.online/impressum' },
  { label: 'AGB', href: 'https://www.nicnoa.online/agb' },
  { label: 'Login', href: 'https://www.nicnoa.online/login' },
] as const

// Default Primary Color (wird von Branding überschrieben)
export const DEFAULT_PRIMARY_COLOR = '#10b981' // Emerald-500

// Social Media Icon SVG Paths (für E-Mail-Kompatibilität)
export const SOCIAL_ICONS = {
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
} as const
