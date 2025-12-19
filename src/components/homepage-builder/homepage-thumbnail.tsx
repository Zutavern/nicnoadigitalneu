'use client'

import { useMemo } from 'react'
import { Globe, Loader2, AlertCircle, FileEdit, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HomepageProjectClient, HomepagePage } from '@/lib/homepage-builder'
import { STATUS_CONFIGS, DESIGN_STYLE_CONFIGS } from '@/lib/homepage-builder'

interface HomepageThumbnailProps {
  project: HomepageProjectClient
  scale?: number
  className?: string
}

export function HomepageThumbnail({ project, scale = 0.25, className }: HomepageThumbnailProps) {
  const designConfig = DESIGN_STYLE_CONFIGS[project.designStyle]
  const primaryColor = project.brandingColor || '#10b981'
  
  // Mini-Vorschau der Homepage
  const pages = project.pages as HomepagePage[]
  const generatedPagesCount = pages.filter(p => p.isGenerated).length
  const totalPagesCount = pages.length
  
  const statusConfig = STATUS_CONFIGS[project.status]
  
  const StatusIcon = useMemo(() => {
    switch (project.status) {
      case 'DRAFT': return FileEdit
      case 'GENERATING': return Loader2
      case 'READY': return CheckCircle
      case 'PUBLISHED': return Globe
      case 'ERROR': return AlertCircle
      default: return FileEdit
    }
  }, [project.status])

  return (
    <div 
      className={cn(
        "relative bg-white rounded-lg overflow-hidden border shadow-sm",
        className
      )}
      style={{
        width: `${400 * scale}px`,
        height: `${600 * scale}px`,
      }}
    >
      {/* Mini-Header */}
      <div 
        className="p-2"
        style={{ 
          backgroundColor: primaryColor,
          height: `${80 * scale}px`
        }}
      >
        {project.brandingLogoUrl ? (
          <div 
            className="bg-white/20 rounded"
            style={{ 
              width: `${60 * scale}px`, 
              height: `${20 * scale}px` 
            }}
          />
        ) : (
          <div 
            className="text-white font-bold truncate"
            style={{ fontSize: `${12 * scale}px` }}
          >
            {project.name}
          </div>
        )}
      </div>

      {/* Mini-Hero */}
      <div 
        className="relative"
        style={{ 
          height: `${200 * scale}px`,
          background: `linear-gradient(135deg, ${primaryColor}10 0%, ${primaryColor}30 100%)`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div 
              className="bg-gray-300 rounded mx-auto mb-2"
              style={{ 
                width: `${120 * scale}px`, 
                height: `${16 * scale}px` 
              }}
            />
            <div 
              className="bg-gray-200 rounded mx-auto"
              style={{ 
                width: `${80 * scale}px`, 
                height: `${10 * scale}px` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Mini-Content */}
      <div 
        className="p-2 space-y-2"
        style={{ padding: `${8 * scale}px` }}
      >
        {/* Content-Blöcke simulieren */}
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              className="flex-1 bg-gray-100 rounded"
              style={{ 
                height: `${50 * scale}px`,
                borderRadius: designConfig.cssVariables.borderRadius === '0px' ? '0' : `${4 * scale}px`
              }}
            />
          ))}
        </div>
        <div 
          className="bg-gray-50 rounded"
          style={{ 
            height: `${80 * scale}px`,
            borderRadius: designConfig.cssVariables.borderRadius === '0px' ? '0' : `${4 * scale}px`
          }}
        />
      </div>

      {/* Mini-Footer */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gray-800 p-1"
        style={{ 
          height: `${40 * scale}px`,
          padding: `${4 * scale}px`
        }}
      >
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i}
              className="bg-gray-600 rounded"
              style={{ 
                width: `${20 * scale}px`, 
                height: `${6 * scale}px` 
              }}
            />
          ))}
        </div>
      </div>

      {/* Status-Badge */}
      <div 
        className={cn(
          "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          project.status === 'PUBLISHED' && "bg-green-100 text-green-700",
          project.status === 'READY' && "bg-blue-100 text-blue-700",
          project.status === 'GENERATING' && "bg-yellow-100 text-yellow-700",
          project.status === 'DRAFT' && "bg-gray-100 text-gray-700",
          project.status === 'ERROR' && "bg-red-100 text-red-700"
        )}
        style={{ 
          fontSize: `${10 * scale * 4}px`,
          padding: `${2 * scale * 4}px ${6 * scale * 4}px`
        }}
      >
        <StatusIcon 
          className={cn(
            project.status === 'GENERATING' && "animate-spin"
          )}
          style={{ 
            width: `${12 * scale * 4}px`, 
            height: `${12 * scale * 4}px` 
          }}
        />
        {project.status === 'GENERATING' ? (
          <span>{generatedPagesCount}/{totalPagesCount}</span>
        ) : (
          <span>{statusConfig.label}</span>
        )}
      </div>
    </div>
  )
}



