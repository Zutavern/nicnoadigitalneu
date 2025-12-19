'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { HomepageProjectClient } from '@/lib/homepage-builder'

// Dynamischer Import ohne SSR - verhindert Hydration-Mismatch bei Radix UI
const EditorContainer = dynamic(
  () => import('./editor-container').then(mod => mod.EditorContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
)

interface EditorWrapperProps {
  project: HomepageProjectClient
  basePath: string
}

export function EditorWrapper({ project, basePath }: EditorWrapperProps) {
  return <EditorContainer project={project} basePath={basePath} />
}



