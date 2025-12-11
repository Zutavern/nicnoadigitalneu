import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { isDemoModeActive, getMockAdminSecurity } from '@/lib/mock-data'

// Helper zum Generieren eines sicheren API-Keys
function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `noa_${crypto.randomBytes(32).toString('hex')}`
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  const prefix = key.substring(0, 12)
  return { key, hash, prefix }
}

// GET /api/admin/security/api-keys - Hole alle API-Keys
export async function GET(request: Request) {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive({ ignoreForAdmin: true })) {
      const mockData = getMockAdminSecurity()
      return NextResponse.json({
        apiKeys: mockData.apiKeys,
        stats: { total: mockData.apiKeys.length, active: mockData.summary.activeApiKeys, testMode: 0, expired: 0 }
      })
    }

    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: Record<string, unknown> = {}
    if (!includeInactive) where.isActive = true

    const apiKeys = await prisma.apiKey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        isActive: true,
        isTestMode: true,
        lastUsedAt: true,
        usageCount: true,
        expiresAt: true,
        createdById: true,
        createdAt: true,
        updatedAt: true
        // 'key' (hash) wird nicht zurückgegeben
      }
    })

    // Hole Creator-Infos
    const creatorIds = [...new Set(apiKeys.map(k => k.createdById))]
    const creators = await prisma.user.findMany({
      where: { id: { in: creatorIds } },
      select: { id: true, name: true, email: true }
    })
    const creatorsMap = new Map(creators.map(c => [c.id, c]))

    const keysWithCreators = apiKeys.map(k => ({
      ...k,
      createdBy: creatorsMap.get(k.createdById) || null
    }))

    // Statistiken
    const stats = {
      total: apiKeys.length,
      active: apiKeys.filter(k => k.isActive).length,
      testMode: apiKeys.filter(k => k.isTestMode).length,
      expired: apiKeys.filter(k => k.expiresAt && new Date(k.expiresAt) < new Date()).length
    }

    return NextResponse.json({
      apiKeys: keysWithCreators,
      stats
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der API-Keys' },
      { status: 500 }
    )
  }
}

// POST /api/admin/security/api-keys - Erstelle neuen API-Key
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { name, permissions = [], isTestMode = false, expiresIn } = body

    if (!name) {
      return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 })
    }

    // Generiere API-Key
    const { key, hash, prefix } = generateApiKey()

    // Berechne Ablaufdatum wenn angegeben
    let expiresAt: Date | undefined
    if (expiresIn) {
      expiresAt = new Date()
      if (expiresIn === '30d') expiresAt.setDate(expiresAt.getDate() + 30)
      else if (expiresIn === '90d') expiresAt.setDate(expiresAt.getDate() + 90)
      else if (expiresIn === '1y') expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key: hash,
        keyPrefix: prefix,
        permissions,
        isTestMode,
        expiresAt,
        createdById: session.user.id
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        isActive: true,
        isTestMode: true,
        expiresAt: true,
        createdAt: true
      }
    })

    // Log erstellen
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        event: 'API_KEY_CREATED',
        status: 'SUCCESS',
        message: `API-Key "${name}" erstellt`,
        metadata: { 
          apiKeyId: apiKey.id, 
          keyPrefix: prefix, 
          isTestMode,
          permissions 
        }
      }
    })

    // Gib den ungehashten Key nur bei der Erstellung zurück!
    return NextResponse.json({
      ...apiKey,
      key // Der echte Key - nur einmal sichtbar!
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des API-Keys' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/security/api-keys - Widerrufe API-Key
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'API-Key ID erforderlich' }, { status: 400 })
    }

    const existingKey = await prisma.apiKey.findUnique({
      where: { id: keyId }
    })

    if (!existingKey) {
      return NextResponse.json({ error: 'API-Key nicht gefunden' }, { status: 404 })
    }

    // Deaktivieren statt löschen für Audit-Trail
    const revokedKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false }
    })

    // Log erstellen
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        event: 'API_KEY_REVOKED',
        status: 'WARNING',
        message: `API-Key "${existingKey.name}" widerrufen`,
        metadata: { 
          apiKeyId: keyId, 
          keyPrefix: existingKey.keyPrefix 
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'API-Key erfolgreich widerrufen',
      key: {
        id: revokedKey.id,
        name: revokedKey.name,
        isActive: revokedKey.isActive
      }
    })
  } catch (error) {
    console.error('Error revoking API key:', error)
    return NextResponse.json(
      { error: 'Fehler beim Widerrufen des API-Keys' },
      { status: 500 }
    )
  }
}
