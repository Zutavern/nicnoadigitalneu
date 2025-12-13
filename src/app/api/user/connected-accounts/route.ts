import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Available OAuth providers
const AVAILABLE_PROVIDERS = [
  { id: 'google', name: 'Google', icon: 'google' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
  { id: 'apple', name: 'Apple', icon: 'apple' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook' },
]

// GET /api/user/connected-accounts - Verbundene Konten abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Get user's connected accounts
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: {
        provider: true,
        providerAccountId: true,
      },
    })

    // Map to provider info
    const connectedProviders = accounts.map(acc => acc.provider)

    const result = AVAILABLE_PROVIDERS.map(provider => ({
      ...provider,
      connected: connectedProviders.includes(provider.id),
      accountId: accounts.find(acc => acc.provider === provider.id)?.providerAccountId || null,
    }))

    return NextResponse.json({
      accounts: result,
      hasMultipleAccounts: accounts.length > 1,
    })
  } catch (error) {
    console.error('Error fetching connected accounts:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

// DELETE /api/user/connected-accounts - Konto trennen
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json({ error: 'Provider nicht angegeben' }, { status: 400 })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        password: true,
        email: true,
        accounts: {
          select: { provider: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Check if user has password or another connected account
    const hasPassword = !!user.password
    const otherAccounts = user.accounts.filter(acc => acc.provider !== provider)
    
    if (!hasPassword && otherAccounts.length === 0) {
      return NextResponse.json(
        { error: 'Du kannst dieses Konto nicht trennen, da es deine einzige Anmeldemethode ist. Setze zuerst ein Passwort.' },
        { status: 400 }
      )
    }

    // Delete the account connection
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider,
      },
    })

    // Log this action
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: user.email,
        event: 'ACCOUNT_DISCONNECTED',
        status: 'SUCCESS',
        message: `${provider} Konto getrennt`,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: `${provider} Konto erfolgreich getrennt` 
    })
  } catch (error) {
    console.error('Error disconnecting account:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

