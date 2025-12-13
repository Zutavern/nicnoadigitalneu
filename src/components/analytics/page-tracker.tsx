'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

interface PageTrackerProps {
  eventName: string
  properties?: Record<string, unknown>
}

/**
 * Client component to track page views from Server Components.
 * Add this to any server-rendered page to track specific events.
 */
export function PageTracker({ eventName, properties }: PageTrackerProps) {
  useEffect(() => {
    trackEvent(eventName, properties)
  }, [eventName, properties])

  return null
}

// Preset page trackers for common pages
export function HomepageTracker() {
  return <PageTracker eventName="homepage_viewed" />
}

export function BlogListTracker() {
  return <PageTracker eventName="blog_list_viewed" />
}

export function BlogArticleTracker({ slug, title }: { slug: string; title: string }) {
  return <PageTracker eventName="blog_article_viewed" properties={{ slug, title }} />
}

export function FeaturesTracker() {
  return <PageTracker eventName="features_viewed" />
}

export function ProductTracker() {
  return <PageTracker eventName="product_viewed" />
}

export function PricingTracker() {
  return <PageTracker eventName="pricing_viewed" />
}

export function CareersTracker() {
  return <PageTracker eventName="careers_viewed" />
}

export function JobTracker({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  return <PageTracker eventName="job_viewed" properties={{ job_id: jobId, job_title: jobTitle }} />
}

export function PartnerTracker() {
  return <PageTracker eventName="partner_page_viewed" />
}

export function BetaProgramTracker() {
  return <PageTracker eventName="beta_page_viewed" />
}

export function RoadmapTracker() {
  return <PageTracker eventName="roadmap_viewed" />
}

export function AboutUsTracker() {
  return <PageTracker eventName="about_us_viewed" />
}

export function FAQTracker() {
  return <PageTracker eventName="faq_viewed" />
}

export function UpdatesTracker() {
  return <PageTracker eventName="updates_viewed" />
}


