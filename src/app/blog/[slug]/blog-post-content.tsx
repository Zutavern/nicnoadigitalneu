'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Clock,
  ArrowLeft,
  Share2,
  Linkedin,
  Instagram,
  Globe,
  Twitter,
  Link as LinkIcon,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageEvents } from '@/lib/analytics'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  featuredImageAlt: string | null
  publishedAt: Date | null
  readingTime: number
  viewCount: number
  author: {
    id: string
    name: string
    slug: string
    avatar: string | null
    role: string | null
    bio: string | null
    linkedinUrl: string | null
    instagramUrl: string | null
    twitterUrl: string | null
    websiteUrl: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  readingTime: number
  author: {
    id: string
    name: string
    avatar: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
}

interface BlogPostContentProps {
  post: BlogPost
  relatedPosts: RelatedPost[]
}

export function BlogPostContent({ post, relatedPosts }: BlogPostContentProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [readProgress, setReadProgress] = useState(0)

  // Track blog article view
  useEffect(() => {
    PageEvents.blogArticleViewed(post.slug, post.title)
  }, [post.slug, post.title])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadProgress(progress)
      setShowScrollTop(scrollTop > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-150"
        style={{ width: `${readProgress}%` }}
      />

      <MainNav />

      <main className="flex-1">
        {/* Header */}
        <header className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <span>/</span>
              {post.category && (
                <>
                  <Link
                    href={`/blog?category=${post.category.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {post.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {post.category && (
                <Badge
                  style={{
                    backgroundColor: post.category.color || '#3B82F6',
                    color: '#fff',
                  }}
                >
                  {post.category.name}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {post.readingTime} Min Lesezeit
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(post.publishedAt)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 max-w-4xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground max-w-3xl mb-8">
                {post.excerpt}
              </p>
            )}

            {/* Author */}
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar || ''} />
                <AvatarFallback>{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author.name}</p>
                {post.author.role && (
                  <p className="text-sm text-muted-foreground">{post.author.role}</p>
                )}
              </div>
            </div>
          </motion.div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="container mx-auto px-4 mb-12"
          >
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        )}

        {/* Content Layout */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            {/* Main Content - Professional Magazine Style */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Article Content Styles */}
            <style jsx global>{`
              .article-content {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-size: 1.125rem;
                line-height: 1.8;
                color: hsl(var(--muted-foreground));
              }
              
              /* First paragraph - larger intro text */
              .article-content > p:first-of-type {
                font-size: 1.25rem;
                line-height: 1.7;
                color: hsl(var(--foreground));
                font-weight: 400;
              }
              
              /* Drop cap for first letter */
              .article-content > p:first-of-type::first-letter {
                float: left;
                font-size: 4rem;
                line-height: 0.8;
                padding-right: 0.75rem;
                padding-top: 0.25rem;
                font-weight: 700;
                color: hsl(var(--primary));
                font-family: 'Inter', system-ui, sans-serif;
              }
              
              /* Headings */
              .article-content h1,
              .article-content h2,
              .article-content h3 {
                font-family: 'Inter', system-ui, sans-serif;
                font-weight: 700;
                color: hsl(var(--foreground));
                letter-spacing: -0.025em;
              }
              
              .article-content h1 {
                font-size: 2.5rem;
                margin-top: 3.5rem;
                margin-bottom: 1.5rem;
                line-height: 1.2;
                padding-bottom: 1rem;
                border-bottom: 2px solid hsl(var(--border));
              }
              
              .article-content h2 {
                font-size: 1.875rem;
                margin-top: 3rem;
                margin-bottom: 1.25rem;
                line-height: 1.3;
                position: relative;
                padding-left: 1rem;
              }
              
              .article-content h2::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0.25rem;
                bottom: 0.25rem;
                width: 4px;
                background: hsl(var(--primary));
                border-radius: 2px;
              }
              
              .article-content h3 {
                font-size: 1.5rem;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                line-height: 1.4;
                color: hsl(var(--foreground) / 0.9);
              }
              
              /* Paragraphs */
              .article-content p {
                margin-bottom: 1.75rem;
              }
              
              /* Links */
              .article-content a {
                color: hsl(var(--primary));
                text-decoration: none;
                border-bottom: 1px solid hsl(var(--primary) / 0.3);
                transition: all 0.2s ease;
              }
              
              .article-content a:hover {
                border-bottom-color: hsl(var(--primary));
              }
              
              /* Strong & Emphasis */
              .article-content strong {
                font-weight: 600;
                color: hsl(var(--foreground));
              }
              
              .article-content em {
                font-style: italic;
              }
              
              /* Blockquotes - Premium Magazine Style */
              .article-content blockquote {
                position: relative;
                margin: 3rem 0;
                padding: 2.5rem 2.5rem 2.5rem 3.5rem;
                background: linear-gradient(
                  135deg,
                  hsl(var(--primary) / 0.08) 0%,
                  hsl(var(--primary) / 0.03) 50%,
                  hsl(var(--muted) / 0.2) 100%
                );
                border: none;
                border-radius: 1.5rem;
                font-style: normal;
                font-size: 1.25rem;
                line-height: 1.7;
                color: hsl(var(--foreground));
                box-shadow: 
                  0 4px 6px -1px hsl(var(--primary) / 0.1),
                  0 2px 4px -2px hsl(var(--primary) / 0.1),
                  inset 0 0 0 1px hsl(var(--primary) / 0.1);
              }
              
              /* Large decorative quote mark */
              .article-content blockquote::before {
                content: '"';
                position: absolute;
                top: -0.5rem;
                left: 1.5rem;
                font-size: 6rem;
                font-family: Georgia, 'Times New Roman', serif;
                font-weight: 700;
                color: hsl(var(--primary) / 0.15);
                line-height: 1;
                pointer-events: none;
              }
              
              /* Accent bar on the left */
              .article-content blockquote::after {
                content: '';
                position: absolute;
                left: 0;
                top: 1.5rem;
                bottom: 1.5rem;
                width: 5px;
                background: linear-gradient(
                  180deg,
                  hsl(var(--primary)) 0%,
                  hsl(var(--primary) / 0.5) 100%
                );
                border-radius: 3px;
              }
              
              .article-content blockquote p {
                margin-bottom: 0;
                position: relative;
                z-index: 1;
                font-weight: 500;
              }
              
              .article-content blockquote p:first-child::first-letter {
                float: none;
                font-size: inherit;
                padding: 0;
                color: inherit;
              }
              
              /* Lists */
              .article-content ul,
              .article-content ol {
                margin: 1.75rem 0;
                padding-left: 0;
                list-style: none;
              }
              
              .article-content ul li,
              .article-content ol li {
                position: relative;
                padding-left: 2rem;
                margin-bottom: 0.75rem;
                line-height: 1.7;
              }
              
              .article-content ul li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0.65rem;
                width: 8px;
                height: 8px;
                background: hsl(var(--primary));
                border-radius: 50%;
              }
              
              .article-content ol {
                counter-reset: list-counter;
              }
              
              .article-content ol li {
                counter-increment: list-counter;
              }
              
              .article-content ol li::before {
                content: counter(list-counter);
                position: absolute;
                left: 0;
                top: 0;
                width: 1.5rem;
                height: 1.5rem;
                background: hsl(var(--primary));
                color: hsl(var(--primary-foreground));
                border-radius: 50%;
                font-size: 0.75rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Inter', system-ui, sans-serif;
              }
              
              /* Code */
              .article-content code {
                background: hsl(var(--muted));
                padding: 0.2rem 0.5rem;
                border-radius: 0.375rem;
                font-size: 0.9em;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
              }
              
              .article-content pre {
                background: #1a1a2e;
                color: #e4e4e7;
                padding: 1.5rem;
                border-radius: 1rem;
                margin: 2rem 0;
                overflow-x: auto;
                font-size: 0.9rem;
                line-height: 1.6;
              }
              
              .article-content pre code {
                background: transparent;
                padding: 0;
                font-size: inherit;
              }
              
              /* Images */
              .article-content img {
                border-radius: 1rem;
                margin: 2.5rem 0;
                box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15);
              }
              
              /* Horizontal Rule */
              .article-content hr {
                border: none;
                height: 1px;
                background: linear-gradient(90deg, transparent, hsl(var(--border)), transparent);
                margin: 3rem 0;
              }
              
              /* First child no margin top */
              .article-content > *:first-child {
                margin-top: 0;
              }
              
              /* Spacing after lists */
              .article-content ul + p,
              .article-content ol + p {
                margin-top: 2rem;
              }
              
              .article-content ul + h2,
              .article-content ol + h2 {
                margin-top: 3.5rem;
              }
              
              .article-content ul + h3,
              .article-content ol + h3 {
                margin-top: 3rem;
              }
              
              .article-content blockquote + p {
                margin-top: 2rem;
              }
              
              /* Dark mode adjustments */
              .dark .article-content blockquote {
                background: linear-gradient(
                  135deg,
                  hsl(var(--primary) / 0.12) 0%,
                  hsl(var(--primary) / 0.05) 50%,
                  hsl(var(--muted) / 0.15) 100%
                );
                box-shadow: 
                  0 4px 6px -1px hsl(var(--primary) / 0.15),
                  0 2px 4px -2px hsl(var(--primary) / 0.1),
                  inset 0 0 0 1px hsl(var(--primary) / 0.15);
              }
              
              .dark .article-content blockquote::before {
                color: hsl(var(--primary) / 0.25);
              }
              
              .dark .article-content pre {
                background: #0d0d14;
              }
              
              .dark .article-content img {
                box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
              }
            `}</style>

            {/* Sidebar */}
            <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
              {/* Author Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={post.author.avatar || ''} />
                      <AvatarFallback className="text-lg">
                        {post.author.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{post.author.name}</p>
                      {post.author.role && (
                        <p className="text-sm text-muted-foreground">{post.author.role}</p>
                      )}
                    </div>
                  </div>
                  {post.author.bio && (
                    <p className="text-sm text-muted-foreground mb-4">{post.author.bio}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {post.author.linkedinUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={post.author.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {post.author.instagramUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={post.author.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {post.author.twitterUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={post.author.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {post.author.websiteUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={post.author.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Share */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-4">Teilen</h3>
                  <ShareButtons post={post} />
                </CardContent>
              </Card>

              {/* Tags */}
              {post.tags.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-bold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-muted/30 border-t py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8">Weitere Artikel</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {relatedPost.featuredImage ? (
                          <Image
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                        )}
                        {relatedPost.category && (
                          <Badge
                            className="absolute top-3 left-3"
                            style={{
                              backgroundColor: relatedPost.category.color || '#3B82F6',
                              color: '#fff',
                            }}
                          >
                            {relatedPost.category.name}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <span>{relatedPost.author.name}</span>
                          <span>•</span>
                          <span>{relatedPost.readingTime} Min</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <section className="container mx-auto px-4 py-12">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Blog
            </Link>
          </Button>
        </section>
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}

// Share buttons component that handles client-side URL
function ShareButtons({ post }: { post: BlogPost }) {
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: currentUrl,
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Teilen fehlgeschlagen:', error)
        }
      }
    } else {
      await navigator.clipboard.writeText(currentUrl)
      toast.success('Link kopiert!')
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(currentUrl)
    toast.success('Link kopiert!')
  }

  // Don't render share links until we have the URL (to avoid hydration mismatch)
  if (!currentUrl) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled>
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" disabled>
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" disabled>
          <Twitter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" disabled>
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" asChild>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="outline" size="icon" asChild>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="outline" size="icon" onClick={handleCopyLink}>
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

