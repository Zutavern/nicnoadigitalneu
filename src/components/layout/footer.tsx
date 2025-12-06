import Link from 'next/link'
import { Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-16">
        {/* Top Section */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">
                NICNOA <span className="text-primary">&</span> CO.
              </span>
              <span className="text-sm font-medium text-muted-foreground">DIGITAL</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Revolutionieren Sie die Art und Weise, wie Salon-Spaces verwaltet werden. 
              Wir machen Coworking im Beauty-Bereich einfach, effizient und profitabel.
            </p>
            <div className="flex space-x-4">
              <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-medium">PRODUKT</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="/preise" className="hover:text-foreground">Preise</Link></li>
              <li><Link href="/roadmap" className="hover:text-foreground">Roadmap</Link></li>
              <li><Link href="/updates" className="hover:text-foreground">Updates</Link></li>
              <li><Link href="/beta-programm" className="hover:text-foreground">Beta-Programm</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-medium">UNTERNEHMEN</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/uber-uns" className="hover:text-foreground">Über uns</Link></li>
              <li><Link href="/partner" className="hover:text-foreground">Partner</Link></li>
              <li><Link href="/karriere" className="hover:text-foreground">Karriere</Link></li>
              <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="/presse" className="hover:text-foreground">Presse</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="font-medium">RESSOURCEN</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/dokumentation" className="hover:text-foreground">Dokumentation</Link></li>
              <li><Link href="/support" className="hover:text-foreground">Support</Link></li>
              <li><Link href="/api" className="hover:text-foreground">API</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
              <li><Link href="/status" className="hover:text-foreground">Status</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
            <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
            <Link href="/agb" className="hover:text-foreground">AGB</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 NICNOA & CO. DIGITAL. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  )
} 