/**
 * Homepage Publish API
 * 
 * POST: Veröffentlicht eine Homepage auf einer Subdomain oder Custom Domain
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDomainToProject } from '@/lib/vercel/domains'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { useSubdomain, customDomain } = body as { 
      useSubdomain?: boolean
      customDomain?: string 
    }

    // Projekt laden
    const project = await prisma.homepageProject.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })
    }

    if (project.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    // Prüfe ob Projekt bereit ist
    if (project.status !== 'READY' && project.status !== 'GENERATED') {
      return NextResponse.json({ 
        error: 'Projekt ist noch nicht bereit für die Veröffentlichung',
        status: project.status
      }, { status: 400 })
    }

    let publishedUrl: string
    let verificationRequired = false
    let verificationInfo: { type: string; token: string; domain: string } | null = null

    if (useSubdomain || !customDomain) {
      // Kostenlose Subdomain verwenden
      publishedUrl = `https://${project.slug}.nicnoa.online`
      
      // Subdomain zu Vercel hinzufügen (falls noch nicht vorhanden)
      const subdomainResult = await addDomainToProject(`${project.slug}.nicnoa.online`)
      
      if (!subdomainResult.success) {
        console.error('Failed to add subdomain:', subdomainResult.error)
        // Trotzdem fortfahren - die Subdomain könnte bereits existieren
      }
    } else {
      // Custom Domain verwenden
      publishedUrl = `https://${customDomain}`
      
      // Domain zu Vercel hinzufügen
      const domainResult = await addDomainToProject(customDomain)
      
      if (!domainResult.success) {
        return NextResponse.json({ 
          error: domainResult.error || 'Fehler beim Hinzufügen der Domain'
        }, { status: 500 })
      }

      if (!domainResult.verified && domainResult.verification) {
        verificationRequired = true
        verificationInfo = {
          type: domainResult.verification.type,
          token: domainResult.verification.token,
          domain: domainResult.verification.domain,
        }
      }
    }

    // Projekt aktualisieren
    const updatedProject = await prisma.homepageProject.update({
      where: { id },
      data: {
        isPublished: !verificationRequired, // Nur veröffentlicht wenn keine Verifizierung nötig
        publishedUrl,
        publishedAt: verificationRequired ? undefined : new Date(),
        status: 'PUBLISHED',
      }
    })

    return NextResponse.json({
      success: true,
      publishedUrl,
      isPublished: updatedProject.isPublished,
      verificationRequired,
      verification: verificationInfo,
    })

  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Veröffentlichen' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Hebt die Veröffentlichung auf
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { id } = await params

    // Projekt laden
    const project = await prisma.homepageProject.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })
    }

    if (project.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    // Projekt aktualisieren
    await prisma.homepageProject.update({
      where: { id },
      data: {
        isPublished: false,
        publishedUrl: null,
        publishedAt: null,
        status: 'READY',
      }
    })

    // TODO: Domain von Vercel entfernen (optional)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unpublish error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aufheben der Veröffentlichung' },
      { status: 500 }
    )
  }
}
