'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast.success('Erfolgreich eingeloggt')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Willkommen zurück
        </h1>
        <p className="text-sm text-muted-foreground">
          Geben Sie Ihre E-Mail und Ihr Passwort ein, um sich anzumelden
        </p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Passwort</Label>
              <Button variant="link" className="px-0 font-normal" asChild>
                <Link href="/passwort-vergessen">
                  Passwort vergessen?
                </Link>
              </Button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              required
              className="bg-background"
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Lädt...' : 'Anmelden'}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Oder
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        Noch kein Konto?{' '}
        <Link
          href="/registrieren"
          className="font-medium text-primary hover:underline"
        >
          Jetzt registrieren
        </Link>
      </div>
    </div>
  )
} 