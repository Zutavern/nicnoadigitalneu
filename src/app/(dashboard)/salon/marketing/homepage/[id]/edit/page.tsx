import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EditorWrapper } from '@/components/homepage-builder/editor'
import type { HomepageProjectClient, HomepagePage } from '@/lib/homepage-builder'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSalonHomepagePage({ params }: EditPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params

  const project = await prisma.homepageProject.findUnique({
    where: { id }
  })

  if (!project) {
    notFound()
  }

  // Prüfen ob der Benutzer Zugriff hat
  if (project.userId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/salon/marketing/homepage')
  }

  // Projekt für Client aufbereiten
  const clientProject: HomepageProjectClient = {
    id: project.id,
    userId: project.userId,
    name: project.name,
    slug: project.slug,
    templateType: project.templateType,
    pageConfig: project.pageConfig,
    designStyle: project.designStyle,
    contactData: project.contactData as HomepageProjectClient['contactData'],
    v0GenerationId: project.v0GenerationId,
    v0Error: project.v0Error,
    pages: project.pages as HomepagePage[],
    brandingColor: project.brandingColor,
    brandingLogoUrl: project.brandingLogoUrl,
    fontHeading: project.fontHeading,
    fontBody: project.fontBody,
    status: project.status,
    isPublished: project.isPublished,
    publishedAt: project.publishedAt?.toISOString() || null,
    publishedUrl: project.publishedUrl,
    viewCount: project.viewCount,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  }

  return (
    <EditorWrapper 
      project={clientProject}
      basePath="/salon/marketing/homepage"
    />
  )
}

