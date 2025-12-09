'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, ArrowRight, BookOpen } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  readingTime: number
  isFeatured: boolean
  author: {
    id: string
    name: string
    slug: string
    avatar: string | null
    role: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  color: string | null
  _count: {
    posts: number
  }
}

interface BlogPageConfig {
  heroBadgeText: string | null
  heroTitle: string
  heroDescription: string | null
  featuredTitle: string | null
  showCategoryFilter: boolean
  allCategoriesLabel: string
}

interface BlogContentProps {
  posts: BlogPost[]
  featuredPost: BlogPost | null
  categories: BlogCategory[]
  config: BlogPageConfig
}

export function BlogContent({ posts, featuredPost, categories, config }: BlogContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredPosts = activeCategory
    ? posts.filter((p) => p.category?.slug === activeCategory)
    : posts

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground)) 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              {config.heroBadgeText && (
                <Badge variant="secondary" className="mb-6 text-sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {config.heroBadgeText}
                </Badge>
              )}
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                  {config.heroTitle}
                </span>
              </h1>
              {config.heroDescription && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {config.heroDescription}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="container mx-auto px-4 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {config.featuredTitle && (
                <p className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">
                  {config.featuredTitle}
                </p>
              )}
              <Link href={`/blog/${featuredPost.slug}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[21/9]">
                  {featuredPost.featuredImage ? (
                    <Image
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    {featuredPost.category && (
                      <Badge
                        className="w-fit mb-4"
                        style={{
                          backgroundColor: featuredPost.category.color || '#3B82F6',
                          color: '#fff',
                        }}
                      >
                        {featuredPost.category.name}
                      </Badge>
                    )}
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-white/80 text-lg mb-6 max-w-2xl line-clamp-2">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border-2 border-white/20">
                        <AvatarImage src={featuredPost.author.avatar || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {featuredPost.author.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-white/90">
                        <p className="font-medium">{featuredPost.author.name}</p>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span>{formatDate(featuredPost.publishedAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {featuredPost.readingTime} Min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </section>
        )}

        {/* Category Filter */}
        {config.showCategoryFilter && categories.length > 0 && (
          <section className="container mx-auto px-4 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              <Button
                variant={activeCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="rounded-full"
              >
                {config.allCategoriesLabel}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category.slug)}
                  className="rounded-full"
                  style={
                    activeCategory === category.slug
                      ? { backgroundColor: category.color || undefined }
                      : undefined
                  }
                >
                  {category.name}
                  <span className="ml-1 text-muted-foreground">
                    ({category._count.posts})
                  </span>
                </Button>
              ))}
            </motion.div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="container mx-auto px-4 pb-24">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Noch keine Artikel in dieser Kategorie.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index % 6) }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                        )}
                        {post.category && (
                          <Badge
                            className="absolute top-4 left-4"
                            style={{
                              backgroundColor: post.category.color || '#3B82F6',
                              color: '#fff',
                            }}
                          >
                            {post.category.name}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 flex flex-col">
                        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>
                        )}
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.author.avatar || ''} />
                              <AvatarFallback className="text-xs">
                                {post.author.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{post.author.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(post.publishedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {post.readingTime} Min
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="bg-muted/30 border-y">
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold mb-4">
                Bleib auf dem Laufenden
              </h2>
              <p className="text-muted-foreground mb-8">
                Erhalte die neuesten Tipps und Insights direkt in dein Postfach.
              </p>
              <Button size="lg" asChild>
                <Link href="/registrieren">
                  Jetzt Mitglied werden
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


