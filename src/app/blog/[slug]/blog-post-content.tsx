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
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-6 prose-h1:leading-tight prose-h1:border-b prose-h1:border-border prose-h1:pb-4
                prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:leading-snug
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-snug prose-h3:text-foreground/90
                prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:mb-6
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:pr-4
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-code:font-mono
                prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-xl prose-pre:my-8
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:text-muted-foreground
                prose-ul:my-6 prose-ul:space-y-2
                prose-ol:my-6 prose-ol:space-y-2
                prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:pl-2
                prose-hr:my-12 prose-hr:border-border
                [&>*:first-child]:mt-0
                [&>ul+p]:mt-8 [&>ol+p]:mt-8
                [&>p+ul]:mt-4 [&>p+ol]:mt-4
                [&>ul+h2]:mt-12 [&>ol+h2]:mt-12 [&>ul+h3]:mt-10 [&>ol+h3]:mt-10
                [&>blockquote+p]:mt-8 [&>blockquote+h2]:mt-12 [&>blockquote+h3]:mt-10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

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

